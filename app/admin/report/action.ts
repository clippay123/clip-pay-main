"use server"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Fetch all reports
export async function fetchReports() {
  const supabase = await createServerSupabaseClient()

  // Fetch reports
  const { data: reports, error: reportError } = await supabase
    .from("report")
    .select(
      "id, campaign_id, reported_user_id, reported_by_user_id, title, reason, status, created_at"
    )
    .order("created_at", { ascending: false })

  if (reportError || !reports) {
    console.error("Error fetching reports:", reportError?.message)
    throw new Error("Failed to fetch reports")
  }

  // Get unique user IDs (reported & reporter)
  const userIds = reports.flatMap((report) => [
    report.reported_user_id,
    report.reported_by_user_id,
  ])

  // Fetch profiles based on user IDs
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

  // Fetch submission status, payout info, and submission ID
  const { data: submissions, error: submissionError } = await supabase
    .from("submissions")
    .select("campaign_id, status, payout_amount, id") // ✅ Include submission ID

  if (submissionError) {
    console.error("Error fetching submissions:", submissionError.message)
    throw new Error("Failed to fetch submission information")
  }

  // Create a lookup for submission info
  const submissionMap = Object.fromEntries(
    submissions.map((s) => [
      s.campaign_id,
      { status: s.status, payout_amount: s.payout_amount, submission_id: s.id }, // ✅ Store submission_id
    ])
  )

  // Merge data into reports
  const reportsWithDetails = reports.map((report) => ({
    ...report,
    reported_user_org: profileMap[report.reported_user_id] || "Unknown",
    reported_by_org: profileMap[report.reported_by_user_id] || "Unknown",
    submission_id: submissionMap[report.campaign_id]?.submission_id || null, // ✅ Add submission_id
    submission_status: submissionMap[report.campaign_id]?.status || "N/A",
    payout_amount:
      submissionMap[report.campaign_id]?.status === "paid"
        ? submissionMap[report.campaign_id]?.payout_amount
        : null,
  }))

  console.log("Reports with details:", reportsWithDetails)
  return reportsWithDetails
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Service Role Key (Keep it secret!)
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

  const { reported_user_id } = report

  // Update report status
  const { error: updateError } = await supabase
    .from("report")
    .update({ status })
    .eq("id", reportId)

  if (updateError) {
    console.error("Error updating report status:", updateError.message)
    throw new Error("Failed to update report status")
  }

  // ✅ If accepted, ban the user for 8 hours and send email
  if (status === "accepted") {
    const banUntil = new Date()
    banUntil.setHours(banUntil.getHours() + 8) // Ban for 8 hours

    // ✅ Fetch email using Supabase Admin Client
    const { data: user, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(reported_user_id)

    console.log("User,", user)
    if (userError || !user) {
      console.error("Error fetching user email:", userError?.message)
      throw new Error("Failed to fetch user email")
    }

    const userEmail = user.user?.email

    // ✅ Update user metadata to store ban info
    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
      reported_user_id,
      {
        app_metadata: { banned_until: banUntil.toISOString() },
      }
    )

    if (banError) {
      console.error("Error banning user:", banError.message)
      throw new Error("Failed to temporarily ban user")
    }

    // ✅ Send email notification using Resend
    try {
      const response = await resend.emails.send({
        from: "notifications@clippay.live",
        to: userEmail || "default@example.com", // Provide a fallback email
        subject: "Your Account Has Been Suspended",
        text: `Dear User,
    
    Your account has been suspended due to suspicious activity, specifically attempts to artificially increase views for payment. If you believe this is an error, please contact us with valid proof. We will review your case accordingly.
    
    Thank you for your understanding.
    
    Best regards,  
    ClipPay Moderation Team`,
      })

      console.log("Email sent successfully:", response)
    } catch (emailError) {
      console.error("Error sending email:", emailError)
    }
  }

  return { success: true }
}

