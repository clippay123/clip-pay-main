import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ReferralClient } from "./client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReferPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("User error:", userError)
    redirect("/signin")
  }

  // Get user profile with type
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("user_id", user.id)
    .single()

  if (profileError || !profile) {
    console.error("Profile error:", profileError)
    redirect("/signin")
  }

  if (profile.user_type !== "creator") {
    redirect("/dashboard")
  }

  // Get creator's Stripe account status
  const { data: creator } = await supabase
    .from("creators")
    .select("paypal_connected, totalPaidReferralEarnings")
    .eq("user_id", user.id)
    .single()

  const hasPayPalAccount = creator?.paypal_connected

  // Get user's referral code
  let { data: referralData } = await supabase
    .from("referrals")
    .select("code")
    .eq("profile_id", user.id)
    .single()

  // If no referral code exists, create one
  if (!referralData) {
    const code = `CREATOR${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const { data: newCode, error: createError } = await supabase
      .from("referrals")
      .insert([
        {
          profile_id: user.id,
          code,
        },
      ])
      .select()
      .single()

    if (createError) {
      console.error("Error creating referral code:", createError)
      return <div>Error creating referral code</div>
    }

    referralData = newCode
  }

  // Get referred creators
  const { data: referredCreators, error: referredError } = await supabase
    .from("profiles")
    .select(
      `
    user_id,
    organization_name,
    created_at,
    creators!inner (
      user_id,
      stripe_account_id,
      stripe_account_status,
      total_views,
      totalPaidReferralEarnings,
      submissions (
        creator_amount,
        status
      )
    )
  `
    )
    .eq("referred_by", user.id)
  const referralCommissionPerThousandViews = 0.3 // 0.3 cents per 1,000 views

  const referredCreatorsWithEarnings =
    referredCreators?.map((creator: any) => {
      // Get total views from the creators table
      // console.log("creat",creator.creators)
      const totalViews = creator.creators?.total_views || 0

      // Calculate referral earnings based on creators' total views
      const referralEarnings =
        (totalViews / 1000) * referralCommissionPerThousandViews

      // console.log("referral earning",referralEarnings);
      return {
        user_id: creator.user_id,
        organization_name: creator.organization_name,
        created_at: creator.created_at,
        totalPaidReferralEarnings: creator.totalPaidReferralEarnings,
        total_views: totalViews, // Take views from creators table
        referral_earned: referralEarnings.toFixed(2), // Format to 2 decimal places
        creators: [
          {
            total_earned: null, // Placeholder value
            total_views: totalViews, // Use total views from creators table
          },
        ],
      }
    }) || []

  // Calculate total re
  // ferral earnings for the user
  const totalPaidReferralEarnings = creator?.totalPaidReferralEarnings || 0
  const totalReferralEarnings = referredCreatorsWithEarnings.reduce(
    (sum, creator) => {
      return sum + parseFloat(creator.referral_earned)
    },
    0
  )

  const availableReferralEarnings = Math.max(
    totalReferralEarnings - totalPaidReferralEarnings,
    0
  )
  // console.log("total ",totalReferralEarnings);

  return (
    <div className="min-h-screen bg-[#F2F6FA]">
      <DashboardHeader userType="creator" email={user.email || ""} />
      <main className="lg:ml-72 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
          <div className="mx-auto">
            <ReferralClient
              referralCode={referralData?.code || ""}
              referredCreators={referredCreatorsWithEarnings}
              hasPayPalAccount={hasPayPalAccount}
              totalReferralEarnings={parseFloat(
                availableReferralEarnings.toFixed(2)
              )}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
