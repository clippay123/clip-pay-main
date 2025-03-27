"use server"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code not found" },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabaseClient()

  // Fetch the logged-in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("User authentication failed:", authError)
    return NextResponse.json(
      { error: "Unauthorized. Please log in." },
      { status: 401 }
    )
  }

  // console.log("Authenticated Supabase User:", user)

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  const redirectUri = process.env.PAYPAL_REDIRECT_URI!
  const PAYPAL_API_BASE =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com"

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      `https://api-m${process.env.PAYPAL_MODE === "sandbox" ? ".sandbox" : ""}.paypal.com/v1/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      }
    )

    const tokenData = await tokenResponse.json()
    // console.log("PayPal Token Data:", tokenData)

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "Failed to get access token", details: tokenData },
        { status: 400 }
      )
    }

    // Fetch PayPal user details
    const userResponse = await fetch(
      `${PAYPAL_API_BASE}/v1/identity/oauth2/userinfo?schema=paypalv1.1`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    )

    const userInfo = await userResponse.json()
    // console.log("PayPal User Info:", userInfo)

    // Extract email correctly
    const email =
      userInfo.emails?.find(
        (e: { primary: boolean; value: string }) => e.primary
      )?.value || userInfo.emails?.[0]?.value

    if (!email) {
      return NextResponse.json(
        { error: "Failed to retrieve PayPal email", details: userInfo },
        { status: 400 }
      )
    }

    // Connect to Supabase

    // Update the creator record in Supabase
    const { error } = await supabase
      .from("creators")
      .update({
        paypal_access_token: tokenData.access_token,
        paypal_refresh_token: tokenData.refresh_token,
        paypal_email: email,
        paypal_connected: true,
      })
      .eq("user_id", user.id)

    if (error) {
      console.error("Failed to update creator:", error)
      return NextResponse.json(
        { error: "Failed to save PayPal details" },
        { status: 500 }
      )
    }

    // Send a notification to the user
    await supabase.from("notifications").insert({
      recipient_id: user.id,
      type: "paypal_connected",
      title: "PayPal Connected",
      message:
        "Your PayPal account has been successfully linked. You can now receive payouts via PayPal.",
    })

    // Redirect user to the earnings page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/earnings?success=paypal_connect`
    )
  } catch (error) {
    console.error("PayPal Callback Error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/earnings?error=paypal_connection_failed`
    )
  }
}
