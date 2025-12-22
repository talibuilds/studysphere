"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { groupsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

interface CreateStudyGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateStudyGroupDialog({ open, onOpenChange }: CreateStudyGroupDialogProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await groupsAPI.create(formData)
      onOpenChange(false)
      setFormData({ name: "", subject: "", description: "" })
      router.refresh() // Refresh to show new group (if approved by admin)
      // Show success message
      alert("Group created successfully! It will appear after admin approval.")
    } catch (err: any) {
      console.error("Failed to create group:", err)
      setError(err.response?.data?.detail || "Failed to create group. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Study Group</DialogTitle>
          <DialogDescription>Start a new study group and invite others to join</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Group Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Full Stack Development"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 bg-secondary/50 border-border"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject Code
            </Label>
            <Input
              id="subject"
              name="subject"
              placeholder="e.g., 22CS3AEFWD"
              value={formData.subject}
              onChange={handleChange}
              className="mt-1 bg-secondary/50 border-border"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              placeholder="What is this study group about?"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 bg-secondary/50 border border-border rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
