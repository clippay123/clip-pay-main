"use server"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createClient } from "@supabase/supabase-js"

// Fetch all reports
export async function fetchReports() {
  const supabase = await createServerSupabaseClient()

  const { data: reports, error } = await supabase
    .from("report")
    .select(
      `
      id,
      campaign_id,
      reported_user_id,
      reported_by_user_id,
      title,
      reason,
      status,
      created_at
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reports:", error.message)
    throw new Error("Failed to fetch reports")
  }

  // Fetch organization names separately
  const userIds = reports.flatMap((report) => [
    report.reported_user_id,
    report.reported_by_user_id,
  ])

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, organization_name")
    .in("user_id", userIds)

  if (profileError) {
    console.error("Error fetching profiles:", profileError.message)
    throw new Error("Failed to fetch profile information")
  }

  // Create a lookup for organization names
  const profileMap = Object.fromEntries(
    profiles.map((p) => [p.user_id, p.organization_name])
  )

  // Attach organization names to reports
  const reportsWithOrgNames = reports.map((report) => ({
    ...report,
    reported_user_org: profileMap[report.reported_user_id] || "Unknown",
    reported_by_org: profileMap[report.reported_by_user_id] || "Unknown",
  }))

  return reportsWithOrgNames
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service Role Key (Must be kept secret)
  { auth: { autoRefreshToken: false, persistSession: false } }
)
// Update report status
export async function updateReportStatus(
  reportId: string,
  status: "accepted" | "rejected"
) {
  const supabase = await createServerSupabaseClient()

  // Get report details
  const { data: report, error: reportError } = await supabase
    .from("report")
    .select("reported_user_id, reason")
    .eq("id", reportId)
    .single()

  if (reportError || !report) {
    console.error("Error fetching report:", reportError?.message)
    throw new Error("Failed to fetch report details")
  }

  const { reported_user_id, reason } = report

  // Update report status
  const { error: updateError } = await supabase
    .from("report")
    .update({ status })
    .eq("id", reportId)

  if (updateError) {
    console.error("Error updating report status:", updateError.message)
    throw new Error("Failed to update report status")
  }

  // ✅ If accepted, ban the user for 8 hours using `app_metadata`
  if (status === "accepted") {
    const banUntil = new Date()
    banUntil.setHours(banUntil.getHours() + 8) // Ban for 8 hours

    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
      reported_user_id,
      {
        app_metadata: { banned_until: banUntil.toISOString() }, // ✅ Store ban info in app_metadata
      }
    )

    if (banError) {
      console.error("Error banning user:", banError.message)
      throw new Error("Failed to temporarily ban user")
    }
  }

  return { success: true }
}
