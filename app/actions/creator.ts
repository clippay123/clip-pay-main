"use server"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/supabase"
import { TikTokAPI } from "@/lib/tiktok"
import { YouTubeAPI } from "@/lib/youtube"
import { getInstagramReelViews } from "@/lib/instagram"

interface ReferralData {
  profile_id: string
}

export async function updateCreatorProfile(organizationName: string) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "User not found" }
  }

  try {
    // Update profile with organization name
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        organization_name: organizationName,
      } satisfies Database["public"]["Tables"]["profiles"]["Update"])
      .eq("user_id", user.id)

    if (updateError) throw updateError

    return { success: true }
  } catch (error) {
    console.error("Error updating creator profile:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    }
  }
}

async function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Request timed out")),
      timeoutMs
    )
    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout))
  })
}
export async function updateSubmissionVideoUrl(
  submissionId: string | string[],
  videoUrls: string | string[]
): Promise<{ success: boolean; views?: number; error?: string }> {
  if (Array.isArray(submissionId)) {
    return Promise.all(
      submissionId.map((id) => updateSubmissionVideoUrl(id, videoUrls))
    )
      .then((results) => ({
        success: results.every((r) => r.success),
        views: results.reduce((sum, r) => sum + (r.views || 0), 0),
      }))
      .catch((error) => ({
        success: false,
        error: error.message || "An error occurred",
      }))
  }

  if (typeof videoUrls === "string") {
    videoUrls = [videoUrls] // Convert single string to array
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    // Fetch the current views and previous views history
    const { data: existingSubmission, error: fetchError } = await supabase
      .from("submissions")
      .select("views, previous_views")
      .eq("id", submissionId)
      .eq("user_id", user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching submission:", fetchError)
      throw fetchError
    }

    let previousViews = existingSubmission?.previous_views || []
    let currentViews = existingSubmission?.views || 0
    let validUrls: string[] = []
    let platforms: string[] = []
    let totalViews = 0

    for (const videoUrl of videoUrls) {
      if (!videoUrl.trim()) continue

      const isTikTok = videoUrl.includes("tiktok.com")
      const isYouTube =
        videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
      const isInstagram = videoUrl.includes("instagram.com/reel/")

      if (!isTikTok && !isYouTube && !isInstagram) {
        return {
          success: false,
          error: "Invalid video URL. Use TikTok, YouTube, or Instagram.",
        }
      }

      let videoInfo = null

      if (isTikTok) {
        platforms.push("TikTok")
        const { data: creator } = await supabase
          .from("creators")
          .select("tiktok_access_token")
          .eq("user_id", user.id)
          .single()

        if (!creator?.tiktok_access_token) {
          return { success: false, error: "TikTok not connected" }
        }

        const tiktokApi = new TikTokAPI()
        videoInfo = await tiktokApi.getVideoInfo(
          videoUrl,
          creator.tiktok_access_token,
          user.id
        )
      } else if (isYouTube) {
        platforms.push("YouTube")
        videoInfo = await YouTubeAPI.getVideoInfo(videoUrl)
      } else if (isInstagram) {
        platforms.push("Instagram")
        const { data: creator } = await supabase
          .from("creators")
          .select("instagram_username")
          .eq("user_id", user.id)
          .single()

        if (!creator?.instagram_username) {
          return { success: false, error: "Instagram not connected" }
        }

        const views = await fetchWithTimeout(
          () => getInstagramReelViews(videoUrl, creator.instagram_username),
          100000 // 10 seconds timeout
        )
        videoInfo = { views }
      }

      if (videoInfo) {
        totalViews += videoInfo.views || 0
        validUrls.push(videoUrl)
      }
    }

    if (validUrls.length === 0) {
      return { success: false, error: "No valid video URLs provided." }
    }

    // Append the current views with a timestamp (limit to last 10 records)
    previousViews = [
      ...previousViews,
      { views: currentViews, date: new Date().toISOString() },
    ].slice(-10) // Keep only the last 10 records

    // Update the submission with new views and previous views history
    const { data: updatedSubmission, error: updateError } = await supabase
      .from("submissions")
      .update({
        video_urls: validUrls,
        previous_views: previousViews, // Store previous views as JSON array
        views: totalViews, // Update to new views
        platforms: platforms,
      })
      .eq("id", submissionId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return { success: true, views: totalViews }
  } catch (error) {
    console.error("Error in updateSubmissionVideoUrl:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update submission",
    }
  }
}
