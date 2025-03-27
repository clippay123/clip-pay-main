import client from "@/lib/paypal"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import {
  CheckoutPaymentIntent,
  OrdersController,
} from "@paypal/paypal-server-sdk"
import { NextRequest, NextResponse } from "next/server"

interface Brand {
  id: string
  [key: string]: any
}

interface Submission {
  id: string
  views: number
  [key: string]: any
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  let isError = false

  try {
    const orderController = new OrdersController(client)
    const { submissionId, brandId } = await req.json()
    // console.log("[DEBUG] Processing PayPal order for submission:", submissionId)

    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("*, profiles!inner (user_type)")
      .eq("user_id", user.id)
      .single()

    if (brandError || !brand) {
      isError = true
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }
    if (brand.profiles.user_type !== "brand") {
      isError = true
      return NextResponse.json(
        { error: "Only brand accounts can process payments" },
        { status: 403 }
      )
    }
    // if (!brand.paypal_email) return NextResponse.json({ error: "Payment setup incomplete" }, { status: 400 })
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select(
        `
        *, 
        campaign:campaigns (id, title, rpm, budget_pool, referral_bonus_rate, remaining_budget),
        creator:creators (user_id, paypal_email, profile:profiles (referred_by))
      `
      )
      .eq("id", submissionId)
      .single()

    let referrer = null
    if (submission.creator.profile.referred_by) {
      const { data: referrerData } = await supabase
        .from("profiles")
        .select("organization_name, creator:creators!inner (paypal_email)")
        .eq("user_id", submission.creator.profile.referred_by)
        .single()

      if (referrerData?.creator[0]?.paypal_email) {
        referrer = {
          organization_name: referrerData.organization_name,
          paypal_email: referrerData.creator[0]?.paypal_email,
        }
      }
    }

    // Calculate payment amounts
    const initialPayment =
      (submission.views * Number(submission.campaign.rpm)) / 1000
    const creatorPayment = initialPayment
    const referrerPayment = referrer
      ? initialPayment * submission.campaign.referral_bonus_rate
      : 0
    const serviceFee = (creatorPayment + referrerPayment) * 0.2
    const totalAmount = creatorPayment + referrerPayment + serviceFee

    // console.log("[DEBUG] Final payment details:", {
    //   creatorPayment,
    //   referrerPayment,
    //   serviceFee,
    //   totalAmount: totalAmount / 100,
    // })

    const budgetPool = Number(
      submission.campaign.remaining_budget || submission.campaign.budget_pool
    )
    // if (totalAmount > budgetPool) {
    //   isError = true
    //   return NextResponse.json(
    //     { error: "Insufficient budget" },
    //     { status: 400 }
    //   )
    // }

    const { body, ...httpResponse } = await orderController.ordersCreate({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: totalAmount.toFixed(2),
              breakdown: {
                itemTotal: {
                  currencyCode: "USD",
                  value: totalAmount.toFixed(2),
                },
              },
            },
            referenceId: submission.id,
            description: `Payment for submission ${submission.id}`,
          },
        ],
      },
      prefer: "return=minimal",
    })
    // console.log("[DEBUG] Payment response:", { httpResponse, body })

    if (httpResponse.statusCode !== 201 && httpResponse.statusCode !== 200) {
      isError = true
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 400 }
      )
    }

    const createdPaypalOrder = JSON.parse(body.toString())

    // Update submission status
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: "payment_pending",
        views: submission.views,
        payout_amount: totalAmount / 100,
        creator_amount: creatorPayment,
      })
      .eq("id", submission.id)

    updateError &&
      console.error("[DEBUG] Submission update error:", updateError)

    // Update campaign budget
    const newRemainingBudget = budgetPool - totalAmount
    await supabase
      .from("campaigns")
      .update({ remaining_budget: newRemainingBudget })
      .eq("id", submission.campaign.id)

    // Saving Transactions
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        brand_id: brand?.id,
        submission_id: submission.id,
        amount: totalAmount,
        service_fee: serviceFee,
        referrer_amount: referrerPayment,
        referrer_id: submission.creator.profile.referred_by || null,
        paypal_order_id: createdPaypalOrder?.id,
        status: "pending",
        creator_payout_status: "pending",
      })
      .select()
      .single()

    if (transactionError) throw new Error("Failed to create transaction record")

    return NextResponse.json(createdPaypalOrder, {
      status: 201,
    })
  } catch (error) {
    console.error("[DEBUG] PayPal order error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create PayPal order",
      },
      { status: 500 }
    )
  } finally {
    if (!isError) {
    }
  }
}
