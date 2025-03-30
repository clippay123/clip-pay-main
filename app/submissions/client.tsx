"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { cn } from "@/lib/utils"
import type { SubmissionWithCampaign } from "./page"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import pendSub from "@/public/assets/pendsub.svg"
import actSub from "@/public/assets/SealCheck.svg"
import tSub from "@/public/assets/totalSub.svg"
import Image from "next/image"
interface SubmissionsClientProps {
  submissions: SubmissionWithCampaign[]
  email: string
  totalSubmissions: number
  approvedSubmissions: number
  pendingSubmissions: number
}

export function SubmissionsClient({
  submissions,
  email,
  totalSubmissions,
  approvedSubmissions,
  pendingSubmissions,
}: SubmissionsClientProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const formatViews = (views: number) => {
    return views >= 1000
      ? (views / 1000).toFixed(1).replace(/\.0$/, "") + "k"
      : views
  }

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop()
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes("instagram.com")) {
      return `https://www.instagram.com/p/${url.split("/p/")[1]?.split("/")[0]}/embed`
    }
    if (url.includes("tiktok.com")) {
      return `https://www.tiktok.com/embed/${url.split("/video/")[1]?.split("?")[0]}`
    }
    return null
  }
  return (
    <div className="min-h-screen bg-[#F2F6FA]">
      {/* Main content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
          <div className="space-y-6">
            {/* Title */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-medium text-[#101828]">
                Creator Submissions
              </h1>
            </div>
            <div className={"grid grid-cols-2 lg:grid-cols-5 gap-8 mb-4"}>
              <Card className="p-4 rounded-2xl  bg-white inline-flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-600">
                    Total Submissions
                  </span>
                  <div className="">
                    {/* <Users className="w-5 h-5" /> */}
                    <Image src={tSub} alt="Te" className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-zinc-900">
                  {" "}
                  {totalSubmissions}
                </p>
              </Card>

              <Card className="p-4 rounded-2xl  bg-white inline-flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-600">
                    Approved
                  </span>
                  <div className="">
                    {/* <Users className="w-5 h-5" /> */}
                    <Image src={actSub} alt="Te" className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-zinc-900">
                  {" "}
                  {approvedSubmissions}
                </p>
              </Card>

              <Card className="p-4 rounded-2xl bg-white inline-flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-600">
                    Pending Review
                  </span>
                  <div className="">
                    {/* <Users className="w-5 h-5" /> */}
                    <Image src={pendSub} alt="Te" className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-zinc-900">
                  {" "}
                  {pendingSubmissions}
                </p>
              </Card>
            </div>

            {submissions.length > 0 ? (
              <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submissions.map((submission) => (
                    <Card
                      className="overflow-hidden rounded-2xl"
                      key={submission.id}
                    >
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          {/* {approved && ( */}
                          <div className="bg-emerald-400 hover:bg-emerald-400 text-emerald-950 font-medium rounded-full px-3 py-0.5">
                            {submission.status}
                          </div>
                          {/* )} */}
                          {/* <span className="text-sm font-medium text-gray-700">
                          dfd
                        </span> */}
                        </div>
                        <h3 className="text-lg font-semibold mt-1">
                          {" "}
                          {submission.campaign.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {" "}
                          @{" "}
                          {submission.campaign.brand.profile?.organization_name}
                        </p>
                      </CardHeader>
                      <CardContent className="px-0 py-0">
                        <Tabs defaultValue="details" className="w-full">
                          <div className="flex justify-center w-full">
                            <TabsList className="rounded-xl border-b bg-[#F4F4F5] h-10">
                              <TabsTrigger
                                value="details"
                                className="rounded-lg  data-[state=active]:border-gray-900 data-[state=active]:shadow-none px-4"
                              >
                                Details
                              </TabsTrigger>
                              <TabsTrigger
                                value="video"
                                className="rounded-lg  data-[state=active]:border-gray-900 data-[state=active]:shadow-none px-4"
                              >
                                View Video
                              </TabsTrigger>
                            </TabsList>
                          </div>
                          <TabsContent value="details" className="px-4 py-3">
                            <p className="text-sm text-gray-700">
                              {submission.campaign.guidelines}
                            </p>
                          </TabsContent>
                          <TabsContent value="video" className="px-4 py-3">
                            {submission.video_urls.length > 0 ? (
                              submission.video_urls.map((url, index) => {
                                let platform = "Video"
                                if (
                                  url.includes("youtube.com") ||
                                  url.includes("youtu.be")
                                ) {
                                  platform = "YouTube Video"
                                } else if (url.includes("instagram.com")) {
                                  platform = "Instagram Video"
                                } else if (url.includes("tiktok.com")) {
                                  platform = "TikTok Video"
                                }

                                return (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center mb-2"
                                  >
                                    <span className="text-sm text-gray-700">
                                      {platform}
                                    </span>
                                    <Button
                                      size="sm"
                                      onClick={() => setSelectedVideo(url)}
                                    >
                                      View
                                    </Button>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="text-sm text-gray-500">
                                No videos available
                              </p>
                            )}
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                      <CardFooter className="flex justify-center px-4 py-3 text-xs text-gray-500 border-t">
                        <span>{formatViews(submission.views)} Views</span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center bg-white rounded-2xl">
                <p className="text-zinc-600">
                  You don't have any submissions yet.
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  Explore campaigns and submit your first video{" "}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Dialog
        open={!!selectedVideo}
        onOpenChange={() => setSelectedVideo(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Video Preview</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="w-full aspect-video">
              <iframe
                src={getEmbedUrl(selectedVideo) || ""}
                title="Video Preview"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
