"use client"

import React, { useEffect, useState } from "react"
import { fetchReports, updateReportStatus } from "./action"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const ReportPage = () => {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true)
        const data = await fetchReports()
        setReports(data)
      } catch (error) {
        console.error("Failed to load reports:", error)
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  const handleUpdateStatus = async (
    reportId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      await updateReportStatus(reportId, status)
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status } : report
        )
      )
      toast.success(
        status === "accepted"
          ? "User banned & report accepted"
          : "Report rejected"
      )
    } catch (error) {
      toast.error("Failed to update report status")
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      {loading ? (
        <p>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className="w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Reported User</th>
              <th className="p-2 text-left">Reported By</th>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Reason</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t border-gray-200">
                <td className="p-2">{report.reported_user_org}</td>
                <td className="p-2">{report.reported_by_org}</td>
                <td className="p-2">{report.title}</td>
                <td className="p-2">{report.reason}</td>
                <td className="p-2">{report.status}</td>
                <td className="p-2">
                  {report.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        onClick={() =>
                          handleUpdateStatus(report.id, "accepted")
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleUpdateStatus(report.id, "rejected")
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ReportPage
