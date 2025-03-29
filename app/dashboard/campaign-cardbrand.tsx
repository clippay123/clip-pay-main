import { useEffect, useState } from "react"
import { CampaignWithSubmissions } from "@/types/campaigns"
import { cn } from "@/lib/utils"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

import { ChevronDown } from "lucide-react"
import {
  checkIfAlreadyReported,
  hasApprovedOrPaidSubmission,
  reportClient,
} from "../explore/actions"

export const CampaignCardBrand = ({
  campaign,
  onClick,
  isExpanded,
  organization_name,
}: {
  campaign: CampaignWithSubmissions
  onClick: () => void
  isExpanded: boolean
  organization_name: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [alreadyReported, setAlreadyReported] = useState(false)
  const [canReport, setCanReport] = useState(false)
  useEffect(() => {
    if (campaign.id) {
      checkIfAlreadyReported(campaign.id).then(setAlreadyReported)
    }
  }, [campaign.id])

  // Check if campaign has an approved/paid submission
  useEffect(() => {
    if (campaign.id) {
      hasApprovedOrPaidSubmission(campaign.id).then((result) => {
        // console.log("Can Report Status:", result) // Debugging
        setCanReport(result)
      })
    }
  }, [campaign.id])

  const handleReport = async () => {
    if (!title.trim() || !reason.trim()) return
    setLoading(true)

    try {
      await reportClient(campaign.id, title, reason) // ✅ Call report function from actions
      alert("Report submitted successfully!")
      setIsOpen(false)
      setTitle("")
      setReason("")
    } catch (error) {
      console.error("Error reporting client:", error)
      alert("Failed to submit report.")
    }

    setLoading(false)
  }
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
    <>
      <div
        className="flex flex-wrap justify-between md:flex-nowrap items-center gap-4 p-4 bg-white rounded-lg group cursor-pointer shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300"
        onClick={onClick}
      >
        {/* Left Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-2">
              <div className="bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                {progressText}
              </div>
              {campaign.has_insufficient_budget ||
                campaign.remaining_budget === 0 || (
                  <>
                    <div className="flex w-1/2 mx-auto rounded-2xl items-center gap-2 p-1 px-2 border-[#E4E4E7] border-[3px] text-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap",
                          campaign.has_insufficient_budget ||
                            campaign.remaining_budget === 0 ||
                            campaign.status === "inactive"
                            ? "bg-white text-red-700"
                            : campaign.status === "active"
                              ? "bg-white text-green-700"
                              : "bg-white text-yellow-700"
                        )}
                      >
                        {campaign.has_insufficient_budget ||
                        campaign.remaining_budget === 0 ||
                        campaign.status === "inactive"
                          ? "Campaign Closed"
                          : (campaign.status || "Draft")
                              .charAt(0)
                              .toUpperCase() +
                            (campaign.status || "Draft").slice(1)}
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
                {organization_name || "Unknown Brand"}
              </span>
            </div>
          </div>
          {/* <div className="flex items-center gap-1 mt-1">
          <span className="text-sm text-zinc-500">by</span>
          <span className="text-sm text-zinc-600">{campaign.brand?.name || "Unknown Brand"}</span>
        </div> */}
        </div>

        {/* Right Section */}
        <div className="flex flex-wrap h-fit gap-6 w-full md:w-auto">
          {/* <div className="text-right">
            <p className="text-sm font-medium text-zinc-900">
              ${Number(campaign.remaining_budget || 0).toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">Remaining Budget</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-900">
              ${Number(campaign.rpm).toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">RPM</p>
          </div> */}

          <div className="text-right">
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
      </div>

      {/* Report Client Popup */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Creator</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Report Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />

          <Textarea
            placeholder="Explain the reason for reporting..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReport}
              disabled={loading}
            >
              {loading ? "Reporting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
