"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CreateForumPostDialogProps {
  groupName: string
  sessions: Array<{ id: string; name: string }>
  onPostCreate?: (post: any) => void
}

export function CreateForumPostDialog({ groupName, sessions, onPostCreate }: CreateForumPostDialogProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [selectedSession, setSelectedSession] = useState(sessions[0]?.id || "")

  const handleSubmit = () => {
    if (content.trim()) {
      const newPost = {
        author: "You",
        authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        content,
        sessionTag: sessions.find((s) => s.id === selectedSession)?.name || "General",
        upvotes: 0,
        downvotes: 0,
        createdAt: "Just now",
        replies: 0,
      }
      onPostCreate?.(newPost)
      setContent("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={18} />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass-card border-border">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>Share your thoughts with {groupName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Select Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Post Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
