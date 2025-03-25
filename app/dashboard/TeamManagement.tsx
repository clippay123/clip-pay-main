"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TeamMember {
  id: string
  email: string
}

export function TeamManagement({ brandId }: { brandId: string }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [email, setEmail] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const res = await fetch(`/api/brands?brandId=${brandId}`)
        const data = await res.json()

        console.log("API Response:", data) // Debugging

        if (Array.isArray(data)) {
          setTeamMembers(data)
        } else {
          console.error("Expected array, received:", data)
          setTeamMembers([])
        }
      } catch (error) {
        console.error("Error fetching team members:", error)
        setTeamMembers([])
      }
    }

    if (brandId) fetchTeamMembers()
  }, [brandId])

  async function addMember() {
    const res = await fetch("/api/brands", {
      method: "POST",
      body: JSON.stringify({ email, brandId }),
    })

    if (res.ok) {
      toast.success("Team member added!")
      setEmail("")
      setTeamMembers([...teamMembers, { id: crypto.randomUUID(), email }])
    } else {
      toast.error("Failed to add team member")
    }
  }

  async function removeMember(userId: string) {
    const res = await fetch("/api/brands", {
      method: "DELETE",
      body: JSON.stringify({ userId, brandId }),
    })

    if (res.ok) {
      toast.success("Team member removed")
      setTeamMembers(teamMembers.filter((m) => m.id !== userId))
    } else {
      toast.error("Failed to remove team member")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} className="mt-4">
          Manage Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] transition-all duration-300 animate-in fade-in-0 zoom-in-95">
        <DialogHeader>
          <DialogTitle>Team Members</DialogTitle>
          <DialogDescription>Manage your team members.</DialogDescription>
        </DialogHeader>
        <div className="mb-6 animate-in fade-in-50 duration-300">
          <h3 className="font-medium mb-3">Invite New Team Members</h3>
          <div className="flex flex-col gap-3">
            <Textarea
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="min-h-[80px] transition-all duration-200 focus:min-h-[100px]"
            />
            <Button
              onClick={addMember}
              className="self-end transition-all duration-200 hover:scale-[1.02]"
            >
              Add
            </Button>
          </div>
          <div className="w-full overflow-auto rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-medium">Member</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="flex justify-between items-center"
                  >
                    <span>{member.email}</span>
                    <Button
                      variant="destructive"
                      onClick={() => removeMember(member.id)}
                    >
                      Remove
                    </Button>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
