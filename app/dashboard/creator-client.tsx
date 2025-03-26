"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Upload,
  Share,
  X,
  DollarSign,
  Users,
  ArrowUpRight,
  RotateCw,
  Pencil,
  ArrowDown,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  submitVideo,
  getCreatorCampaigns,
  updateSubmissionVideoUrl,
  checkForNotifications,
  markNotificationAsSeen,
} from "./actions"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VideoPlayer } from "@/components/video-player"
import { VideoUrlInput } from "@/components/video-url-input"
import { StripeConnectBanner } from "@/components/stripe-connect-banner"
import { CreatorCampaign, Submission } from "./creator-campaigns"
import totalEarnedImg from "@/public/assets/earned.svg"
import totalViewImg from "@/public/assets/totalView.svg"
import SealedCheckImg from "@/public/assets/SealCheck.svg"
import Image from "next/image"
interface NotificationMetadata {
  campaign_title: string
  submission_id: string
}

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
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white border group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-zinc-900 truncate">
            {campaign.title}
          </h3>
          {campaign.submission && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                campaign.submission.status === "approved"
                  ? "bg-green-50 text-green-700"
                  : campaign.submission.status === "rejected"
                    ? "bg-red-50 text-red-700"
                    : "bg-[#5865F2]/10 text-[#5865F2]"
              )}
            >
              {campaign.submission.status.charAt(0).toUpperCase() +
                campaign.submission.status.slice(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-sm text-zinc-500">by</span>
          <span className="text-sm text-zinc-600">
            {campaign.brand?.name || "Unknown Brand"}
          </span>
          {campaign.brand?.payment_verified && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]"></span>
              <span className="text-xs text-[#5865F2]">Verified</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm font-medium text-zinc-900">
            $
            {Number(
              campaign.remaining_budget || campaign.budget_pool
            ).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          {campaign.remaining_budget !== Number(campaign.budget_pool) && (
            <p className="text-xs text-zinc-500">
              of $
              {Number(campaign.budget_pool).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              total
            </p>
          )}
        </div>
        {/* <div className="text-right">
          <p className="text-sm font-medium text-zinc-900">
            $
            {Number(campaign.rpm).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-zinc-500">RPM</p>
        </div> */}
        <div className="text-right">
          <button className="flex items-center text-sm font-medium text-zinc-900">
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
  )
}

function Section({ title, content }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-900 mb-2">{title}</h3>
      <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm overflow-hidden break-words">
        <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed break-words">
          {content}
        </p>
      </div>
    </div>
  )
}

export function CreatorDashboardClient({
  transformedCampaigns = [],
  email,
  creator,
  organization_name,
}: CreatorDashboardClientProps) {
  const [campaigns, setCampaigns] =
    useState<CreatorCampaign[]>(transformedCampaigns)
  const [newCampaigns, setNewCampaigns] = useState<CreatorCampaign[]>([])
  const [hasNewCampaigns, setHasNewCampaigns] = useState(false)
  const [selectedCampaign, setSelectedCampaign] =
    useState<CreatorCampaign | null>(null)
  const [videoUrls, setVideoUrls] = useState<string[]>([])

  const [updatingUrl, setUpdatingUrl] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedCampaignId, setSubmittedCampaignId] = useState<string | null>(
    null
  )
  const [isDragging, setIsDragging] = useState(false)
  const [copiedCampaign, setCopiedCampaign] = useState<string | null>(null)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)

  const isJustSubmitted =
    selectedCampaign && selectedCampaign.id === submittedCampaignId

  useEffect(() => {
    // Poll for updates every minute
    const pollInterval = setInterval(async () => {
      try {
        // Check for new campaigns
        const latestCampaigns = await getCreatorCampaigns()

        console.log("latestCampaigns", latestCampaigns)
        // Update existing campaign statuses
        setCampaigns((prevCampaigns) => {
          return prevCampaigns.map((prevCampaign) => {
            const updatedCampaign = latestCampaigns.find(
              (c) => c.id === prevCampaign.id
            )

            // If we have an updated campaign, check if it's actually different
            if (updatedCampaign) {
              const hasChanged =
                // Status changed
                updatedCampaign.status !== prevCampaign.status ||
                // Budget changed
                updatedCampaign.remaining_budget !==
                  prevCampaign.remaining_budget ||
                // Submission status changed
                updatedCampaign.submission?.status !==
                  prevCampaign.submission?.status ||
                // Had no submission before but now has one
                (!prevCampaign.submission && updatedCampaign.submission)

              if (hasChanged) {
                // If the campaign has changed, update the selected campaign as well
                if (selectedCampaign?.id === prevCampaign.id) {
                  setSelectedCampaign(updatedCampaign)
                }
                return updatedCampaign
              }
            }
            return prevCampaign
          })
        })

        // Check for new campaigns
        const newOnes = latestCampaigns.filter(
          (newCampaign) =>
            !campaigns.some((existing) => existing.id === newCampaign.id)
        )

        if (newOnes.length > 0) {
          setNewCampaigns(newOnes)
          setHasNewCampaigns(true)
          toast.success(
            `${newOnes.length} new campaign${newOnes.length > 1 ? "s" : ""} available!`
          )
        }

        // Check for notifications
        const notifications = await checkForNotifications()
        if (notifications && notifications.length > 0) {
          notifications.forEach(async (notification) => {
            const metadata = notification.metadata as NotificationMetadata
            const campaign = latestCampaigns.find(
              (c) => c.submission?.id === metadata?.submission_id
            )
            if (campaign?.submission) {
              const status =
                campaign.submission.status === "pending"
                  ? "submitted"
                  : campaign.submission.status
              toast.success(
                `Your video for campaign "${metadata?.campaign_title}" has been ${status}!`,
                {
                  description:
                    campaign.submission.status === "approved"
                      ? "You can now add your public video URL to start earning."
                      : "Please check the campaign guidelines and submit a new video.",
                  duration: 5000,
                  action: {
                    label: "View Campaign",
                    onClick: () => {
                      setSelectedCampaign(campaign)
                    },
                  },
                }
              )
              await markNotificationAsSeen(notification.id)
            }
          })
        }
      } catch (error) {
        console.error("Error polling for updates:", error)
      }
    }, 60000)

    return () => clearInterval(pollInterval)
  }, [campaigns, selectedCampaign])

  useEffect(() => {
    if (selectedCampaign?.submission) {
      console.log("selectedCampaign.submission", selectedCampaign.submission)
      if (
        Array.isArray(selectedCampaign.submission.video_urls) &&
        selectedCampaign.submission.video_urls.length > 0
      ) {
        setVideoUrls(selectedCampaign.submission.video_urls)
      } else if (selectedCampaign.submission.video_url) {
        setVideoUrls([selectedCampaign.submission.video_url])
      } else {
        setVideoUrls([])
      }
    } else {
      setVideoUrls([])
    }
    setIsEditing(false)
  }, [selectedCampaign])

  // Calculate total potential earnings from approved videos
  useEffect(() => {
    const earnings = campaigns.reduce((total, campaign) => {
      if (campaign.submission?.status) {
        const views = campaign.submission.views || 0
        const rpm = parseFloat(campaign.rpm)
        const videoEarnings = (views * rpm) / 1000
        // Only count earnings if this individual video has earned $25 or more
        return total + videoEarnings
      }
      return total
    }, 0)
    setTotalEarnings(earnings)
  }, [campaigns])

  const handleShowNewCampaigns = () => {
    setCampaigns((prev) => [...newCampaigns, ...prev])
    setNewCampaigns([])
    setHasNewCampaigns(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error("File size exceeds 100MB limit")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      if (droppedFile.size > 100 * 1024 * 1024) {
        toast.error("File size exceeds 100MB limit")
        return
      }
      setFile(droppedFile)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCampaign) return

    // Check if the campaign has sufficient budget
    if (Number(selectedCampaign.remaining_budget) < 10) {
      toast.error(
        "This campaign's budget is too low to accept new submissions."
      )
      return
    }

    setIsSubmitting(true)

    try {
      if (file) {
        const response = await submitVideo({
          campaignId: selectedCampaign.id,
          file,
        })

        if (response.error || !response.submission) {
          throw new Error(response.error || "Failed to submit video")
        }

        // Update local state with the submission details
        const updatedSubmission: Submission = {
          id: response.submission.id,
          status: response.submission.status,
          video_url: response.submission.video_url,
          file_path: response.submission.file_path,
          campaign_id: response.submission.campaign_id,
          user_id: response.submission.user_id,
          created_at: response.submission.created_at,
          views: response.submission.views,
          transcription: response.submission.transcription,
          creator: {
            organization_name:
              response.submission.creator?.organization_name || null,
          },
          video_urls: null,
        }

        setCampaigns((prevCampaigns) => {
          return prevCampaigns.map((prevCampaign) => {
            if (prevCampaign.id === selectedCampaign.id) {
              const updatedCampaign: CreatorCampaign = {
                ...prevCampaign,
                submission: updatedSubmission,
              }
              return updatedCampaign
            }
            return prevCampaign
          })
        })

        setSelectedCampaign((prev) => {
          if (!prev) return null
          const updatedCampaign: CreatorCampaign = {
            ...prev,
            submission: updatedSubmission,
          }
          return updatedCampaign
        })

        setSubmittedCampaignId(selectedCampaign.id)
        toast.success("Video submitted successfully!")
      }
    } catch (error) {
      console.error("Error submitting video:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to submit video"
      )
    } finally {
      setIsSubmitting(false)
      setFile(null)
    }
  }

  const renderSubmissionSection = () => {
    if (!selectedCampaign) return null

    // Check if campaign has insufficient budget and no existing submission
    if (
      Number(selectedCampaign.remaining_budget) < 10 &&
      !selectedCampaign.submission
    ) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Campaign Closed</p>
          <p className="text-sm mt-1">
            This campaign is no longer accepting submissions due to insufficient
            budget.
          </p>
        </div>
      )
    }

    if (isJustSubmitted) {
      return (
        <div className="space-y-4 border-t border-zinc-700 pt-6">
          <div className="bg-green-500/10 text-green-500 p-4 rounded-md space-y-3">
            <h3 className="text-lg font-medium">
              Video Successfully Submitted!
            </h3>
            <p className="text-sm">
              Your video has been submitted for review. You can view all your
              submissions in your{" "}
              <Button
                variant="link"
                className="text-green-500 p-0 h-auto font-semibold hover:text-green-400"
                onClick={() => {
                  /* TODO: Add navigation to submissions page */
                }}
              >
                submissions dashboard
              </Button>
              .
            </p>
          </div>
          {selectedCampaign?.submission?.file_path && (
            <div className="bg-white border border-zinc-200 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-zinc-900 mb-3">
                Preview Your Submission
              </h4>
              <VideoPlayer
                url={selectedCampaign.submission.file_path}
                isSupabaseStorage={true}
              />
            </div>
          )}
        </div>
      )
    }

    if (selectedCampaign?.submission) {
      return (
        <div className="space-y-4 border-t border-zinc-200 pt-6">
          <div className="bg-[#5865F2]/10 text-[#5865F2] p-4 rounded-lg border border-[#5865F2]/20 space-y-3">
            <h3 className="text-lg font-medium">
              {selectedCampaign.submission.status === "approved"
                ? "Your submission has been approved! 🎉"
                : selectedCampaign.submission.status === "fulfilled"
                  ? "You've been paid for your submission! 🎉 ⭐️ ⭐️ ⭐️"
                  : "You've already submitted for this campaign"}
            </h3>
            {selectedCampaign.submission.status === "approved" ? (
              <div className="space-y-3">
                <p className="text-sm text-zinc-600">
                  Your submission has been approved! To start earning, please
                  update your submission with a public video URL.
                </p>
                <VideoUrlInput
                  videoViews={selectedCampaign.submission.views}
                  submissionId={selectedCampaign.submission.id}
                  currentUrls={videoUrls} // Pass the updated video URLs array
                  onUpdate={(views) => {
                    // Update the campaigns list with new views
                    setCampaigns((prevCampaigns) => {
                      return prevCampaigns.map((campaign) => {
                        if (campaign.id === selectedCampaign.id) {
                          return {
                            ...campaign,
                            submission: campaign.submission
                              ? {
                                  ...campaign.submission,
                                  views,
                                }
                              : null,
                          }
                        }
                        return campaign
                      })
                    })

                    // Update selected campaign
                    setSelectedCampaign((prev) => {
                      if (!prev) return null
                      return {
                        ...prev,
                        submission: prev.submission
                          ? {
                              ...prev.submission,
                              views,
                            }
                          : null,
                      }
                    })
                  }}
                />
              </div>
            ) : (
              <p className="text-sm">
                View your submission in your{" "}
                <a
                  href="/submissions"
                  className="text-[#5865F2] p-0 h-auto font-semibold dark:hover:text-[#4752C4] hover:text-[#4752C4]"
                >
                  submissions dashboard
                </a>
                .
              </p>
            )}
          </div>
          {selectedCampaign.submission.file_path && (
            <div className="bg-white border border-zinc-200 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-zinc-900 mb-3">
                Your Submission
              </h4>
              <VideoPlayer
                url={selectedCampaign.submission.file_path}
                isSupabaseStorage={true}
              />
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-4 border-t border-zinc-700 pt-6">
        <h3 className="text-lg font-medium text-white">Apply for Campaign</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file" className="text-zinc-900">
              Upload Video
            </Label>
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-8 transition-colors
                ${
                  isDragging
                    ? "border-[#5865F2] bg-[#5865F2]/5"
                    : file
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-zinc-200 hover:border-zinc-300 bg-white"
                }
              `}
            >
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div
                  className={`rounded-full p-3 transition-colors ${
                    file ? "bg-green-500/10" : "bg-zinc-100"
                  }`}
                >
                  <Upload
                    className={`h-6 w-6 ${
                      file ? "text-green-500" : "text-zinc-600"
                    }`}
                  />
                </div>
                {file ? (
                  <>
                    <div className="text-sm text-green-500 font-medium">
                      {file.name}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="text-zinc-600 hover:text-zinc-900"
                    >
                      Remove file
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        Drag and drop your video here, or click to browse
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Supports MP4, MOV, and other common video formats
                      </p>
                    </div>
                    <Input
                      id="file"
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !file}
            className="bg-[#5865F2]"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  const handleCardClick = (campaign: CreatorCampaign) => {
    if (selectedCampaign?.id === campaign.id) {
      setSelectedCampaign(null) // Close modal
    } else {
      setSelectedCampaign(campaign)
    }
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
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 rounded-2xl  shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600">
                  Total Earnings
                </span>
                <div className="">
                  <Image
                    src={totalEarnedImg}
                    alt="total earned"
                    className="w-8 h-8"
                  />
                </div>
              </div>
              <p className="text-2xl font-semibold text-zinc-900">
                $ {totalEarnings ? totalEarnings : 0}
              </p>
            </Card>
            <Card className="p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600">
                  Total Earned
                </span>
                <div className="">
                  <Image
                    src={totalEarnedImg}
                    alt="total earned"
                    className="w-8 h-8"
                  />
                </div>
              </div>
              <p className="text-2xl font-semibold text-zinc-900">
                $ {totalEarnings ? totalEarnings : 0}
              </p>
            </Card>
            <Card className="p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600">
                  Total Views
                </span>
                <div className="">
                  <Image
                    src={totalViewImg}
                    alt="total earned"
                    className="w-8 h-8"
                  />
                </div>
              </div>
              <p className="text-2xl font-semibold text-zinc-900">
                ${" "}
                {campaigns
                  .reduce((total, campaign) => {
                    // Get the views from the submission if it exists
                    const submissionViews = campaign.submission?.views || 0
                    return total + submissionViews
                  }, 0)
                  .toLocaleString()}
              </p>
            </Card>
            <Card className="p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-white inline-flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600">
                  Avg. RPM
                </span>
                <div className="">
                  <Image
                    src={SealedCheckImg}
                    alt="total earned"
                    className="w-8 h-8"
                  />
                </div>
              </div>
              <p className="text-2xl font-semibold text-zinc-900">$0</p>
            </Card>
          </div>

          {/* Available Campaigns Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  Available Campaigns
                </h2>
                <p className="text-sm text-zinc-500">
                  Apply to campaigns and start earning
                </p>
              </div>
              {hasNewCampaigns && (
                <Button
                  onClick={handleShowNewCampaigns}
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                >
                  Show New Campaigns
                </Button>
              )}
            </div>

            <div className="border-2 rounded-md border-zinc-200 overflow-hidden divide-y divide-zinc-200">
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
                  <>
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onClick={() => handleCardClick(campaign)}
                      isExpanded={selectedCampaign?.id === campaign.id}
                    />
                    <div
                      className={`
            `}
                    >
                      {selectedCampaign?.id === campaign.id && (
                        <div className="h-full flex flex-col bg-white">
                          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
                            <div className="space-y-6">
                              {/* Campaign details */}
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm">
                                    <p className="text-sm text-zinc-600 mb-1">
                                      Budget Pool
                                    </p>
                                    <div className="space-y-1">
                                      <p className="text-2xl font-semibold text-zinc-900 break-words">
                                        $
                                        {Number(
                                          selectedCampaign.remaining_budget ||
                                            selectedCampaign.budget_pool
                                        ).toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm">
                                    <p className="text-sm text-zinc-600 mb-1">
                                      RPM
                                    </p>
                                    <p className="text-2xl font-semibold text-zinc-900 break-words">
                                      $
                                      {Number(
                                        selectedCampaign.rpm
                                      ).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </p>
                                  </div>
                                </div>

                                {/* Guidelines Section */}
                                {selectedCampaign.guidelines && (
                                  <Section
                                    title="Guidelines"
                                    content={selectedCampaign.guidelines}
                                  />
                                )}
                                {selectedCampaign.video_outline && (
                                  <Section
                                    title="Video Outline"
                                    content={selectedCampaign.video_outline}
                                  />
                                )}
                                {selectedCampaign.community_link && (
                                  <Section
                                    title="Community Link"
                                    content={selectedCampaign.community_link}
                                  />
                                )}
                                {selectedCampaign.google_drive_link && (
                                  <Section
                                    title="Google Drive Link"
                                    content={selectedCampaign.google_drive_link}
                                  />
                                )}
                                {selectedCampaign.example_video && (
                                  <Section
                                    title="Example Video"
                                    content={selectedCampaign.example_video}
                                  />
                                )}
                              </div>
                              {/* Submission section */}
                              {renderSubmissionSection()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ))
              )}
            </div>
          </div>

          {/* Campaign Details Slide-in */}

          {/* Overlay */}
          {/* {selectedCampaign && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity z-[55]"
              onClick={() => setSelectedCampaign(null)}
            />
          )} */}

          {/* Add Video Modal */}
          <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white border-zinc-200">
              <DialogTitle className="sr-only">Video Submission</DialogTitle>
              <div className="aspect-video w-full bg-black">
                {selectedCampaign?.submission?.file_path && (
                  <VideoPlayer
                    url={selectedCampaign.submission.file_path}
                    autoPlay={true}
                    isSupabaseStorage={true}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
