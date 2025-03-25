import type { Metadata } from "next"
import { Geist, Geist_Mono, Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Add the weights you need
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ClipPay",
  description:
    "ClipPay is a platform to earn money for every view your content generates",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        {children}
        <Toaster theme="dark" position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
