"use client"

import { useState, useEffect } from "react"
import { ChevronDown, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DashboardHeader } from "@/components/dashboard-header"
import Image from "next/image"
import totalEarnedImg from "@/public/assets/earned.svg"
import totalViewImg from "@/public/assets/totalView.svg"
import SealedCheckImg from "@/public/assets/SealCheck.svg"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from "recharts"
import { CreatorCampaign } from "./creatorcampaignSub"

interface CreatorDashboardClientProps {
  transformedCampaigns: CreatorCampaign[]
  email: string
  creator: {
    stripe_account_id: string | null
    stripe_account_status: string | null
  } | null
  organization_name: string
}

function CampaignCard({
  campaign,
  onClick,
  isExpanded,
}: {
  campaign: CreatorCampaign
  onClick: () => void
  isExpanded: boolean
}) {
  const moneySpent =
    Number(campaign.budget_pool) - Number(campaign.remaining_budget)
  const progressPercentage =
    Number(campaign.budget_pool) > 0
      ? Math.round((moneySpent / Number(campaign.budget_pool)) * 100)
      : 0

  const progressText =
    moneySpent >= Number(campaign.budget_pool)
      ? "Campaign Complete"
      : `${progressPercentage}% Campaign Progress`
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white border group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-2">
            <div className="bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
              {progressText}
            </div>
            {campaign.submission && (
              <>
                <div className="flex w-1/2 mx-auto rounded-2xl items-center gap-2 p-1 px-2 border-[#E4E4E7] border-[3px] text-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span
                    className={cn(
                      "text-xs  rounded-full font-medium",
                      campaign.submission.status === "approved"
                        ? "bg-white text-green-700"
                        : campaign.submission.status === "rejected"
                          ? "bg-white text-red-700"
                          : "bg-white text-[#5865F2]"
                    )}
                  >
                    {campaign.submission.status.charAt(0).toUpperCase() +
                      campaign.submission.status.slice(1)}
                  </span>
                </div>
              </>
            )}
          </div>
          <div>
            <div className="text-center text-[#272830] text-lg font-medium">
              {campaign.title}
            </div>
            <span className="text-sm font-light">
              {campaign.brand?.name || "Unknown Brand"}
            </span>
          </div>
        </div>
        {/* <div className="flex items-center gap-1 mt-1">
          <span className="text-sm text-zinc-500">by</span>
          <span className="text-sm text-zinc-600">{campaign.brand?.name || "Unknown Brand"}</span>
        </div> */}
      </div>

      <div className="flex items-center gap-6">
        {/* <div className="text-right">
          <p className="text-sm font-medium text-zinc-900">
            ${Number(campaign.remaining_budget || campaign.budget_pool).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div> */}
        <button className="flex items-center text-sm text-black font-semibold">
          View More{" "}
          <ChevronDown
            className={cn(
              "transition-transform duration-200",
              isExpanded ? "rotate-180" : "rotate-0"
            )}
          />
        </button>
      </div>
    </div>
  )
}

