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
import { toast } from "sonner"
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
      toast.success("Report submitted successfully!")
      setIsOpen(false)
      setTitle("")
      setReason("")
    } catch (error) {
      console.error("Error reporting client:", error)
      toast.error("Failed to submit report.")
    }

    setLoading(false)
  }

  return (
    <>
      <div
        className="relative bg-white border border-5 border-zinc-200/60 rounded-2xl hover:shadow-[0_2px_5px_rgba(0,0,0,0.12)] shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-300 p-5"
        onClick={onClick}
      >
        {/* Status and Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-900 truncate max-w-[180px] md:max-w-full">
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

        {/* Brand Info */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-zinc-500">by</span>
          <span className="text-sm font-medium text-zinc-700">
            {campaign.brand?.name || "Unknown Brand"}
          </span>
          {campaign.brand?.payment_verified && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]"></span>
              <span className="text-xs text-[#5865F2]">Verified</span>
            </span>
          )}
        </div>

        {/* Budget, RPM & Submissions */}
        <div className="flex flex-wrap justify-between items-center gap-6 w-full md:w-auto mt-4">
          <div className="text-left">
            <p className="text-lg font-semibold text-zinc-900">
              $
              {Number(
                campaign.remaining_budget || campaign.budget_pool
              ).toFixed(2)}
            </p>
            {campaign.remaining_budget !== Number(campaign.budget_pool) && (
              <p className="text-xs text-zinc-500">
                of ${Number(campaign.budget_pool).toFixed(2)} total
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-900">
              ${Number(campaign.rpm).toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">RPM</p>
          </div>
          {campaign.submissions.length > 0 && (
            <span className="text-sm text-zinc-600 block">
              {campaign.submissions.length}{" "}
              {campaign.submissions.length === 1 ? "submission" : "submissions"}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
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
              {alreadyReported ? "Already Reported" : "Report Creator"}
            </Button>
          )}
          <button className="flex items-center text-sm font-medium text-zinc-900">
            View More
            <ChevronDown
              className={cn(
                "transition-transform duration-200 ml-1",
                isExpanded ? "rotate-180" : "rotate-0"
              )}
            />
          </button>
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
