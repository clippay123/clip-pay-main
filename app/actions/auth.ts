"use server"
import { redirect } from "next/navigation"
import { createServerActionClient } from "../auth/actions"
import { url } from "inspector"
import { createClient } from "@supabase/supabase-js"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  try {
    const supabase = await createServerActionClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    // Get session to check if sign-in was successful
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Failed to get session after sign-in")
    }

    // ✅ Check if the user is banned
    const banUntil = user?.app_metadata?.banned_until
    if (banUntil && new Date(banUntil) > new Date()) {
      await supabase.auth.signOut() // Force logout if banned
      throw new Error(
        `Your account is banned until ${new Date(banUntil).toLocaleString()}`
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, user_type")
      .eq("user_id", user.id)
      .single()

    // Check if user is admin
    if (profile?.user_type === "admin") {
      return { redirectTo: "/admin" }
    }

    // Return redirect based on onboarding status
    if (!profile?.onboarding_completed) {
      return {
        redirectTo: `/onboarding/${
          profile?.user_type === "brand" ? "brand/profile" : "creator"
        }`,
      }
    }

    return { redirectTo: "/dashboard" }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred")
  }
}

export async function signUp(formData: FormData) {
  "use server"

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const userType = formData.get("userType") as "creator" | "brand"
  const referralCode = formData.get("referralCode") as string | null
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const redirectUrl = new URL(`/auth/${userType}/callback`, baseUrl)
  if (!email || !password || !userType) {
    throw new Error("Missing required fields")
  }

  const supabase = await createServerActionClient()
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Uses service role for unrestricted access
  )

  // Store referral code using service role (bypassing RLS)
  if (userType === "creator" && referralCode) {
    // const { error: referralError } = await serviceSupabase
    //   .from("pending_referrals")
    //   .upsert({ email, referral_code: referralCode })

    redirectUrl.searchParams.set("ref", referralCode)
  }

  // Proceed with signup
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl.toString(),
    },
  })

  if (error) {
    throw error
  }

  return { success: true }
}

export async function signOut() {
  try {
    const supabase = await createServerActionClient()
    await supabase.auth.signOut()
    redirect("/signin")
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred")
  }
}

export async function forgotPassword(email: string) {
  "use server"

  const supabase = await createServerActionClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to send reset link",
    }
  }
}

export async function resetPassword(password: string) {
  "use server"

  const supabase = await createServerActionClient()

  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to reset password",
    }
  }
}

export async function signInWithGoogle(
  userType: "creator" | "brand",
  isSignUp: boolean,
  referralCode?: string
) {
  const supabase = await createServerActionClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  console.log("referral code", referralCode)
  const redirectUrl = new URL(`/auth/${userType}/callback`, baseUrl)

  if (isSignUp && referralCode) {
    redirectUrl.searchParams.set("ref", referralCode)
  }

  console.log("Redirecting to Google with URL:", redirectUrl.toString())

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    console.error("Google sign-in error:", error)
    throw error
  }

  if (!data?.url) {
    throw new Error("No authentication URL returned")
  }

  // ✅ Fetch the user session after successful Google sign-in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Failed to get session after Google sign-in")
  }

  // ✅ Check if the user is banned
  const banUntil = user?.app_metadata?.banned_until
  if (banUntil && new Date(banUntil) > new Date()) {
    await supabase.auth.signOut()
    throw new Error(
      `Your account is banned until ${new Date(banUntil).toLocaleString()}`
    )
  }

  return data.url
}

export async function connectYouTubeAccount() {
  const supabase = await createServerActionClient()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const redirectUrl = new URL("/auth/youtube/callback", baseUrl)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl.toString(),
      scopes: "https://www.googleapis.com/auth/youtube.readonly",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    console.error("YouTube connection error:", error)
    throw error
  }

  if (data?.url) {
    return data.url
  }

  throw new Error("No authentication URL returned")
}
