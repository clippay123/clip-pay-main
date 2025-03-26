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
import {
  checkIfAlreadyReported,
  hasApprovedOrPaidSubmission,
  reportClient,
} from "../actions"
import { ChevronDown } from "lucide-react"

export const CampaignCard = ({
  campaign,
  onClick,
  isExpanded,
}: {
  campaign: CampaignWithSubmissions
  onClick: () => void
  isExpanded: boolean
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

  // Check if the campaign has an approved/paid submission
  useEffect(() => {
    if (campaign.id) {
      hasApprovedOrPaidSubmission(campaign.id).then((result) => {
        setCanReport(result)
      })
    }
  }, [campaign.id])

  const handleReport = async () => {
    if (!title.trim() || !reason.trim()) return
    setLoading(true)

    try {
      await reportClient(campaign.id, title, reason)
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

  return (
    <>
      <div
        className="flex flex-wrap sm:flex-nowrap items-center gap-5 p-5 bg-white rounded-xl group cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 border border-zinc-200"
        onClick={onClick}
      >
        {/* Left Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-zinc-900 truncate max-w-[200px] md:max-w-full">
              {campaign.title}
            </h3>
            <span
              className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap",
                campaign.has_insufficient_budget ||
                  campaign.remaining_budget === 0 ||
                  campaign.status === "inactive"
                  ? "bg-red-100 text-red-700"
                  : campaign.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
              )}
            >
              {campaign.has_insufficient_budget ||
              campaign.remaining_budget === 0 ||
              campaign.status === "inactive"
                ? "Campaign Closed"
                : (campaign.status || "Draft").charAt(0).toUpperCase() +
                  (campaign.status || "Draft").slice(1)}
            </span>
          </div>

          {/* Submissions Count */}
          {campaign.submissions.length > 0 && (
            <span className="text-sm text-zinc-500 block mt-1">
              {campaign.submissions.length}{" "}
              {campaign.submissions.length === 1 ? "submission" : "submissions"}
            </span>
          )}
        </div>

        {/* Right Section */}
        <div className="flex flex-wrap justify-between items-center gap-6 w-full md:w-auto">
          <div className="text-right">
            <p className="text-sm font-semibold text-zinc-900">
              ${Number(campaign.remaining_budget || 0).toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">Remaining Budget</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-zinc-900">
              ${Number(campaign.rpm).toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">RPM</p>
          </div>

          {canReport && (
            <Button
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(true)
              }}
              disabled={alreadyReported}
              className="text-sm w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              {alreadyReported ? "Already Reported" : "Report Client"}
            </Button>
          )}
          <button
            className="flex items-center text-sm font-medium text-zinc-900 hover:text-zinc-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            View More
            <ChevronDown
              className={cn(
                "ml-1 transition-transform duration-200",
                isExpanded ? "rotate-180" : "rotate-0"
              )}
            />
          </button>
        </div>
      </div>

      {/* Report Client Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg mx-auto rounded-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-zinc-900">
              Report Creator
            </DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Report Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-zinc-300 focus:border-zinc-500 focus:ring-0"
          />

          <Textarea
            placeholder="Explain the reason for reporting..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full mt-3 border-zinc-300 focus:border-zinc-500 focus:ring-0"
            rows={4}
          />

          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-zinc-300 hover:bg-zinc-100 text-zinc-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReport}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Reporting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
