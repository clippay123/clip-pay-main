import { useState } from "react"
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
import { reportClient } from "../actions"

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
        className="flex items-center gap-4 p-4 hover:bg-zinc-50 rounded-lg group cursor-pointer"
        onClick={onClick}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-zinc-900 truncate">
              {campaign.title}
            </h3>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
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
          <div className="flex items-center gap-2 mt-1">
            {campaign.submissions.length > 0 && (
              <span className="text-sm text-zinc-600">
                {campaign.submissions.length}{" "}
                {campaign.submissions.length === 1
                  ? "submission"
                  : "submissions"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
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
        </div>
        <Button
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(true)
          }}
        >
          Report Client
        </Button>
      </div>

      {/* Report Client Popup */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Client</DialogTitle>
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
