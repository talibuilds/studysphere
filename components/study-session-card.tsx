"use client"

import Link from "next/link"
import { Calendar, MapPin, Users, BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface StudySessionCardProps {
  session: {
    id: string
    course_code: string
    title: string
    date: string
    time: string
    location: string
    attendees_count: number
    host_name: string
    group_name?: string
    group_id?: number
  }
  compact?: boolean
}

export default function StudySessionCard({ session, compact = false }: StudySessionCardProps) {
  return (
    <Link href={`/session/${session.id}`}>
      <Card className="glass p-5 cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg h-full border border-border leading-5 my-2.5 py-5 px-5 mx-0">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-medium">
                {session.course_code}
              </Badge>
              {session.group_name && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs font-medium gap-1">
                  <BookOpen size={12} />
                  {session.group_name}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-snug">{session.title}</h3>
          </div>

          <div className="space-y-2.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <Calendar size={16} className="flex-shrink-0" />
              <span>
                {session.date} @ {session.time}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={16} className="flex-shrink-0" />
              <span className="truncate">{session.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium">{session.attendees_count || 0} going</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs font-medium h-8 px-3"
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
