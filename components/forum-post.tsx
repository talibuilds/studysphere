"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ForumPostProps {
  id: string
  author: string
  authorImage: string
  content: string
  sessionTag: string
  upvotes: number
  downvotes: number
  createdAt: string
  replies: number
}

export function ForumPost({
  id,
  author,
  authorImage,
  content,
  sessionTag,
  upvotes: initialUpvotes,
  downvotes: initialDownvotes,
  createdAt,
  replies,
}: ForumPostProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)

  const handleUpvote = () => {
    if (userVote === "up") {
      setUpvotes(upvotes - 1)
      setUserVote(null)
    } else {
      if (userVote === "down") {
        setDownvotes(downvotes - 1)
      }
      setUpvotes(upvotes + 1)
      setUserVote("up")
    }
  }

  const handleDownvote = () => {
    if (userVote === "down") {
      setDownvotes(downvotes - 1)
      setUserVote(null)
    } else {
      if (userVote === "up") {
        setUpvotes(upvotes - 1)
      }
      setDownvotes(downvotes + 1)
      setUserVote("down")
    }
  }

  return (
    <Card className="glass-card p-4 border border-border/50 hover:border-border transition-colors">
      <div className="flex gap-3">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1 py-2">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleUpvote}>
            <ThumbsUp size={16} className={userVote === "up" ? "text-primary fill-primary" : "text-muted-foreground"} />
          </Button>
          <span className="text-xs font-medium text-muted-foreground">{upvotes - downvotes}</span>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleDownvote}>
            <ThumbsDown
              size={16}
              className={userVote === "down" ? "text-destructive fill-destructive" : "text-muted-foreground"}
            />
          </Button>
        </div>

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={authorImage || "/placeholder.svg"} />
              <AvatarFallback>{author.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{author}</p>
              <p className="text-xs text-muted-foreground">{createdAt}</p>
            </div>
          </div>

          <p className="text-sm text-foreground mb-3 leading-relaxed">{content}</p>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {sessionTag}
            </Badge>
            <Button variant="ghost" size="sm" className="gap-1 h-7">
              <MessageSquare size={14} />
              <span className="text-xs">{replies}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
