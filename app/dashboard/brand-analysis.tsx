"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { DollarSign, FileText, Users, RotateCw } from "lucide-react"

import { CampaignWithSubmissions, Submission } from "@/types/campaigns"
import {
  approveSubmission,
  pollNewSubmissions,
  rejectSubmission,
  updateCampaignViews,
} from "../explore/actions"
import { Metrics } from "../explore/components/metrics"
import { TeamManagement } from "../explore/TeamManagement"
import { CampaignCard } from "../explore/components/campaign-card"
import { CampaignSlideIn } from "../explore/components/campaign-slide-in"
import { CreateCampaignModal } from "../explore/components/create-campaign-modal"
import { CampaignCardBrand } from "./campaign-cardbrand"
import { BrandsCampaignSlideIn } from "./brand-analysiSlideIn"

interface DashboardClientProps {
  initialCampaigns: CampaignWithSubmissions[]
  brandId: string
  email: string
  organization_name: string
}

export function DashboardAnalysisBrand({
  initialCampaigns,
  brandId,
  email,
  organization_name,
}: DashboardClientProps) {
  const [campaigns, setCampaigns] =
    useState<CampaignWithSubmissions[]>(initialCampaigns)

  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignWithSubmissions | null>(null)
  const router = useRouter()
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null)
  const [isRefreshingViews, setIsRefreshingViews] = useState(false)

  useEffect(() => {
    // Poll for new submissions every minute
    const pollInterval = setInterval(async () => {
      try {
        const campaignIds = campaigns.map((campaign) => campaign.id)
        const newSubmissions = await pollNewSubmissions(campaignIds)

        if (newSubmissions && newSubmissions.length > 0) {
          // Update campaigns with new submissions, checking for duplicates
          setCampaigns((currentCampaigns) =>
            currentCampaigns.map((campaign) => {
              const newSubmission = newSubmissions.find(
                (s) => s.campaign_id === campaign.id
              )
              if (newSubmission) {
                // Check if we already have this submission
                const isDuplicate = campaign.submissions.some(
                  (existingSubmission) =>
                    existingSubmission.id === newSubmission.id
                )

                // If it's a duplicate, return the campaign unchanged
                if (isDuplicate) {
                  return campaign
                }

                // If it's not a duplicate, add the new submission
                return {
                  ...campaign,
                  submissions: [
                    ...campaign.submissions,
                    {
                      ...newSubmission,
                      user_id: newSubmission.user_id,
                      creator: {
                        full_name:
                          newSubmission.creator.organization_name || null,
                        email: newSubmission.creator.email || null,
                        organization_name:
                          newSubmission.creator.organization_name || null,
                      },
                    } as Submission,
                  ],
                  activeSubmissionsCount: campaign.activeSubmissionsCount + 1,
                }
              }
              return campaign
            })
          )

          // Only show toast if there were actually new submissions added
          const hasNewNonDuplicateSubmissions = campaigns.some((campaign) =>
            newSubmissions.some(
              (newSub) =>
                newSub.campaign_id === campaign.id &&
                !campaign.submissions.some(
                  (existingSub) => existingSub.id === newSub.id
                )
            )
          )

          if (hasNewNonDuplicateSubmissions) {
            toast.success("New submission received!", {
              description:
                "A creator has submitted a video to one of your campaigns.",
              action: {
                label: "Refresh",
                onClick: () => router.refresh(),
              },
            })
          }
        }
      } catch (error) {
        console.error("Error polling for new submissions:", error)
      }
    }, 60000) // Poll every minute

    return () => clearInterval(pollInterval)
  }, [campaigns])
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCampaign(null)
      }
    }

    if (selectedCampaign) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [selectedCampaign])

  const handleCardClick = (campaign: CampaignWithSubmissions) => {
    if (selectedCampaign?.id === campaign.id) {
      setSelectedCampaign(null) // Close modal
    } else {
      setSelectedCampaign(campaign)
    }
  }
  return (
    <div className="min-h-screen bg-[#F2F6FA]">
      <DashboardHeader
        userType="brand"
        email={email}
        organization_name={organization_name}
      />

      {/* Metrics */}
      <main className="lg:ml-72 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
          <Metrics campaigns={campaigns} />
          {brandId && <TeamManagement brandId={brandId} />}
          <div className="mt-8">
            <div className="border-2 rounded-md border-zinc-200 overflow-hidden divide-y divide-zinc-200">
              {campaigns.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-zinc-600">No campaigns created yet.</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Create your first campaign to start receiving submissions!
                  </p>
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <>
                    <CampaignCardBrand
                      key={campaign.id} // Ensure each item in the list has a unique key
                      campaign={campaign}
                      onClick={() => handleCardClick(campaign)}
                      isExpanded={selectedCampaign?.id === campaign.id}
                    />
                    {selectedCampaign && (
                      <BrandsCampaignSlideIn
                        selectedCampaign={selectedCampaign}
                        setSelectedCampaign={setSelectedCampaign}
                        isRefreshingViews={isRefreshingViews}
                        setSelectedSubmission={setSelectedSubmission}
                        selectedSubmission={selectedSubmission}
                        setCampaigns={setCampaigns}
                        setIsRefreshingViews={setIsRefreshingViews}
                        updateCampaignViews={updateCampaignViews}
                      />
                    )}
                  </>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Render the slide-in component once outside the loop */}
      </main>

      {/* Overlay */}
      {/* {selectedCampaign && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity z-[55]"
          onClick={() => setSelectedCampaign(null)}
        />
      )} */}
    </div>
  )
}
