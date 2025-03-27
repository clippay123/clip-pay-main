import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"

export function generateInvoiceHTML({
  name,
  email,
  amount,
  currency,
  orderId,
  transactionId,
}: {
  name: string
  email: string
  amount: string
  currency: string
  orderId: string
  transactionId: string
}) {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .container { width: 80%; margin: auto; }
          .invoice-header { text-align: center; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .footer { text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="invoice-header">Invoice</h1>
          <p>Customer Name: <strong>${name}</strong></p>
          <p>Email: <strong>${email}</strong></p>
          <p>Order ID: <strong>${orderId}</strong></p>
          <p>Transaction ID: <strong>${transactionId}</strong></p>

          <table class="invoice-table">
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>Payment</td>
              <td>${currency} ${amount}</td>
            </tr>
          </table>

          <p class="footer">Thank you for your payment!</p>
        </div>
      </body>
    </html>
  `
}


export async function generateInvoice({
  name,
  email,
  amount,
  currency,
  orderId,
  transactionId,
}: {
  name: string
  email: string
  amount: string
  currency: string
  orderId: string
  transactionId: string
}): Promise<string> {
  const filePath = path.join(process.cwd(), "invoices", `invoice-${orderId}.pdf`)

  try {
    // Ensure invoices directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // Generate HTML content
    const invoiceHTML = generateInvoiceHTML({ name, email, amount, currency, orderId, transactionId })

    // Load the HTML into Puppeteer
    await page.setContent(invoiceHTML, { waitUntil: "load" })

    // Generate PDF
    await page.pdf({ path: filePath, format: "A4" })

    // Close browser
    await browser.close()

    // console.log("[DEBUG] Invoice PDF generated:", filePath)
    return filePath
  } catch (error) {
    console.error("[ERROR] Failed to generate PDF:", error)
    throw error
  }
}
