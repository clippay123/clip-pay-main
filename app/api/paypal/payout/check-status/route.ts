// https://api.sandbox.paypal.com/v1/payments/payouts/PA6C7A5PK3E68

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // TODO: Get this payout id from the database or where ever you store it
    const payoutBatchId = "PA6C7A5PK3E68"
    const response = await fetch(
      `https://api-m${process.env.PAYPAL_MODE === "sandbox" ? ".sandbox" : ""}.paypal.com/v1/payments/payouts/${payoutBatchId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
        },
      }
    )

    const data = await response.json()
    // console.log("Payout Status:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.log("[Error] - While Fetching Payout Status:", error)
  }
}
