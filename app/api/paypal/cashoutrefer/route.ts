import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "@/lib/supabase-server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getFreshPayPalToken(refreshToken: string) {
  const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox"
  const PAYPAL_API_BASE =
    PAYPAL_MODE === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com"

  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64")

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  })

  const data = await response.json()

  if (!response.ok) {
    console.log("data", data)
    throw new Error(`Failed to refresh PayPal token: ${data.error_description}`)
  }

  return data.access_token
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await req.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    const user_id = user?.id
    const { referralEarnings } = body

    if (
      !user_id ||
      referralEarnings === undefined ||
      referralEarnings === null
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Fetch PayPal details from the database
    const { data: creator, error } = await supabase
      .from("creators")
      .select(
        "paypal_email, paypal_refresh_token, paypal_access_token, totalPaidReferralEarnings"
      )
      .eq("user_id", user_id)
      .single()

    if (error || !creator) {
      return NextResponse.json(
        { message: "PayPal details not found" },
        { status: 400 }
      )
    }

    // Get fresh PayPal access token
    let paypalAccessToken = creator.paypal_access_token
    try {
      paypalAccessToken = await getFreshPayPalToken(
        creator.paypal_refresh_token
      )

      // Update the database with the new token
      await supabase
        .from("creators")
        .update({ paypal_access_token: paypalAccessToken })
        .eq("user_id", user_id)
    } catch (refreshError) {
      return NextResponse.json(
        {
          message: "Failed to refresh PayPal token",
          error: (refreshError as Error).message,
        },
        { status: 400 }
      )
    }

    const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox"
    const PAYPAL_API_BASE =
      PAYPAL_MODE === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com"

    // Initiate PayPal Payout with fresh token
    const payoutResponse = await fetch(
      `${PAYPAL_API_BASE}/v1/payments/payouts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: JSON.stringify({
          sender_batch_header: {
            sender_batch_id: `cashout-${Date.now()}`,
            email_subject: "You have received a payout!",
          },
          items: [
            {
              recipient_type: "EMAIL",
              amount: {
                value: referralEarnings.toFixed(2),
                currency: "USD",
              },
              receiver: creator.paypal_email,
            },
          ],
        }),
      }
    )

    const payoutData = await payoutResponse.json()

    console.log("Payout Data", payoutData)
    if (!payoutResponse.ok) {
      console.log("Payout Error", payoutData)
      return NextResponse.json(
        { message: "Failed to process payout", details: payoutData },
        { status: 400 }
      )
    }

    const payoutAmount = parseFloat(referralEarnings.toFixed(2))

    // Insert the payout record
    // const { error: payoutInsertError } = await supabase
    //   .from("payouts")
    //   .insert([
    //     {
    //       user_id: user_id,
    //       amount: payoutAmount,
    //       status: "completed",
    //       transaction_id: payoutData.batch_header.payout_batch_id,
    //       created_at: new Date().toISOString(),
    //     },
    //   ]);

    // if (payoutInsertError) {
    //   console.error("Failed to insert payout record:", payoutInsertError);
    //   return NextResponse.json({ message: "Failed to record payout", error: payoutInsertError.message }, { status: 500 });
    // }

    // Update totalPaidReferralEarnings in the creators table
    const { error: updateCreatorsError } = await supabase.rpc(
      "add_total_paid_referral_earnings",
      { user_id, amount: payoutAmount }
    )

    if (updateCreatorsError) {
      console.error(
        "Failed to update totalPaidReferralEarnings:",
        updateCreatorsError
      )
      return NextResponse.json(
        {
          message: "Failed to update creator record",
          error: updateCreatorsError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Payout successful and creators table updated", payoutData },
      { status: 200 }
    )
  } catch (error) {
    console.log("error", error)
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    )
  }
}
