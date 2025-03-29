import { NextRequest, NextResponse } from "next/server"
import { createServerActionClient } from "@/app/auth/actions"
import { Database } from "@/types/supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// Get the project ref from the Supabase URL
function getProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined")
  const matches = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (!matches) throw new Error("Invalid Supabase URL format")
  return matches[1]
}

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userType: string }> }
) {
  const { params } = context
  const resolvedParams = await params // ✅ Await params since it might be a Promise
  const userType = resolvedParams.userType

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"
  const referralCode = requestUrl.searchParams.get("ref")

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/signin?error=No code provided`
    )
  }

  const supabase = await createServerActionClient()

  try {
    // ✅ Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.session) {
      console.error("Session exchange error:", error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/signin?error=${encodeURIComponent(error?.message || "Unknown error")}`
      )
    }

    const userId = data.session.user.id
    const userEmail = data.session.user.email
    const accessToken = data.session.provider_token
    const refreshToken = data.session.provider_refresh_token

    if (!userEmail) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/signin?error=Authentication required`
      )
    }

    let referredByUUID = null

    // ✅ Fetch referrer if referral code exists
    if (userType === "creator" && referralCode) {
      const { data: referrer, error: referrerFetchError } = await supabase
        .from("referrals")
        .select("profile_id")
        .eq("code", referralCode)
        .single()

      if (!referrerFetchError && referrer?.profile_id) {
        referredByUUID = referrer.profile_id
      }
    }

    // ✅ Store YouTube tokens if user is a creator
    if (userType === "creator" && accessToken && refreshToken) {
      await supabase
        .from("creators")
        .update({
          youtube_access_token: accessToken,
          youtube_refresh_token: refreshToken,
          youtube_connected: true,
        })
        .eq("user_id", userId)
    }

    // ✅ Fetch user profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_type, onboarding_completed, referred_by")
      .eq("user_id", userId)
      .single()

    if (!existingProfile) {
      // ✅ Insert new profile with referral if applicable
      await supabase.from("profiles").insert({
        user_id: userId,
        user_type: userType,
        onboarding_completed: false,
        referred_by: referredByUUID || null, // ✅ Store referral only if available
      })
    } else if (!existingProfile.referred_by && referredByUUID) {
      // ✅ Update `referred_by` only if it's missing
      await supabase
        .from("profiles")
        .update({ referred_by: referredByUUID })
        .eq("user_id", userId)
    }

    // ✅ Ensure redirect URL is properly formatted
    const profile = existingProfile || {
      user_type: userType,
      onboarding_completed: false,
    }
    const onboardingPath =
      profile.user_type === "brand" ? "brand/profile" : "creator"
    const redirectUrl = !profile.onboarding_completed
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/${onboardingPath}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}${next}`

    // ✅ Store session in cookies
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })
    response.cookies.set("sb-refresh-token", data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/signin?error=${encodeURIComponent("Authentication failed")}`
    )
  }
}
