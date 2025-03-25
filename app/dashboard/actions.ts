"use server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { writeFile, readFile } from "fs/promises"
import { exec } from "child_process"
import { promisify } from "util"
import { join } from "path"
import { unlink } from "fs/promises"
import { Deepgram } from "@deepgram/sdk"
import { Database } from "@/types/supabase"
import { updateSubmissionVideoUrl as updateVideo } from "@/app/actions/creator"
import { evaluateSubmission } from "@/lib/openai"
import { TikTokAPI } from "@/lib/tiktok"
import { CampaignWithSubmissions } from "@/types/campaigns"
import { CreatorCampaign } from "./creator-campaigns"
import { Submission } from "./creator-campaigns"
import os from "os"

import fs from "fs"
const execAsync = promisify(exec)

// Ensure DEEPGRAM_API_KEY is available
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY
if (!DEEPGRAM_API_KEY) {
  throw new Error("DEEPGRAM_API_KEY is not set in environment variables")
}

const deepgram = new Deepgram(DEEPGRAM_API_KEY)

interface ProfileWithBrand {
  user_id: string
  brands: {
    id: string
  }[]
}

interface Campaign {
  id: string
  title: string
  budget_pool: string
  rpm: string
  guidelines: string | null
  video_outline: string | null
  status: string | null
  brand: {
    name: string
    payment_verified: boolean
  }
  submission: {
    id: string
    status: string
    video_url: string | null
    file_path: string | null
    campaign_id: string
  } | null
}

type PollSubmissionResponse = {
  id: string
  video_url: string | null
  file_path: string | null
  transcription: string | null
  status: string
  created_at: string
  views: number
  user_id: string
  campaign_id: string
  creator: {
    organization_name: string | null
    email: string | null
  }
}

export async function approveSubmission(submissionId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Get the submission with campaign details
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select(
        `
        *,
        campaign:campaigns (
          title
        )
      `
      )
      .eq("id", submissionId)
      .single()

    if (submissionError || !submission) {
      console.error("Error fetching submission:", submissionError)
      throw submissionError || new Error("Submission not found")
    }

    // Get payout duration from env (default to 7 days for production)
    const payoutDurationMinutes = Number(
      process.env.NEXT_PUBLIC_PAYOUT_DURATION_MINUTES || "10080"
    )

    // Calculate due date
    const payoutDueDate = new Date()
    payoutDueDate.setMinutes(payoutDueDate.getMinutes() + payoutDurationMinutes)
    // Update submission status
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: "approved",
        payout_due_date: payoutDueDate.toISOString(),
        payout_status: "pending",
      })
      .eq("id", submissionId)

    if (updateError) {
      console.error("Error approving submission:", updateError)
      throw updateError
    }

    // Create a notification for the creator
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        recipient_id: submission.user_id,
        type: "submission_approved",
        title: "Submission Approved",
        message: `Your submission for campaign "${submission.campaign?.title}" has been approved!`,
        metadata: {
          submission_id: submissionId,
          campaign_title: submission.campaign?.title,
        },
      })

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
      // Don't throw here, as the submission was already approved
    }

    revalidatePath("/dashboard")
    return submission
  } catch (error) {
    console.error("Error in approveSubmission:", error)
    throw error
  }
}

export async function rejectSubmission(submissionId: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get the submission with campaign details
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select(
      `
      *,
      campaign:campaigns (
        title
      )
    `
    )
    .eq("id", submissionId)
    .single()

  if (submissionError || !submission) {
    console.error("Error fetching submission:", submissionError)
    throw submissionError || new Error("Submission not found")
  }

  // Update the submission status
  const { error: updateError } = await supabase
    .from("submissions")
    .update({ status: "rejected" })
    .eq("id", submissionId)

  if (updateError) {
    console.error("Error rejecting submission:", updateError)
    throw updateError
  }

  // Create a notification for the creator
  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      recipient_id: submission.user_id,
      type: "submission_rejected",
      title: "Submission Rejected",
      message: `Your submission for campaign "${submission.campaign?.title}" was not approved.`,
      metadata: {
        submission_id: submissionId,
        campaign_title: submission.campaign?.title,
      },
    })

  if (notificationError) {
    console.error("Error creating notification:", notificationError)
    // Don't throw here, as the submission was already rejected
  }

  revalidatePath("/dashboard")
  return submission
}

