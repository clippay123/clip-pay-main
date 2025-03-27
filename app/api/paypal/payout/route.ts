import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  try {
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: creator } = await supabase
      .from("creators")
      .select("paypal_email")
      .eq("user_id", user.id)
      .single()

    if (!creator?.paypal_email) {
      return NextResponse.json(
        { error: "PayPal not connected" },
        { status: 400 }
      )
    }
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select(
        `id, 
        creator_amount
        `
      )
      .eq("status", "paid")
      .eq("user_id", user.id)

    if (submissionError || submission.length === 0) {
      return NextResponse.json(
        { error: "Submission details not found" },
        { status: 404 }
      )
    }

    const payableAmount = submission.reduce(
      (amount, sub) => amount + sub.creator_amount,
      0
    )

    // console.log("Payable amount: ", payableAmount)
    // if (submission.creator_amount<25) {
    //     return NextResponse.json({ error: "Creator amount is too low. below $25!" }, { status: 400 })
    // }

    const payoutResponse = await fetch(
      `https://api-m${process.env.PAYPAL_MODE === "sandbox" ? ".sandbox" : ""}.paypal.com/v1/payments/payouts`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_batch_header: {
            sender_batch_id: `PAYOUT_${Date.now()}`,
            email_subject: `Recieved Payment ${"From Clippay"}`,
          },
          items: [
            {
              recipient_type: "EMAIL",
              amount: { value: payableAmount.toFixed(2), currency: "USD" },
              receiver: creator.paypal_email,
            },
          ],
        }),
      }
    ).then((res) => res.json())
    // console.log("Payable Response: ", payoutResponse)
    const payoutId = payoutResponse?.batch_header?.id
    const payoutStatus = payoutResponse?.batch_header?.batch_status

    if ((payoutStatus && payoutStatus === "PENDING") || payoutStatus === "") {
      await supabase
        .from("submissions")
        .update({
          payout_status: "processing",
          status: "fulfilled",
          payout_transfer_id: payoutId,
        })
        .eq("user_id", user.id)

      await supabase.from("notifications").insert({
        recipient_id: user.id,
        type: "payout_completed",
        title: "Payout Processing",
        message: `Your payout of $${payableAmount.toFixed(2)} has been initiated.`,
        metadata: {
          amount: payableAmount,
          transfer_id: payoutId,
        },
      })
    }
    // console.log("[DEBUG] Payout Response: ", payoutResponse)
    // }
    return NextResponse.json(payoutResponse)
  } catch (error) {
    return NextResponse.json(
      { error: "Error While Paypal Payment", reason: error },
      { status: 500 }
    )
  }
}
