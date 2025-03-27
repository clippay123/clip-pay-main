import { createServerSupabaseClient } from "@/lib/supabase-server"
import { CampaignWithSubmissions } from "./page"

export const getBrandCampaigns = async (): Promise<
  CampaignWithSubmissions[]
> => {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No user found")
  }

  // First, check if the user is a brand owner
  const { data: brand } = await supabase
    .from("brands")
    .select("id, user_id")
    .eq("user_id", user.id)
    .single()

  let brandUserId = brand?.user_id || null

  // If the user is a brand team member, get the brand_id
  if (!brandUserId) {
    const { data: brandTeamMember } = await supabase
      .from("brand_team_members")
      .select("brand_id")
      .eq("user_id", user.id)
      .single()

    if (brandTeamMember) {
      // Get the actual brand's user_id from brands table
      const { data: brandData } = await supabase
        .from("brands")
        .select("user_id")
        .eq("id", brandTeamMember.brand_id)
        .single()

      brandUserId = brandData?.user_id || null
    }
  }

  if (!brandUserId) {
    throw new Error("Brand or profile not found")
  }

  // Get all campaigns where the user_id matches the brandUserId
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      submissions (
        id,
        campaign_id,
        user_id,
        video_url,
        file_path,
        transcription,
        status,
        created_at,
        views,
        previous_views,
        auto_moderation_result,
        creator:creators!inner (
          profile:profiles!inner (
            organization_name
          )
        )
      )
    `
    )
    .eq("user_id", brandUserId) // Filter campaigns by the brand's user_id
    .order("created_at", { ascending: false })

  console.log("dAta", campaigns)
  if (error) {
    console.error("Brand campaigns error:", error)
    throw error
  }

  if (!campaigns) {
    return []
  }

  return campaigns.map(
    (campaign): CampaignWithSubmissions => ({
      id: campaign.id,
      title: campaign.title,
      budget_pool: String(campaign.budget_pool),
      remaining_budget: String(campaign.remaining_budget),
      rpm: String(campaign.rpm),
      guidelines: campaign.guidelines || "",
      video_outline: campaign.video_outline,
      status: campaign.status || "",
      brand: {
        name:
          campaign.submissions?.[0]?.creator?.profile?.organization_name || "",
        payment_verified: false,
      },
      submission: null,
      submissions: (campaign.submissions || []).map((submission: any) => ({
        id: submission.id,
        video_url: submission.video_url || "",
        file_path: submission.file_path,
        transcription: submission.transcription || "",
        status: submission.status,
        campaign_id: campaign.id,
        creator_id: submission.user_id,
        created_at: submission.created_at,
        views: submission.views || 0,
        previous_views: submission.previous_views,
        creator: {
          full_name: submission.creator?.profile?.organization_name || "",
        },
        auto_moderation_result: submission.auto_moderation_result,
      })),
      activeSubmissionsCount: (campaign.submissions || []).filter(
        (s: any) => s.status === "active"
      ).length,
    })
  )
}

export async function getBrandCampaigns1(brandId: string) {
  const supabase = await createServerSupabaseClient()

  // Fetch the brand details (only for owners)
  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("*")
    .eq("id", brandId)
    .single()

  // Fetch campaigns even if brand is not found (for brand_team users)
  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select("*, brand:brands(name, payment_verified)")
    .eq("brand_id", brandId)

  if (campaignsError) {
    throw new Error("Error fetching campaigns: " + campaignsError.message)
  }

  // ✅ Only enforce brand profile check for owners (not team members)
  if (!brand && campaigns.length === 0) {
    throw new Error("Brand or campaigns not found")
  }

  return campaigns
}
