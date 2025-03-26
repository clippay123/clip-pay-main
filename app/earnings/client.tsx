"use client"

import { Button } from "@/components/ui/button"
import { CircleArrowUpIcon, FileText, RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import moneywithdraw from "@/public/assets/moneywithdraw.svg"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import earnedImg from "@/public/assets/earned.svg"
import walletImg from "@/public/assets/Wallet.svg"
interface Transaction {
  id: string
  amount: number
  status: string
  created: number
  arrival_date: number | null
  description: string | null
  type: string
}

interface EarningsClientProps {
  // hasStripeAccount: boolean
  totalEarned: number
  availableForPayout: number
  hasPayPalAccount: boolean
  paypalAccountStatus: string
  pendingEarnings: number
  submissions: Array<{
    id: string
    campaign_title: string
    brand_name: string
    earned: number
    status: string
    created_at: string
  }>
  isCashoutAvailable: boolean
}

export function EarningsClient({
  // hasStripeAccount,
  totalEarned,
  availableForPayout,
  pendingEarnings,
  submissions,
  hasPayPalAccount,
  paypalAccountStatus,
  isCashoutAvailable,
}: EarningsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  return (
    <>
      <div>
        <div className="flex flex-col md:flex-row md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Earnings</h1>
          </div>

          <div className="flex gap-2 items-center">
            {/* <button className="bg-[#094283] flex gap-2 py-3 px-4 rounded-xl text-white">

                  Withdraw Fund
                  <Image src={moneywithdraw} alt="money ico" />
                  </button> */}
            <div>
              {!hasPayPalAccount ? (
                <Button
                  onClick={() => (window.location.href = "/api/paypal/connect")}
                  className="bg-[#094283] flex gap-2 py-5 px-4 rounded-xl text-white"
                  size="sm"
                >
                  Connect PayPal
                </Button>
              ) : (
                <Button
                  onClick={() => (window.location.href = "/api/paypal/connect")}
                  className="bg-[#094283] flex gap-2 py-5 px-4 rounded-xl text-white"
                  size="sm"
                >
                  <span className="flex items-center">
                    <span className="text-green-500 mr-1">●</span> Paypal
                    Account Connected
                  </span>
                </Button>
              )}
            </div>
            <div>
              {availableForPayout > 0 && paypalAccountStatus && (
                <Button
                  onClick={async () => {
                    setIsLoading(true)
                    try {
                      const response = await fetch("/api/paypal/payout", {
                        method: "POST",
                      })
                      const data = await response.json()

                      if (data.error) {
                        toast.error(`Error: ${data.error}`)
                      } else {
                        toast.success("Cashout successful! Refreshing...")
                        window.location.reload()
                      }
                    } catch (error) {
                      console.error("Payout error:", error)
                      toast.error(
                        "An error occurred while processing the payout."
                      )
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  className="bg-[#094283] flex gap-2 py-3 px-4 rounded-xl text-white"
                  //  disabled={isLoading || !isCashoutAvailable} // Button enabled only after 2 days
                >
                  {isLoading
                    ? "Processing..."
                    : isCashoutAvailable
                      ? `Withdraw Fund ($${availableForPayout.toFixed(2)})`
                      : "Withdraw Fund in 2 Days"}{" "}
                  <Image src={moneywithdraw} alt="money ico" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className={"grid grid-cols-2 lg:grid-cols-5 gap-8 mt-4 "}>
          <Card className="p-4 rounded-2xl shadow-lg bg-white inline-flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-600">
                Total Earning
              </span>
              <div className="">
                <Image
                  src={walletImg}
                  alt="walled "
                  className="w-5 h-5 text-zinc-600"
                />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {totalEarned}
            </p>
          </Card>
          <Card className="p-4 rounded-2xl shadow-lg bg-white inline-flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-600">
                Pending Earning
              </span>
              <div className="">
                {/* <FileText className="w-5 h-5 text-zinc-600" /> */}
                <Image
                  src={earnedImg}
                  alt="walled "
                  className="w-5 h-5 text-zinc-600"
                />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">0</p>
          </Card>
          {/* <Card className="p-4 rounded-2xl shadow-lg bg-white inline-flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-600">
Total Withdraw
              </span>
              <div className="">

                <Image src={moneywithdraw} alt="money withdraw" className="w-5 h-5 text-zinc-600"/>
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">25</p>
          </Card> */}
        </div>
      </div>
      {/* <Card className="p-4 rounded-2xl shadow-lg bg-white inline-flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-600">
            Account Status
          </span>
          <div className="">
            <FileText className="w-5 h-5 text-zinc-600" />
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-black">
            {hasPayPalAccount ? "Account Connected" : "Connect Your Account"}
          </p>
          <div className="mt-1">
            <div className="text-sm text-zinc-600">
              {hasPayPalAccount ? (
                <span className="flex items-center">
                  <span className="text-green-500 mr-1">●</span> Paypal Account
                  Connected
                </span>
              ) : (
                "Not connected"
              )}
            </div>
            {!hasPayPalAccount && (
              <Button
                onClick={() => (window.location.href = "/api/paypal/connect")}
                className="mt-2 bg-[#094283] text-white hover:bg-[#094283]/90"
                size="sm"
              >
                Connect PayPal
              </Button>
            )}
          </div>
        </div>
      </Card> */}
      <div className="space-y-6">
        {/* <div className="grid grid-cols-3">
        <div className="bg-white rounded-l-lg border border-l-2 border-t-2 border-b-2 border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl  font-semibold text-zinc-900">
              Total Earned
            </h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-900">
            ${totalEarned.toFixed(2)}
          </p>
        </div>

        <div className="col-span-2 rounded-r-lg border-t-2 border-b-2 border-r-2 bg-white border border-zinc-200 w-fit p-6">
          <div className="space-y-2">
            <h3 className="text-2xl  font-semibold text-zinc-900">
              Account Status
            </h3>
            <div>
              <span className="text-black">
                {hasPayPalAccount
                  ? "Account Connected"
                  : "Connect Your Account"}
              </span>

              <div className="">
                <div className="text-sm text-zinc-600 mt-1">
                  {hasPayPalAccount ? (
                    <h2 className="text-sm"> ● Paypal Account Connected </h2>
                  ) : (
                    "Not connected"
                  )}
                </div>
                {hasPayPalAccount ? (
                  <span> </span>
                ) : (
                  <Button
                    onClick={() =>
                      (window.location.href = "/api/paypal/connect")
                    }
                  >
                    Connect PayPal
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div> */}
        <div className="flex justify-between">
          <div className="flex flex-col">
            <div className="text-xl font-medium">Recent Activity</div>
            <div className="flex flex-col text-[#272830] font-light text-sm">
              See all your transactions
            </div>
          </div>
        </div>
        <div className="">
          <div className="space-y-4 bg-white rounded-xl">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 px-6"
                >
                  <div className="flex items-center gap-4">
                    <CircleArrowUpIcon />
                    <div>
                      <h3 className="font-medium text-zinc-900">
                        {submission.campaign_title}
                      </h3>
                      {/* <p className="text-sm text-zinc-600">
                    {submission.brand_name}
                  </p> */}
                      <p className="text-xs text-zinc-500">
                        {new Date(submission.created_at).toDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-zinc-900">
                      ${submission.earned.toFixed(2)}
                    </p>
                    <p
                      className={`text-sm capitalize ${
                        submission.status === "fulfilled"
                          ? "text-emerald-600"
                          : submission.status === "approved"
                            ? "text-blue-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {submission.status === "fulfilled"
                        ? "Paid"
                        : submission.status === "approved"
                          ? "Ready for Payment"
                          : "Pending"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-600">
                No earnings activity yet
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