export async function refundPayment(submissionId: string) {
  const supabase = await createServerSupabaseClient()

  console.log("Processing refund for submissionId:", submissionId)

  if (!submissionId) {
    throw new Error("Invalid submission ID")
  }

  // ✅ Fetch the PayPal transaction ID from the transactions table
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .select("paypal_capture_id,amount")
    .eq("submission_id", submissionId)
    .single()

  if (transactionError || !transaction) {
    console.error(
      "Error fetching transaction details:",
      transactionError?.message
    )
    throw new Error("Failed to fetch transaction details")
  }

  const paypalCaptureId = transaction.paypal_capture_id

  // ✅ Fetch submission details
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("payout_amount, status")
    .eq("id", submissionId)
    .single()

  if (submissionError || !submission) {
    console.error(
      "Error fetching submission details:",
      submissionError?.message
    )
    throw new Error("Failed to fetch submission details")
  }

  if (submission.status === "refunded") {
    throw new Error("This payment has already been refunded")
  }

  const { payout_amount } = submission

  // ✅ Get PayPal API credentials
  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET
  const PAYPAL_API_URL =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com"

  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error("Missing PayPal API credentials")
  }

  // ✅ Step 1: Get an Access Token from PayPal
  const authResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })

  const authData = await authResponse.json()

  if (!authResponse.ok) {
    console.error("PayPal Auth Error:", authData)
    throw new Error("Failed to authenticate with PayPal")
  }

  const accessToken = authData.access_token

  // ✅ Step 2: Check If Payment Is Already Refunded
  const captureDetailsResponse = await fetch(
    `${PAYPAL_API_URL}/v2/payments/captures/${paypalCaptureId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const captureDetails = await captureDetailsResponse.json()

  if (!captureDetailsResponse.ok) {
    console.error("Error checking PayPal transaction:", captureDetails)
    throw new Error("Failed to verify PayPal transaction details")
  }

  // ✅ If transaction is already refunded, just update Supabase
  if (captureDetails.status === "REFUNDED") {
    console.log("Transaction is already refunded. Updating Supabase.")

    const { error: updateError } = await supabase
      .from("submissions")
      .update({ status: "refunded" })
      .eq("id", submissionId)

    if (updateError) {
      console.error("Error updating refund status:", updateError.message)
      throw new Error("Failed to update refund status")
    }

    return {
      success: true,
      message: "Payment was already refunded in PayPal, status updated.",
    }
  }

  // ✅ Step 3: Process the Refund
  const refundResponse = await fetch(
    `${PAYPAL_API_URL}/v2/payments/captures/${paypalCaptureId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: {
          value: transaction.amount,
          currency_code: "USD",
        },
      }),
    }
  )

  const refundData = await refundResponse.json()

  if (!refundResponse.ok) {
    console.error("PayPal refund error:", refundData)
    throw new Error("Failed to process refund via PayPal")
  }

  console.log("PayPal refund successful:", refundData)

  // ✅ Step 4: Update Supabase to mark the payment as refunded
  const { error: updateError } = await supabase
    .from("submissions")
    .update({ status: "refunded" })
    .eq("id", submissionId)

  if (updateError) {
    console.error("Error updating refund status:", updateError.message)
    throw new Error("Failed to update refund status")
  }

  return { success: true, message: "Payment refunded successfully" }
}

export async function fetchBannedUsers() {
  // Fetch all users where banned_until is in the future
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    console.error("Error fetching banned users:", error.message)
    throw new Error("Failed to fetch banned users")
  }

  // Filter only users who are currently banned
  const bannedUsers = users.users.filter((user) => {
    const bannedUntil = user.app_metadata?.banned_until
    return bannedUntil && new Date(bannedUntil) > new Date()
  })

  return bannedUsers.map((user) => ({
    id: user.id,
    email: user.email,
    banned_until: user.app_metadata?.banned_until,
  }))
}

export async function unbanUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { banned_until: null }, // Remove ban
  })

  if (error) {
    console.error("Error unbanning user:", error.message)
    throw new Error("Failed to unban user")
  }

  return { success: true }
}
