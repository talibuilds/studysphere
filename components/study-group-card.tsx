"use client"

import Link from "next/link"
import { Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getGroupBadgeColor } from "@/lib/badge-colors"

interface StudyGroupCardProps {
  group: {
    id: string
    name: string
    subject: string
    description: string
    members: number
    createdBy: string
    memberImages: string[]
    chatLink?: string
  }
}

export default function StudyGroupCard({ group }: StudyGroupCardProps) {
  const badgeColor = getGroupBadgeColor(group.name)

  return (
    <Link href={`/study-groups/${group.id}`}>
      <Card className="glass p-5 cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg h-full border border-border my-2.5 py-5 px-5 mx-0">
        <div className="space-y-4">
          <div>
            <Badge className={`mb-3 text-xs font-medium ${badgeColor}`}>{group.subject}</Badge>
            <h3 className="font-semibold text-base leading-snug">{group.name}</h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{group.description}</p>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium">{group.members} members</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs font-medium h-8 px-3"
            >
              View Group
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
