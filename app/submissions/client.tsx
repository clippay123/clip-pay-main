"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { cn } from "@/lib/utils"
import type { SubmissionWithCampaign } from "./page"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const formatViews = (views: number) => {
    return views >= 1000
      ? (views / 1000).toFixed(1).replace(/\.0$/, "") + "k"
      : views
  }
  return (
    <div className="min-h-screen bg-[#F2F6FA]">
      <DashboardHeader userType="creator" email={email} />

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
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
                    <Users className="w-5 h-5" />
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
                    <Users className="w-5 h-5" />
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
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-zinc-900">
                  {" "}
                  {pendingSubmissions}
                </p>
              </Card>
            </div>

            {/* Table Header */}
            {/* <div className="border border-[#E4E7EC] rounded-lg bg-white">
              <div className="w-full">
                <tbody className="divide-y divide-[#E4E7EC]">
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="group hover:bg-[#F9FAFB] cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-[#101828]">
                          {submission.campaign.title}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#475467]">
                          {new Date(submission.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }
                          )}{" "}
                          {new Date(submission.created_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#475467]">
                            {
                              submission.campaign.brand.profile
                                ?.organization_name
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#475467]">
                              Views
                            </span>
                            <span className="text-xs font-medium text-[#101828]">

                              --
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#475467] capitalize">
                          {submission.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </div>
            </div> */}
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
                        <span className="text-sm font-medium text-gray-700">
                          dfd
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mt-1">
                        {" "}
                        {submission.campaign.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {" "}
                        @ {submission.campaign.brand.profile?.organization_name}
                      </p>
                    </CardHeader>
                    <CardContent className="px-0 py-0">
                      <Tabs defaultValue="details" className="w-full">
                        <div className="flex justify-center">
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
                            <TabsTrigger
                              value="feedback"
                              className="rounded-lg data-[state=active]:border-gray-900 data-[state=active]:shadow-none px-4"
                            >
                              Feedback
                            </TabsTrigger>
                          </TabsList>
                        </div>
                        <TabsContent value="details" className="px-4 py-3">
                          <p className="text-sm text-gray-700">Descriptio</p>
                        </TabsContent>
                        <TabsContent value="video" className="px-4 py-3">
                          <p className="text-sm text-gray-700">
                            Video content would appear here.
                          </p>
                        </TabsContent>
                        <TabsContent value="feedback" className="px-4 py-3">
                          <p className="text-sm text-gray-700">
                            Feedback would appear here.
                          </p>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-between px-4 py-3 text-xs text-gray-500 border-t">
                      <span>{formatViews(submission.views)} Views</span>
                      <span>120k Likes</span>
                      <span>25 Comments</span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
