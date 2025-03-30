"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import referImage from "@/public/assets/referimg.svg"
import Image from "next/image"
import { Copy, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import totalViewImg from "@/public/assets/totalView.svg"
import singleImg from "@/public/assets/singPImag.svg"
import totalEarImg from "@/public/assets/earned.svg"
interface ReferredCreator {
  user_id: string
  organization_name: string | null
  created_at: string
  creators:
    | {
        total_earned: number | null
        total_views: number | null
        referral_earned?: number | null
      }[]
    | null
}

interface ReferralClientProps {
  referralCode: string
  referredCreators: ReferredCreator[]
  hasPayPalAccount: boolean
  totalReferralEarnings: number
}

export function ReferralClient({
  referralCode,
  referredCreators,
  hasPayPalAccount,
  totalReferralEarnings,
}: ReferralClientProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success("Referral code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate total earnings from referrals (actual earned amounts)
  // const totalReferralEarnings = referredCreators.reduce((total, creator) => {
  //   return total + (creator.creators?.[0]?.total_earned || 0)
  // }, 0)

  const totalReferralViews = referredCreators.reduce((total, creator) => {
    return total + (creator.creators?.[0]?.total_views || 0)
  }, 0)

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join with my referral link",
        url: referralLink,
      })
    } else {
      handleCopy()
      toast.info("Link copied! Share it with your friends")
    }
  }

  const handleCashout = async () => {
    if (!hasPayPalAccount) {
      toast.error("You need to connect a PayPal account to cash out.")
      return
    }

    try {
      const response = await fetch("/api/paypal/cashoutrefer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referralEarnings: totalReferralEarnings,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Cashout successful! Funds will be transferred shortly.")
      } else {
        toast.error(data.message || "Failed to cash out.")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while processing your cashout.")
    }
  }

  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/signup/creator?ref=${referralCode}`
  return (
    <>
      <div className={"grid grid-cols-2 lg:grid-cols-4 gap-8 mb-4"}>
        <Card className="p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-600">
              Invited Creators
            </span>
            <div className="">
              <Image
                src={totalViewImg}
                alt="Wallet Image"
                className="w-5 h-5"
              />
            </div>
          </div>
          <p className="text-2xl font-semibold text-zinc-900">
            {" "}
            {referredCreators.length}
          </p>
        </Card>

        <Card className="p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-600">
              Total View
            </span>
            <div className="">
              <Image src={singleImg} alt="Wallet Image" className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-zinc-900">
            {" "}
            {totalReferralViews}
          </p>
        </Card>

        <Card className="p-4  rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col">
          <div className="flex  justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-600">
                Pending Balance
              </span>
              <p className="text-2xl font-semibold text-zinc-900">
                {" "}
                $ {totalReferralEarnings}
              </p>
            </div>
            <div className="">
              <Button
                className="bg-[#094283] flex gap-2  px-4 rounded-xl text-white"
                onClick={handleCashout}
              >
                Cashout
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <div className="bg-[#FFBC0F] p-3 text-center font-bold">
            OUR REFERRAL PROGRAM • Get rewarded for inviting people!
          </div>
        </div>
        {/* Referral Description */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[#001246] font-medium">
            Get your referral link to give your friends a $20 discount when they
            shop at Hot Beans. If they use it, we'll reward you with $20.
          </p>
        </div>

        {/* How it Works */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-center">How it Works</h2>

          <div className="flex justify-center">
            <div className="space-y-4 ">
              <div className="flex item-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <p className="text-[#001246] font-medium">
                  Invite your friends to Clip Pay.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p className="text-[#001246] font-medium">
                  Get paid for every 1000 views your content generates on
                  offers.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                  </svg>
                </div>
                <p className="text-[#001246] font-medium">
                  Earn a bonus for every 1000 views generated by creators you
                  refer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* {!hasStripeAccount && (
        <StripeConnectBanner
          totalEarnings={totalReferralEarnings}
          context="referral"
        />
      )} */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-6 space-y-4 w-full md:w-3/4 lg:w-1/2 mx-auto">
          <div className="flex justify-center">
            <Image src={referImage} alt="Refer" className="w-32 h-32" />
          </div>

          <h2 className="text-lg font-semibold text-center">
            Your Referral Credentials
          </h2>
          <p className="text-sm text-gray-600 text-center">
            Share the link with other creators to earn rewards
          </p>

          <div className="flex flex-col md:flex-row items-center gap-2 w-full overflow-hidden">
            <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex-1 border border-gray-200 text-sm truncate w-full max-w-full">
              {referralLink}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </Button>
            <Button
              size="sm"
              onClick={handleShare}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Share
            </Button>
          </div>

          <div className="space-y-3 mt-4">
            {referredCreators.length > 0 ? (
              referredCreators.map((creator) => (
                <div
                  key={creator.user_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {creator.organization_name?.charAt(0) || "U"}
                    </div>
                    <p className="font-medium">
                      {creator.organization_name || "Unnamed Creator"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <p className="text-sm text-gray-600">
                      {creator?.creators?.[0]?.total_views || 0} Views
                    </p>
                    <p className="font-medium">
                      $
                      {(creator.creators?.[0]?.referral_earned || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-600">
                No referred creators yet
              </div>
            )}
          </div>
        </div>
        {/* <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-6 mx-auto w-1/2 flex flex-col justify-center">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">
            Your Referral Code
          </h2>
          <div className="flex items-center gap-4">
            <code className="bg-zinc-50 text-zinc-900 px-4 py-2 rounded-lg flex-1 border border-zinc-200">
              {referralLink}
            </code>
            <Button
              onClick={handleCopy}
              className="bg-black hover:bg-black/90 text-white"
            >
              Copy Code
            </Button>
          </div>
        </div>

      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-6">
          Referred Creators
        </h2>
        <div className="space-y-4">
          {referredCreators.length > 0 ? (
            referredCreators.map((creator) => (
              <div
                key={creator.user_id}
                className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200"
              >
                <div>
                  <h3 className="font-medium text-zinc-900">
                    {creator.organization_name || "Unnamed Creator"}
                  </h3>
                  <p className="text-sm text-zinc-600">
                    Joined{" "}
                    {formatDistanceToNow(new Date(creator.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-zinc-900">
                    ${(creator.creators?.[0]?.total_earned || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-zinc-600">
                    Creator's Total Earned
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-600">
              No referred creators yet
            </div>
          )}
        </div>
      </div> */}
      </div>
    </>
  )
}
