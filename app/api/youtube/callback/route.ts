import { NextRequest, NextResponse } from "next/server"
import { createServerActionClient } from "@/app/auth/actions"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/settings?error=No code provided`
    )
  }

  const supabase = await createServerActionClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("Session exchange error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/settings?error=${encodeURIComponent(error.message)}`
    )
  }

  const userId = data.session.user.id
  const accessToken = data.session.provider_token
  const refreshToken = data.session.provider_refresh_token

  if (accessToken && refreshToken) {
    const { error: storeError } = await supabase
      .from("creators")
      .update({
        youtube_access_token: accessToken,
        youtube_refresh_token: refreshToken,
        youtube_connected: true,
      })
      .eq("user_id", userId)

    if (storeError) {
      console.error("Error storing YouTube tokens:", storeError)
    } else {
      // console.log("YouTube tokens stored successfully!")
    }
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`)
}
