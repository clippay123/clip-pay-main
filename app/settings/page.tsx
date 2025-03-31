import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { SettingsForm } from "./form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  // Get user profile to check type
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, user_type, organization_name")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    redirect("/signin")
  }

  // Get creator's Stripe account status if they are a creator
  let hasStripeAccount = false
  let autoApprovalEnabled = false
  let tiktokConnected = false
  let instaConnected = false
  let paypalConnected = false
  if (profile.user_type === "creator") {
    const { data: creator } = await supabase
      .from("creators")
      .select(
        "stripe_account_id, stripe_account_status, tiktok_connected,instagram_username, paypal_connected"
      )
      .eq("user_id", user.id)
      .single()

    // Only consider the account connected if it's active
    hasStripeAccount = creator?.stripe_account_status === "active"
    tiktokConnected = creator?.tiktok_connected ?? false
    instaConnected = !!creator?.instagram_username
    paypalConnected = creator?.paypal_connected ?? false
  } else if (profile.user_type === "brand") {
    // Get brand's auto-approval setting
    const { data: brand } = await supabase
      .from("brands")
      .select("auto_approval_enabled")
      .eq("user_id", user.id)
      .single()

    autoApprovalEnabled = brand?.auto_approval_enabled || false
  }

  return (
    <div className="min-h-screen bg-[#F2F6FA]">
      <DashboardHeader
        userType={profile.user_type as "creator" | "brand"}
        email={user.email || ""}
        organization_name={profile.organization_name}
      />

      <main className="lg:ml-72 min-h-screen">
        <div className="w-full mx-auto px-4 py-8 lg:py-8 pt-20 lg:pt-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">
                  Account Settings
                </h1>
                <p className="text-zinc-600">
                  Manage your account settings and preferences
                </p>
              </div>

              <SettingsForm
                email={user.email || ""}
                userType={profile.user_type as "creator" | "brand"}
                hasStripeAccount={hasStripeAccount}
                autoApprovalEnabled={autoApprovalEnabled}
                tittokConnected={tiktokConnected}
                instaConnected={instaConnected}
                hasPaypalAccount={paypalConnected}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
