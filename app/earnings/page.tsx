import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { EarningsClient } from "./client"
import { DashboardHeader } from "@/components/dashboard-header"
import { createServerSupabaseClient } from "@/lib/supabase-server"

type ProfileResponse = {
  user_type: string
  organization_name: string
  creator: {
    stripe_account_id: string | null
    stripe_account_status: string | null
    paypal_connected: boolean | false
    paypal_email: string | null
  }
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function EarningsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile to check if they're a creator
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      user_type,
      organization_name,
      creator:creators (
        paypal_connected,
        paypal_email
      )
    `
    )
    .eq("user_id", user.id)
    .single<ProfileResponse>()

  if (!profile || profile.user_type !== "creator") {
    redirect("/dashboard")
  }

  // Get recent submissions with earnings
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select(
      `
      *,
      campaign:campaigns (
        id,
        title,
        brand:brands!inner (
          profile:profiles!inner (
            organization_name
          )
        )
      )
    `
    )
    .eq("user_id", user.id)
    .in("status", ["fulfilled", "approved", "pending", "paid"])
    .order("created_at", { ascending: false })
    .limit(10)

  if (submissionsError) {
    console.error("Error fetching submissions:", submissionsError)
  }

  // Get total earned from all approved and fulfilled submissions
  const { data: totalEarnedData } = await supabase
    .from("submissions")
    .select("creator_amount")
    .eq("user_id", user.id)
    .in("status", ["approved", "fulfilled"])

  const totalEarned =
    totalEarnedData?.reduce((sum, sub) => sum + (sub.creator_amount || 0), 0) ||
    0

  // Get available for payout (approved submissions that haven't been paid out)
  const { data: availableData } = await supabase
    .from("submissions")
    .select("creator_amount, paymentDate")
    .eq("user_id", user.id)
    .eq("status", "paid")

  console.log(availableData)

  const today = new Date()

  // ✅ Calculate availableForPayout (Total Paid Submissions)
  const availableForPayout =
    availableData?.reduce((sum, sub) => sum + (sub.creator_amount || 0), 0) || 0

  // ✅ Calculate eligibleForCashout (Only Submissions That Are 2+ Days Old)
  const eligibleForCashout =
    availableData?.filter((sub) => {
      if (!sub.paymentDate) return false // Skip if no payment date
      const paymentDate = new Date(sub.paymentDate)
      paymentDate.setDate(paymentDate.getDate() + 2) // Add 2 days

      return today >= paymentDate // Allow cashout only after 2 days
    }) || []

  // ✅ Determine if cashout is available
  const isCashoutAvailable = eligibleForCashout.length > 0

  console.log({ availableForPayout })
  console.log("cash", isCashoutAvailable)
  // Get pending earnings (pending submissions)
  const { data: pendingData } = await supabase
    .from("submissions")
    .select("creator_amount")
    .eq("creator_id", user.id)
    .eq("status", "pending")

  const pendingEarnings =
    pendingData?.reduce((sum, sub) => sum + (sub.creator_amount || 0), 0) || 0

  return (
    <div className="min-h-screen bg-[#F2F6FA]">
      <DashboardHeader
        userType="creator"
        email={user.email || ""}
        organization_name={profile.organization_name}
      />
      <main className="lg:ml-72 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
          <div className="mx-auto">
            <div className="space-y-6">
              <EarningsClient
                totalEarned={totalEarned}
                availableForPayout={availableForPayout}
                pendingEarnings={pendingEarnings}
                submissions={
                  submissions?.map((submission) => ({
                    id: submission.id,
                    campaign_title:
                      submission.campaign?.title || "Unknown Campaign",
                    brand_name:
                      submission.campaign?.brand?.profile?.organization_name ||
                      "Unknown Brand",
                    earned: submission.creator_amount || 0,
                    status: submission.status,
                    created_at: submission.created_at,
                  })) || []
                }
                hasPayPalAccount={profile.creator.paypal_connected}
                paypalAccountStatus={
                  profile.creator.paypal_connected
                    ? "Connected"
                    : "Not Connected"
                }
                isCashoutAvailable={isCashoutAvailable}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
