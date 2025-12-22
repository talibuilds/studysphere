"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { groupsAPI, sessionsAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface CreateSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSessionCreated?: () => void
}

export default function CreateSessionDialog({ open, onOpenChange, onSessionCreated }: CreateSessionDialogProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    course_code: "",
    description: "",
    group: "",
    location: "",
    date: "",
    time: "",
  })
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch user's groups when dialog opens
  useEffect(() => {
    const fetchGroups = async () => {
      if (!open) return

      try {
        setLoading(true)
        const response = await groupsAPI.getAll()
        console.log("=== DEBUG: Create Session Dialog ===")
        console.log("API Response:", response)
        console.log("Current user ID:", user?.id)

        // Handle paginated response - extract the results array
        const allGroups = Array.isArray(response) ? response : (response.results || [])
        console.log("All groups (array):", allGroups)

        // Filter to only groups where the user is a member
        const userGroups = allGroups.filter((group: any) => {
          const isMember = group.members?.some((member: any) => member.id === user?.id)
          console.log(`Group "${group.name}":`, {
            members: group.members,
            isMember,
            memberIds: group.members?.map((m: any) => m.id)
          })
          return isMember
        })

        console.log("Filtered user groups:", userGroups)
        setGroups(userGroups)
      } catch (error) {
        console.error("Failed to fetch groups:", error)
        toast.error("Failed to load groups")
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [open, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate date and time are not in the past
      const selectedDate = new Date(`${formData.date}T${formData.time}`)
      const now = new Date()

      if (selectedDate < now) {
        toast.error("Cannot create a session for a date that has already passed.")
        return
      }

      setSubmitting(true)

      // Prepare the data for submission
      const sessionData = {
        title: formData.title,
        course_code: formData.course_code,
        description: formData.description,
        group: formData.group ? parseInt(formData.group) : null,
        location: formData.location,
        date: formData.date,
        time: formData.time,
      }

      await sessionsAPI.create(sessionData)

      toast.success("Session created successfully!")
      onOpenChange(false)
      setFormData({ title: "", course_code: "", description: "", group: "", location: "", date: "", time: "" })

      // Callback to refresh the sessions list
      if (onSessionCreated) {
        onSessionCreated()
      }
    } catch (error: any) {
      console.error("Failed to create session:", error)
      toast.error(error.response?.data?.detail || "Failed to create session")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Study Session</DialogTitle>
          <DialogDescription>Schedule a new session for your fellow students to join.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Session Title</label>
            <Input
              placeholder="e.g., Advanced Algorithms Review"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Course Code</label>
            <Input
              placeholder="e.g., CS 101"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <Textarea
              placeholder="Describe the session and what you'll cover..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Group (Optional)</label>
            <Select
              value={formData.group}
              onValueChange={(value) => setFormData({ ...formData, group: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading groups..." : "Choose a Group"} />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No groups joined yet
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Location</label>
            <Input
              placeholder="e.g., Discord Link, Library Room 301, etc."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Time</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={submitting}>
              <Send size={18} />
              {submitting ? "Creating..." : "Schedule Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
