import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// Create Supabase client

// Handle PATCH request
export async function PATCH(req: Request) {
  try {
    const { instagramUsername } = await req.json()
    if (!instagramUsername) {
      return NextResponse.json(
        { error: "Instagram username is required" },
        { status: 400 }
      )
    }

    // console.log("instagramUsername", instagramUsername)
    const supabase = await createServerSupabaseClient()
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id

    // console.log("userId", userId)
    // Update creators table
    const { error: updateError } = await supabase
      .from("creators")
      .update({ instagram_username: instagramUsername })
      .eq("user_id", userId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: "Instagram username updated successfully" },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("creators")
    .select("instagram_username")
    .eq("user_id", user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(
    { instagramUsername: data?.instagram_username || "" },
    { status: 200 }
  )
}