export function CreatorAnalysisDashboard({
  transformedCampaigns = [],
  email,
  creator,
  organization_name,
}: CreatorDashboardClientProps) {
  const [campaigns, setCampaigns] =
    useState<CreatorCampaign[]>(transformedCampaigns)
  const [selectedCampaign, setSelectedCampaign] =
    useState<CreatorCampaign | null>(null)

  // Generate Graph Data
  const graphData =
    selectedCampaign?.submission?.previous_views?.map((entry) => ({
      date: entry.date
        ? new Date(entry.date).toISOString().split("T")[0]
        : "Unknown",
      views: entry.views ?? 0,
    })) || []

  const earningsGraphData =
    selectedCampaign?.submission?.previous_views?.map((entry) => ({
      date: entry.date,
      earnings: (entry.views * Number(selectedCampaign.rpm)) / 1000, // Convert views to earnings
    })) || []

  const handleCardClick = (campaign: CreatorCampaign) => {
    setSelectedCampaign(selectedCampaign?.id === campaign.id ? null : campaign)
  }

  return (
    <div className="min-h-screen bg-[#F2F6FA]">
      <DashboardHeader
        userType="creator"
        email={email}
        organization_name={organization_name}
      />

      <main className="lg:ml-80 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 rounded-2xl shadow-md bg-white inline-flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600">
                  Total Views
                </span>
                <Image
                  src={totalViewImg}
                  alt="total views"
                  className="w-8 h-8"
                />
              </div>
              <p className="text-2xl font-semibold text-zinc-900">
                {campaigns
                  .reduce(
                    (total, campaign) =>
                      total + (campaign.submission?.views || 0),
                    0
                  )
                  .toLocaleString()}
              </p>
            </Card>
          </div>

          {/* Available Campaigns Section */}
          <div className="mt-8">
            {/* <h2 className="text-xl font-semibold text-zinc-900">Available Campaigns</h2>
            <p className="text-sm text-zinc-500">Apply to campaigns and start earning</p> */}

            <div className="border-2 rounded-2xl  overflow-hidden">
              {campaigns.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-zinc-600">
                    No campaigns available at the moment.
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Check back soon for new opportunities!
                  </p>
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <div key={campaign.id}>
                    <CampaignCard
                      campaign={campaign}
                      onClick={() => handleCardClick(campaign)}
                      isExpanded={selectedCampaign?.id === campaign.id}
                    />
                    {selectedCampaign?.id === campaign.id && (
                      <>
                        <div className="flex md:flex-row flex-col p-4 gap-4 w-full">
                          <div className="flex flex-col md:w-1/2 p-4 bg-white rounded-2xl shadow-md">
                            {/* Latest Views Count Display */}
                            <div className="flex flex-col">
                              <h4 className="text-sm text-[#272830] font-medium">
                                Impressions
                              </h4>
                              {/* Extract the latest view count dynamically */}
                              <p className="text-7xl font-bold text-zinc-900">
                                {graphData.length > 0
                                  ? graphData[
                                      graphData.length - 1
                                    ].views.toLocaleString("en-US", {
                                      notation: "compact",
                                      maximumFractionDigits: 2,
                                    })
                                  : "0"}
                              </p>
                              <p className="text-green-600 text-sm font-medium">
                                +8.5% ↑
                              </p>
                            </div>

                            {graphData.length > 0 ? (
                              <ResponsiveContainer width="100%" height={200}>
                                <AreaChart
                                  data={graphData}
                                  margin={{
                                    top: 20,
                                    right: 20,
                                    left: 0,
                                    bottom: 0,
                                  }}
                                >
                                  {/* Blue Gradient for Impressions */}
                                  <defs>
                                    <linearGradient
                                      id="blueGradient"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop offset="0%" stopColor="#094283" />
                                      <stop
                                        offset="100%"
                                        stopColor="rgba(84, 140, 204, 0)"
                                      />
                                    </linearGradient>
                                  </defs>

                                  <XAxis dataKey="date" hide />
                                  <YAxis hide />

                                  {/* Tooltip */}
                                  <Tooltip
                                    content={({ active, payload }) => {
                                      if (active && payload?.length) {
                                        const dataPoint = payload[0].payload
                                        return (
                                          <div className="bg-white shadow-md px-4 py-2 rounded-lg text-sm text-gray-900 border border-gray-200">
                                            <p className="font-semibold text-zinc-600">
                                              {dataPoint.date}
                                            </p>
                                            <p className="text-[#548CCC]">
                                              {dataPoint.views.toLocaleString()}{" "}
                                              views
                                            </p>
                                          </div>
                                        )
                                      }
                                      return null
                                    }}
                                  />

                                  {/* Blue Area & Line */}
                                  <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#094283"
                                    strokeWidth={2}
                                    fill="url(#blueGradient)"
                                  />

                                  <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#094283"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#094283" }}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <p className="text-sm text-zinc-500">
                                No views data available
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col md:w-1/2 p-4 bg-white rounded-2xl shadow-md">
                            <h4 className="text-sm font-medium text-zinc-600 mb-2">
                              Earning
                            </h4>
                            <p className="text-7xl font-bold text-zinc-900">
                              {earningsGraphData.length > 0
                                ? `$${earningsGraphData[
                                    earningsGraphData.length - 1
                                  ].earnings.toLocaleString("en-US", {
                                    notation: "compact",
                                    maximumFractionDigits: 2,
                                  })}`
                                : "$0"}
                            </p>

                            <p className="text-green-600 text-sm font-medium">
                              +8.5% ↑
                            </p>
                            {earningsGraphData.length > 0 ? (
                              <ResponsiveContainer width="100%" height={200}>
                                <AreaChart
                                  data={earningsGraphData}
                                  margin={{
                                    top: 20,
                                    right: 20,
                                    left: 0,
                                    bottom: 0,
                                  }}
                                >
                                  {/* Green Gradient for Earnings */}
                                  <defs>
                                    <linearGradient
                                      id="greenGradient"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop offset="0%" stopColor="#54CC8B" />
                                      <stop
                                        offset="100%"
                                        stopColor="rgba(72, 199, 142, 0)"
                                      />
                                    </linearGradient>
                                  </defs>

                                  <XAxis dataKey="date" hide />
                                  <YAxis hide />

                                  {/* Tooltip */}
                                  <Tooltip
                                    content={({ active, payload }) =>
                                      active && payload?.length ? (
                                        <div className="bg-white shadow-md px-4 py-2 rounded-lg text-sm text-gray-900 border border-gray-200">
                                          <p className="font-semibold text-zinc-600">
                                            {payload[0].payload.date}
                                          </p>
                                          <p className="text-[#54CC8B]">{`$${(
                                            Number(payload[0].value) ?? 0
                                          ).toFixed(2)}`}</p>
                                        </div>
                                      ) : null
                                    }
                                  />

                                  {/* Green Area & Line */}
                                  <Area
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#54CC8B"
                                    strokeWidth={2}
                                    fill="url(#greenGradient)"
                                  />

                                  <Line
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#54CC8B"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#54CC8B" }}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <p className="text-sm text-zinc-500">
                                No earnings data available
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