export async function createCampaign({
  title,
  budget_pool,
  rpm,
  guidelines,
  video_outline,
  referral_bonus_rate,
  brandId,
  community_link,
  example_video,
  google_drive_link,
}: {
  title: string
  budget_pool: string
  rpm: string
  guidelines: string
  video_outline: string
  referral_bonus_rate: string
  brandId: string
  community_link: string
  example_video: string
  google_drive_link: string
}) {
  const supabase = await createServerSupabaseClient()

  // Check if the brand exists and get its user_id
  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("user_id")
    .eq("id", brandId)
    .single()

  if (brandError || !brand) {
    console.error("Invalid brandId, brand does not exist:", brandId)
    throw new Error("Invalid brandId, brand does not exist")
  }

  const brandOwnerId = brand.user_id // Get the brand's user_id

  // Convert string values to numbers or null
  const numericBudgetPool = budget_pool.trim() ? Number(budget_pool) : null
  const numericRpm = rpm.trim() ? Number(rpm) : null
  const numericReferralRate = referral_bonus_rate.trim()
    ? Number(referral_bonus_rate)
    : 0.1 // Default to 0.1

  // Validate numbers
  if (
    numericBudgetPool === null ||
    isNaN(numericBudgetPool) ||
    numericBudgetPool <= 0
  ) {
    throw new Error("Invalid budget pool amount")
  }

  if (numericRpm === null || isNaN(numericRpm) || numericRpm <= 0) {
    throw new Error("Invalid RPM amount")
  }

  if (
    isNaN(numericReferralRate) ||
    numericReferralRate < 0 ||
    numericReferralRate > 100
  ) {
    throw new Error("Invalid referral bonus rate")
  }

  try {
    // Insert into Supabase
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        title,
        budget_pool: numericBudgetPool,
        rpm: numericRpm,
        guidelines,
        video_outline,
        referral_bonus_rate: numericReferralRate,
        user_id: brandOwnerId, // Store brand.user_id in campaigns
        status: "active",
        remaining_budget: numericBudgetPool,
        community_link,
        example_video,
        google_drive_link,
      })
      .select()
      .single()

    if (campaignError) {
      console.error("Error creating campaign:", campaignError)
      throw campaignError
    }

    console.log("Campaign created successfully:", campaign)

    return { success: true, campaign }
  } catch (error) {
    console.error("Error in createCampaign:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create campaign",
    }
  }
}

