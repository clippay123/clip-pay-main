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

export const CampaignCard = ({
  campaign,
  onClick,
}: {
  campaign: CampaignWithSubmissions
  onClick: () => void
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
        console.log("Can Report Status:", result) // Debugging
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

  return (
    <>
      <div
        className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 bg-white rounded-lg group cursor-pointer shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300"
        onClick={onClick}
      >
        {/* Left Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-zinc-900 truncate max-w-[180px] md:max-w-full">
              {campaign.title}
            </h3>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap",
                campaign.has_insufficient_budget ||
                  campaign.remaining_budget === 0 ||
                  campaign.status === "inactive"
                  ? "bg-red-50 text-red-700"
                  : campaign.status === "active"
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
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
            <span className="text-sm text-zinc-600 block mt-1">
              {campaign.submissions.length}{" "}
              {campaign.submissions.length === 1 ? "submission" : "submissions"}
            </span>
          )}
        </div>

        {/* Right Section */}
        <div className="flex flex-wrap justify-between items-center gap-6 w-full md:w-auto">
          <div className="text-right">
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
          </div>

          {canReport && (
            <Button
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(true)
              }}
              disabled={alreadyReported}
              className="text-sm w-full md:w-auto"
            >
              {alreadyReported ? "Already Reported" : "Report Client"}
            </Button>
          )}
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
