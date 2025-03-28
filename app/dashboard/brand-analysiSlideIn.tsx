import { Button } from "@/components/ui/button"
import { RefreshCw, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { CampaignWithSubmissions, Submission } from "@/types/campaigns"
import { toast } from "sonner"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { VideoPlayer } from "@/components/video-player"
import { SetStateAction, Dispatch, useEffect } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts"

interface CampaignSlideInProps {
  selectedCampaign: CampaignWithSubmissions | null
  setSelectedCampaign: Dispatch<SetStateAction<CampaignWithSubmissions | null>>
  isRefreshingViews: boolean
  handleApprove: (submissionId: string) => void
  handleReject: (submissionId: string) => void
  setSelectedSubmission: Dispatch<SetStateAction<Submission | null>>
  selectedSubmission: Submission | null
  setCampaigns: Dispatch<SetStateAction<CampaignWithSubmissions[]>>
  setIsRefreshingViews: Dispatch<SetStateAction<boolean>>
  updateCampaignViews: (
    campaignId: string
  ) => Promise<{ success: boolean; error?: string }>
}

export const BrandsCampaignSlideIn = ({
  selectedCampaign,
  setSelectedCampaign,
  isRefreshingViews,
  setSelectedSubmission,
  selectedSubmission,
  setCampaigns,
  setIsRefreshingViews,
  updateCampaignViews,
}: CampaignSlideInProps) => {
  // Calculate remaining budget
  const calculateRemainingBudget = (campaign: CampaignWithSubmissions) => {
    return campaign.remaining_budget ?? Number(campaign.budget_pool)
  }

  const graphData =
    selectedCampaign?.submissions?.[0].previous_views?.map((entry) => ({
      date: entry.date
        ? new Date(entry.date).toISOString().split("T")[0]
        : "Unknown",
      views: entry.views ?? 0,
    })) || []
  // console.log("Selected campaiogn", selectedCampaign?.submissions)
  const earningsGraphData =
    selectedCampaign?.submissions?.[0].previous_views?.map((entry) => ({
      date: entry.date,
      earnings:
        ((Number(entry.views) || 0) * (Number(selectedCampaign.rpm) || 0)) /
        1000, // Convert views to earnings
    })) || []

  // console.log({ selectedCampaign })
  // Add effect to select first submission when campaign changes
  useEffect(() => {
    if (selectedCampaign && selectedCampaign.submissions.length > 0) {
      const sortedSubmissions = [...selectedCampaign.submissions].sort(
        (a, b) => {
          // Sort pending submissions to the top
          if (a.status === "pending" && b.status !== "pending") return -1
          if (a.status !== "pending" && b.status === "pending") return 1
          // Then sort by most recent
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        }
      )
      setSelectedSubmission(sortedSubmissions[0])
    } else {
      setSelectedSubmission(null)
    }
  }, [selectedCampaign])

  // Update remaining budget when campaign changes
  useEffect(() => {
    if (selectedCampaign) {
      const remaining = calculateRemainingBudget(selectedCampaign)
      if (remaining !== selectedCampaign.remaining_budget) {
        setSelectedCampaign({
          ...selectedCampaign,
          remaining_budget: remaining,
          has_insufficient_budget: remaining < 10, // Mark as insufficient if less than $10
        })
      }
    }
  }, [selectedCampaign])

  // Add effect to fetch views when campaign is selected
  useEffect(() => {
    if (selectedCampaign) {
      const fetchViews = async () => {
        try {
          setIsRefreshingViews(true)
          const result = await updateCampaignViews(selectedCampaign.id)
          if (result.success) {
            // Only update the views in the state
            setSelectedCampaign((prev) => {
              if (!prev) return null
              return {
                ...prev,
                submissions: prev.submissions.map((sub) => ({
                  ...sub,
                  views: sub.views, // Keep existing views as they were updated in the database
                })),
              }
            })
            setCampaigns((prevCampaigns) =>
              prevCampaigns.map((c) =>
                c.id === selectedCampaign.id
                  ? {
                      ...c,
                      submissions: c.submissions.map((sub) => ({
                        ...sub,
                        views: sub.views, // Keep existing views as they were updated in the database
                      })),
                    }
                  : c
              )
            )
          } else if (result.error) {
            toast.error("Failed to fetch views")
          }
        } catch (error) {
          console.error("Error fetching views:", error)
          toast.error("Failed to fetch views")
        } finally {
          setIsRefreshingViews(false)
        }
      }

      fetchViews()
    }
  }, [selectedCampaign?.id])

  return (
    <div>
      {selectedCampaign && (
        <div className="h-full flex flex-col bg-white">
          <div className="flex md:flex-row flex-col p-4 gap-4 w-full">
            <div className="flex flex-col md:w-1/2 p-4 bg-white rounded-2xl shadow-md">
              {/* Latest Views Count Display */}
              <div className="flex flex-col">
                <h4 className="text-sm text-[#272830] font-medium">Views</h4>
                {/* Extract the latest view count dynamically */}
                <p className="text-7xl font-bold text-zinc-900">
                  {graphData.length > 0
                    ? graphData[graphData.length - 1].views.toLocaleString(
                        "en-US",
                        {
                          notation: "compact",
                          maximumFractionDigits: 2,
                        }
                      )
                    : "0"}
                </p>
                <p className="text-green-600 text-sm font-medium">+8.5% ↑</p>{" "}
                {/* Dynamic Percentage */}
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
                    {/* Blue Gradient for Views */}
                    <defs>
                      <linearGradient
                        id="blueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#094283" />
                        <stop offset="100%" stopColor="rgba(84, 140, 204, 0)" />
                      </linearGradient>
                    </defs>

                    <XAxis dataKey="date" hide />
                    <YAxis hide />

                    {/* Tooltip */}
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const dataPoint = payload[0].payload
                          return (
                            <div className="bg-white shadow-md px-4 py-2 rounded-lg text-sm text-gray-900 border border-gray-200">
                              <p className="font-semibold text-zinc-600">
                                {dataPoint.date}
                              </p>
                              <p className="text-[#548CCC]">
                                {dataPoint.views.toLocaleString()} views
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
                      fill="url(#blueGradient)"
                      strokeWidth={2}
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
                <p className="text-sm text-zinc-500">No views data available</p>
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

              <p className="text-green-600 text-sm font-medium">+8.5% ↑</p>
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
                          stopColor="rgba(72, 199, 142, 0.15)"
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
                              Number(payload?.[0]?.value) ?? 0
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
        </div>
      )}
    </div>
  )
}
