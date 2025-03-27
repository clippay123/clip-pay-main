import { Card } from "@/components/ui/card"
import { DollarSign, FileText, RotateCw, Users } from "lucide-react"
import { CampaignWithSubmissions } from "@/types/campaigns"
import { Montserrat } from "next/font/google"
import totalViewImg from "@/public/assets/totalView.svg"
import SealCheckImg from "@/public/assets/SealCheck.svg"
import Image from "next/image"
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Add the weights you need
})

export function Metrics({
  campaigns,
}: {
  campaigns: CampaignWithSubmissions[]
}) {
  return (
    <div
      className={`grid grid-cols-2 lg:grid-cols-5 gap-8 ${montserrat.className}`}
    >
      <Card className="p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-600">
            Total Budget
          </span>
          <div className="">
            <Image src={totalViewImg} alt="Total view" className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-semibold text-zinc-900">
          {" "}
          $
          {campaigns
            .reduce(
              (total, campaign) => total + Number(campaign.budget_pool || 0),
              0
            )
            .toLocaleString()}
        </p>
      </Card>
      <Card className="p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-600">
            Active Campaigns
          </span>
          <div className="">
            <Image
              alt="Active"
              src={SealCheckImg}
              className="w-5 h-5 text-zinc-600"
            />
          </div>
        </div>
        <p className="text-2xl font-semibold text-zinc-900">
          {campaigns.filter((c) => c.status === "active").length}
        </p>
      </Card>

      <Card className="p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col ">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-600">
            Total Submissions
          </span>
          <div className="">
            <Users className="w-5 h-5 text-zinc-600" />
          </div>
        </div>
        <p className="text-2xl font-semibold text-zinc-900">
          {campaigns.reduce(
            (total, campaign) => total + (campaign.submissions?.length || 0),
            0
          )}
        </p>
      </Card>

      <Card className="p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-600">Average CPM</span>
          <div className="">
            <RotateCw className="w-5 h-5 text-zinc-600" />
          </div>
        </div>
        <p className="text-2xl font-semibold text-zinc-900">
          $
          {(
            campaigns.reduce(
              (total, campaign) => total + Number(campaign.rpm || 0),
              0
            ) / (campaigns.length || 1)
          ).toFixed(2)}
        </p>
      </Card>
    </div>
  )
}
