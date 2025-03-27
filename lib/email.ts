import { Resend } from "resend"
import fs from "fs"
import { generateInvoice } from "./invoice"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvoiceEmail({
  email,
  name,
  amount,
  currency,
  orderId,
  transactionId,
}: {
  email: string
  name: string
  amount: string
  currency: string
  orderId: string
  transactionId: string
}) {
  const filePath = await generateInvoice({ name, email, amount, currency, orderId, transactionId })
  const invoiceBuffer = fs.readFileSync(filePath)

  // console.log("[DEBUG] Invoice PDF loaded:", email)
  return await resend.emails.send({
    from: "notifications@clippay.live",
    to: email,
    subject: "Your Invoice",
    html: `<p>Dear ${name},</p><p>Attached is your payment invoice.</p>`,
    attachments: [
      {
        filename: `invoice-${orderId}.pdf`,
        content: invoiceBuffer.toString("base64"),
        contentType: "application/pdf",
      },
    ],
  })
}
