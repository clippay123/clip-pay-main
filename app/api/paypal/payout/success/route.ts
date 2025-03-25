import { sendInvoiceEmail } from "@/lib/email"
import { orderController, paymentsController } from "@/lib/paypal"
import { createPayPalInvoice } from "@/lib/payPalInvoice"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()

  try {
    const { orderID, ...details } = await request.json()
    console.log(
      "[DEBUG] Starting payment confirmation for paymentIntentId:",
      orderID,
      details
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("user", user)
    if (!user) {
      console.error("[DEBUG] No user found in session")
      return NextResponse.json(
        { error: "Please sign in to continue" },
        { status: 401 }
      )
    }

    const { body, ...httpStatus } = await orderController.ordersCapture({
      id: orderID,
    })

    const order = JSON.parse(body.toString())
    console.log("[DEBUG] Order captured:", order)

    if (order?.status === "COMPLETED") {
      console.log(`[DEBUG] Payment of order ${orderID} completed successfully`)

      const purchaseUnit = order.purchase_units?.[0]
      const purchaseUnitPayment = order.purchase_units?.[0].payments
      const purchaseUnitAmount = purchaseUnitPayment?.captures?.[0]
      const transactionId = purchaseUnitAmount.id
      console.log(
        "[DEBUG] Capture Details:",
        JSON.stringify(purchaseUnitAmount, null, 2)
      )
      console.log("[DEBUG] Amount:", purchaseUnitAmount.amount.value)
      console.log("[DEBUG] Currency:", purchaseUnitAmount.amount.currency_code)

      const submissionId = order.purchase_units[0].reference_id
      const amount = purchaseUnitAmount.amount.value
      const currency = purchaseUnitAmount.amount.currency_code

      const { error: transactionError } = await supabase
        .from("transactions")
        .update({ status: "completed", paypal_capture_id: transactionId })
        .eq("paypal_order_id", orderID)

      if (transactionError) {
        console.error("[DEBUG] Transaction update error:", transactionError)
        throw new Error("Failed to update transaction status")
      }

      console.log("[DEBUG] Transaction status updated successfully")

      const { error: submissionError } = await supabase
        .from("submissions")
        .update({
          status: "paid",
          paymentDate: new Date().toISOString(), // Store current date in ISO format
        })
        .eq("id", submissionId)

      if (submissionError) {
        console.error("Error updating submission:", submissionError)
      }
      await sendInvoiceEmail({
        email: user.email ?? "no-reply@example.com",
        name: user.user_metadata.full_name || "User",
        amount,
        currency,
        orderId: orderID,
        transactionId,
      })

      return NextResponse.json(
        {
          message: "Payment completed successfully",
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: `Payment Staus update failed status - ${order?.status}}` },
        { status: 400 }
      )
    }
    // JSON.parse(order.body.toString());
  } catch (error) {
    console.log("Error processing payment confirmation:", error)
    return NextResponse.json(
      { error: "Error processing payment confirmation", reason: error },
      { status: 400 }
    )
  }
}
