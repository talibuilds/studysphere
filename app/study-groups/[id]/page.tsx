"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Users, CheckCircle, ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import AppLayout from "@/components/app-layout"
import { groupsAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function StudyGroupDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const groupId = params.id as string

  const [group, setGroup] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true)
        const [groupData, sessionsData] = await Promise.all([
          groupsAPI.getById(groupId),
          groupsAPI.getSessions(groupId)
        ])
        setGroup(groupData)
        setSessions(Array.isArray(sessionsData) ? sessionsData : [])
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch group:", err)
        setError("Study group not found")
      } finally {
        setLoading(false)
      }
    }

    if (groupId) {
      fetchGroupData()
    }
  }, [groupId])

  const checkEventPassed = (dateStr: string, timeStr: string) => {
    try {
      if (!dateStr || !timeStr) return false
      
      // Handle various date formats including "Wednesday, October 22nd"
      let cleanDate = dateStr
      
      // Remove day name if present (e.g., "Wednesday, ")
      if (cleanDate.includes(",")) {
        cleanDate = cleanDate.split(",")[1].trim()
      }
      
      // Remove ordinal suffixes (st, nd, rd, th)
      cleanDate = cleanDate.replace(/(\d+)(st|nd|rd|th)/, "$1")
      
      // Extract start time (e.g., "8:00 AM" from "8:00 AM - 10:00 AM")
      const startTime = timeStr.split("-")[0].trim()
      
      // Assume current year as it's not provided in the string
      const currentYear = new Date().getFullYear()
      const eventDateStr = `${cleanDate}, ${currentYear} ${startTime}`
      
      const eventDate = new Date(eventDateStr)
      const now = new Date()
      
      return now > eventDate
    } catch (e) {
      console.error("Error checking if event passed:", e)
      return false
    }
  }

  const handleJoinGroup = async () => {
    try {
      setIsJoining(true)
      await groupsAPI.join(groupId)
      const updatedGroup = await groupsAPI.getById(groupId)
      setGroup(updatedGroup)
    } catch (err: any) {
      console.error("Failed to join group:", err)
      alert(err.response?.data?.detail || "Failed to join group")
    } finally {
      setIsJoining(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </AppLayout>
    )
  }

  if (error || !group) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Study group not found</h1>
          <Link href="/study-groups">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={18} />
              Back to Groups
            </Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const isMember = group.members?.some((m: any) => m.id === user?.id)

  return (
    <AppLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <Link href="/study-groups">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft size={18} />
              Back to Groups
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Information */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {group.subject}
              </Badge>
              <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
              <p className="text-muted-foreground">{group.description}</p>
            </div>

            {/* Created by */}
            <Card className="glass-card p-4">
              <p className="text-sm text-muted-foreground mb-3">Created by</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={group.creator_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${group.creator_name}`} />
                  <AvatarFallback>{group.creator_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{group.creator_name}</p>
                  <p className="text-sm text-muted-foreground">Group Founder</p>
                </div>
              </div>
            </Card>

            {/* Group Stats */}
            <Card className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-primary" />
                <h3 className="font-semibold">Group Statistics</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">{group.members_count || 0}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Course code</p>
                  <p className="text-lg font-bold">{group.subject}</p>
                </div>
              </div>
            </Card>

            {/* Sessions Section */}
            <div className="space-y-8">
              {/* Upcoming Sessions */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Upcoming Sessions</h3>
                {sessions && sessions.filter((session: any) => !checkEventPassed(session.date, session.time)).length > 0 ? (
                  <div className="space-y-3">
                    {sessions
                      .filter((session: any) => !checkEventPassed(session.date, session.time))
                      .map((session: any) => (
                      <Card key={session.id} className="glass-card p-4">
                        <Link href={`/session/${session.id}`} className="block hover:opacity-80 transition-opacity">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{session.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{session.course_code}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>📅 {session.date}</span>
                                <span>🕒 {session.time}</span>
                                <span>📍 {session.location}</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {session.attendees_count || 0} going
                            </Badge>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-card p-8 text-center border border-border/50">
                    <p className="text-muted-foreground">
                      {isMember
                        ? "No upcoming sessions. Check the Discover page to create one!"
                        : "Join the group to see upcoming sessions"}
                    </p>
                  </Card>
                )}
              </div>

              {/* Previous Sessions */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Previous Sessions</h3>
                {sessions && sessions.filter((session: any) => checkEventPassed(session.date, session.time)).length > 0 ? (
                  <div className="space-y-3">
                    {sessions
                      .filter((session: any) => checkEventPassed(session.date, session.time))
                      .map((session: any) => (
                      <Card key={session.id} className="glass-card p-4 opacity-75">
                        <Link href={`/session/${session.id}`} className="block hover:opacity-100 transition-opacity">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1 text-muted-foreground">{session.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{session.course_code}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>📅 {session.date}</span>
                                <span>🕒 {session.time}</span>
                                <span>📍 {session.location}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant="outline" className="text-xs">
                                Completed
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {session.attendees_count || 0} attended
                              </span>
                            </div>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-card p-6 text-center border border-border/50">
                    <p className="text-sm text-muted-foreground">
                      No previous sessions recorded.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Action Hub */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-lg sticky top-8 space-y-4">
              {isMember ? (
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <CheckCircle size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold">You're a member!</p>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleJoinGroup}
                  disabled={isJoining}
                >
                  <CheckCircle size={18} />
                  {isJoining ? "Joining..." : "Join Group"}
                </Button>
              )}

              {/* Members */}
              <div>
                <p className="text-sm font-semibold mb-3">Members ({group.members_count || 0})</p>
                {group.members && group.members.length > 0 ? (
                  <div className="flex -space-x-2 mb-3">
                    {group.members.slice(0, 5).map((member: any, idx: number) => (
                      <Avatar key={idx} className="h-10 w-10 border-2 border-card">
                        <AvatarImage src={member.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} />
                        <AvatarFallback>{member.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ))}
                    {group.members.length > 5 && (
                      <div className="h-10 w-10 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-semibold">
                        +{group.members.length - 5}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No members yet</p>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center py-2">
                {isMember
                  ? `You and ${group.members_count - 1} others in this group`
                  : `Join ${group.members_count} students in this study group`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