async function processVideo(videoPath: string, userId: string) {
  try {
    // Use a proper temp directory
    const tempDir = os.tmpdir() // Windows-compatible temp folder
    const audioFileName = `${userId}_${Date.now()}.wav`
    const audioPath = join(tempDir, audioFileName)

    // Construct FFmpeg command
    const ffmpegCommand = `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 44100 -ac 2 -af "volume=1.5" "${audioPath}"`

    console.log("Running FFmpeg command:", ffmpegCommand)
    await execAsync(ffmpegCommand)

    console.log("Audio extraction successful:", audioPath)
    return { audioPath, transcription: "Sample transcription placeholder" }
  } catch (error) {
    console.error("Error processing video with FFmpeg:", error)
    throw new Error(
      `FFmpeg processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}
export async function submitVideo({
  campaignId,
  videoUrl,
  file,
}: {
  campaignId: string
  videoUrl?: string
  file?: File
}): Promise<{ error?: string; submission: Submission | null }> {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    // Ensure user is a creator type
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("user_id", user.id)
      .single()

    if (userProfile?.user_type !== "creator") {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ user_type: "creator" })
        .eq("user_id", user.id)

      if (updateError) {
        throw new Error("Failed to update profile type")
      }
    }

    let finalVideoUrl = videoUrl
    let filePath = null
    let transcription = null

    // If a file was provided, process it
    if (file) {
      // First save the file temporarily
      const tempDir = os.tmpdir()
      const tempVideoPath = join(
        tempDir,
        `${user.id}_${Date.now()}_${file.name}`
      )
      await writeFile(tempVideoPath, Buffer.from(await file.arrayBuffer()))

      // Process the video to extract audio and get transcription
      const processedData = await processVideo(tempVideoPath, user.id)
      transcription = processedData.transcription

      // Clean up the temporary video file
      await unlink(tempVideoPath)

      // Upload the original video to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`
      filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(filePath)

      finalVideoUrl = publicUrl
    }

    // Create the submission with transcription
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        campaign_id: campaignId,
        user_id: user.id,
        video_url: videoUrl || null, // Only set if explicitly provided
        file_path: filePath,
        transcription,
        status: "pending",
        created_at: new Date().toISOString(),
        views: 0,
      })
      .select(
        `
        id,
        status,
        video_url,
        file_path,
        campaign_id,
        user_id,
        created_at,
        views,
        transcription,
        creator:creators!inner (
          profiles (
            organization_name
          )
        )
        `
      )
      .single()

    if (submissionError) {
      throw submissionError
    }

    // Transform the submission to match the expected type
    const transformedSubmission: Submission = {
      id: submission.id,
      status: submission.status,
      video_url: submission.video_url,
      file_path: submission.file_path,
      campaign_id: submission.campaign_id,
      user_id: submission.user_id,
      created_at: submission.created_at,
      views: submission.views,
      transcription: submission.transcription,
      creator: {
        organization_name:
          submission.creator[0]?.profiles[0]?.organization_name || null,
      },
      video_urls: null,
      platform: null, // ✅ Add platform property to match the Submission type
    }

    revalidatePath("/dashboard")
    return { submission: transformedSubmission }
  } catch (error) {
    console.error("Error in submitVideo:", error)
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      submission: null,
    }
  }
}

export async function getCreatorCampaigns(): Promise<CreatorCampaign[]> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return []
  }

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      brand:brands!inner (
        payment_verified,
        brand_profile:profiles!inner (
          organization_name
        )
      ),
      submission:submissions!left (
        id,
        status,
        video_url,
        file_path,
        campaign_id,
        user_id,
        created_at,
        transcription,
        views,
        creator:profiles!inner (
          organization_name
        )
      )
    `
    )
    .eq("status", "active")
    .eq("submission.user_id", user.id)
    .order("created_at", { ascending: false })

  if (!campaigns) return []

  const transformedCampaigns = campaigns.map((campaign) => {
    // Calculate remaining budget
    const totalSpent =
      campaign.submissions
        ?.filter(
          (submission: { status: string }) => submission.status === "fulfilled"
        )
        .reduce(
          (sum: number, submission: { payout_amount: string | null }) =>
            sum + (Number(submission.payout_amount) || 0),
          0
        ) || 0

    const remainingBudget = Number(campaign.budget_pool) - totalSpent

    // Filter submissions to only include the current user's submission
    const userSubmission = campaign.submission?.find(
      (sub: any) => sub.user_id === user.id
    )

    return {
      id: campaign.id,
      title: campaign.title,
      budget_pool: String(campaign.budget_pool),
      remaining_budget: remainingBudget,
      rpm: String(campaign.rpm),
      guidelines: campaign.guidelines,
      video_outline: campaign.video_outline,
      community_link: campaign.community_link,
      example_video: campaign.example_video,
      google_drive_link: campaign.google_drive_link,
      status: campaign.status,
      brand: {
        name:
          campaign.brand?.brand_profile?.organization_name || "Unknown Brand",
        payment_verified: !!campaign.brand?.payment_verified,
      },
      submission: userSubmission || null,
      has_insufficient_budget: remainingBudget < 10,
    }
  })

  return transformedCampaigns
}

export async function pollNewSubmissions(campaignIds: string[]) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      id,
      video_url,
      file_path,
      transcription,
      status,
      created_at,
      views,
      user_id,
      campaign_id,
      creator:creators(
        profiles (
          organization_name
        )
      )
    `
    )
    .eq("status", "pending")
    .in("campaign_id", campaignIds)
    .order("created_at", { ascending: false })
    .limit(1)
    .returns<PollSubmissionResponse[]>()

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  revalidatePath("/dashboard")
  return { success: true }
}

