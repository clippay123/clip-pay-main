"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { fetchBannedUsers, unbanUser } from "../report/action"

const BanUserPage = () => {
  const [bannedUsers, setBannedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadBannedUsers = async () => {
      try {
        setLoading(true)
        const users = await fetchBannedUsers()
        setBannedUsers(users)
      } catch (error) {
        console.error("Failed to fetch banned users:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBannedUsers()
  }, [])

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser(userId)
      setBannedUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userId)
      )
      toast.success("User has been unbanned successfully.")
    } catch (error) {
      toast.error("Failed to unban user.")
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Banned Users</h1>
      {loading ? (
        <p>Loading...</p>
      ) : bannedUsers.length === 0 ? (
        <p>No banned users found.</p>
      ) : (
        <table className="w-full border border-gray-200 text-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Banned Until</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bannedUsers.map((user) => (
              <tr key={user.id} className="border-t border-gray-200 text-white">
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  {new Date(user.banned_until).toLocaleString()}
                </td>
                <td className="p-2">
                  <Button
                    variant="outline"
                    className="text-black"
                    onClick={() => handleUnban(user.id)}
                  >
                    Unban
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default BanUserPage