// Update the checkForNotifications function to use the notifications table
export const checkForNotifications = async () => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", user.id)
    .eq("read", false)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return notifications
}

// Update the markNotificationAsSeen function to use the notifications table
export const markNotificationAsSeen = async (notificationId: string) => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("recipient_id", user.id)

  if (error) {
    throw error
  }
}

// Create a new server action that wraps the original function
export async function updateSubmissionVideoUrl(
  submissionId: string[],
  videoUrl: string
) {
  return updateVideo(submissionId, videoUrl)
}

export async function updateCampaignViews(
  campaignId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()
  const tiktokApi = new TikTokAPI()

  try {
    // Get all submissions for this campaign
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select(
        `
        id,
        video_url,
        creator:creators!inner (
          tiktok_access_token
        )
      `
      )
      .eq("campaign_id", campaignId)
      .eq("status", "approved")

    if (submissionsError) throw submissionsError

    // Update views for each submission
    for (const submission of submissions || []) {
      if (submission.video_url && submission.creator[0]?.tiktok_access_token) {
        try {
          const views = await tiktokApi.getVideoInfo(
            submission.video_url,
            submission.creator[0].tiktok_access_token
          )

          // Update only the views for this submission
          await supabase
            .from("submissions")
            .update({ views })
            .eq("id", submission.id)
        } catch (error) {
          console.error("Error updating views for submission:", error)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateCampaignViews:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An error occurred while updating views",
    }
  }
}

export async function reportClient(
  campaignId: string,
  title: string,
  reason: string
) {
  const supabase = await createServerSupabaseClient()

  // Get the logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("Error fetching user:", authError?.message)
    throw new Error("Not authenticated")
  }

  // Find the reported user from submissions where status is "approved"
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("user_id")
    .eq("campaign_id", campaignId)
    .eq("status", "approved")
    .single()

  if (submissionError || !submission) {
    console.error("No approved submission found:", submissionError?.message)
    throw new Error("No approved submission found")
  }

  const reportedUserId = submission.user_id

  // Insert report into Supabase
  const { error } = await supabase.from("report").insert([
    {
      campaign_id: campaignId,
      reported_user_id: reportedUserId, // The user who submitted the approved submission
      reported_by_user_id: user.id, // The logged-in user's ID
      title: title.trim(),
      reason: reason.trim(),
    },
  ])

  if (error) {
    console.error("Error reporting client:", error.message)
    throw new Error("Failed to report client")
  }

  return { success: true }
}

export async function checkIfAlreadyReported(campaignId: string) {
  const supabase = await createServerSupabaseClient()

  // Find the reported user from submissions where status is "approved"

  // Check if the user has already reported this campaign
  const { data: existingReport, error: reportError } = await supabase
    .from("report")
    .select("id")
    .eq("campaign_id", campaignId)
    .single()
  console.log("existing", existingReport)

  return !!existingReport // Returns true if report exists, otherwise false
}

export async function hasApprovedOrPaidSubmission(campaignId: string) {
  const supabase = await createServerSupabaseClient()

  // Check if the campaign has at least one approved or paid submission
  const { data, error } = await supabase
    .from("submissions")
    .select("id")
    .eq("campaign_id", campaignId)
    .in("status", ["approved", "paid"])
    .limit(1) // We only need to check if one exists

  console.log("data", data)
  if (error) {
    console.error("Error checking submissions:", error.message)
    return false
  }

  return data.length > 0 // True if at least one submission exists
}
