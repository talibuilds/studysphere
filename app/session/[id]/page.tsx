"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Check, ArrowLeft, Award, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AppLayout from "@/components/app-layout"
import { sessionsAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { SessionChat } from "@/components/session-chat"
import { SessionResources } from "@/components/session-resources"
import { MarkAttendanceDialog } from "@/components/mark-attendance-dialog"
import { Copy, KeyRound } from "lucide-react"

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const sessionId = params.id as string

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRSVPing, setIsRSVPing] = useState(false)
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [showAddResourceDialog, setShowAddResourceDialog] = useState(false)
  const [showChat, setShowChat] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true)
        const data = await sessionsAPI.getById(sessionId)
        setSession(data)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch session:", err)
        setError("Session not found")
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  const checkEventPassed = (dateStr: string, timeStr: string) => {
    try {
      if (!dateStr || !timeStr) return false
      
      // Check for ISO format (YYYY-MM-DD) which is what our create form sends
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
         // handle time format HH:MM or HH:MM:SS
         let dateTimeStr = `${dateStr}T${timeStr}`;
         // If time is just HH:MM, append :00 if needed by Date constructor? 
         // actually new Date("2023-01-01T12:00") works in modern browsers.
         // But let's be safe. If timeStr contains AM/PM or ranges, we need to parse it.
         
         if (timeStr.includes(" ") || timeStr.includes("AM") || timeStr.includes("PM")) {
             // Fallback to legacy parsing if it has spaces or AM/PM, assuming date is also legacy? 
             // Or maybe date is YYYY-MM-DD but time is "8:00 AM"?
             // If date is YYYY-MM-DD, strict parsing is better.
             // Let's just try to create a Date object directly first.
             const d = new Date(`${dateStr} ${timeStr}`);
             if (!isNaN(d.getTime())) return new Date() > d;
         } else {
             // Standard ISO-like
             const d = new Date(`${dateStr}T${timeStr}`);
             if (!isNaN(d.getTime())) return new Date() > d;
         }
      }
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

  const handleRSVP = async () => {
    try {
      setIsRSVPing(true)
      await sessionsAPI.rsvp(sessionId)
      // Refresh session data
      const updatedSession = await sessionsAPI.getById(sessionId)
      setSession(updatedSession)
      alert("Successfully RSVP'd to session!")
    } catch (err: any) {
      console.error("Failed to RSVP:", err)
      alert(err.response?.data?.detail || "Failed to RSVP")
    } finally {
      setIsRSVPing(false)
    }
  }

  const handleMarkAttendance = async (verificationCode: string) => {
    try {
      setIsMarkingAttendance(true)
      const result = await sessionsAPI.markAttendance(sessionId, verificationCode)
      // Refresh session data
      const updatedSession = await sessionsAPI.getById(sessionId)
      setSession(updatedSession)
      setShowAttendanceDialog(false)
      alert(`Attendance marked successfully! You earned ${result.xp_earned} XP!`)
    } catch (err: any) {
      console.error("Failed to mark attendance:", err)
      throw new Error(err.response?.data?.detail || "Failed to mark attendance")
    } finally {
      setIsMarkingAttendance(false)
    }
  }

  const copyVerificationCode = () => {
    if (session?.verification_code) {
      navigator.clipboard.writeText(session.verification_code)
      alert("Verification code copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </AppLayout>
    )
  }

  if (error || !session) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Session not found</h1>
          <Link href="/discover">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={18} />
              Back to Discover
            </Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const isAttending = session.is_attending
  const hasAttended = session.has_attended

  return (
    <AppLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <Link href="/discover">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft size={18} />
              Back to Discover
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Information */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
                {session.course_code}
              </Badge>
              <h1 className="text-4xl font-bold mb-2">{session.title}</h1>
            </div>

            {/* Hosted by */}
            <Card className="glass-card p-4">
              <p className="text-sm text-muted-foreground mb-3">Hosted by</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={session.host_image} />
                  <AvatarFallback>{session.host_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{session.host_name}</p>
                  <p className="text-sm text-muted-foreground">Session Host</p>
                </div>
              </div>
            </Card>

            {/* Session Details */}
            <Card className="glass-card p-6">
              <h3 className="font-semibold mb-4">Session Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-primary" />
                  <span>{session.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-primary" />
                  <span>{session.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-primary" />
                  <span>{session.location}</span>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="glass-card p-6">
              <h3 className="font-semibold mb-4">About This Session</h3>
              <p className="text-muted-foreground leading-relaxed">{session.description}</p>
            </Card>
          </div>

          {/* Right Column - Action Hub */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-lg sticky top-8 space-y-4">
              {!session.is_group_member && session.group ? (
                <div className="space-y-3">
                  <div className="p-4 bg-orange-500/10 rounded-lg text-center border border-orange-500/20">
                    <p className="text-sm font-semibold text-orange-400 mb-2">Group Membership Required</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      You must join the group to RSVP to this session
                    </p>
                    <Link href={`/study-groups/${session.group}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Group
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : hasAttended ? (
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <Award size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold">Attendance Marked!</p>
                  <p className="text-xs text-muted-foreground mt-1">You've earned XP for attending</p>
                </div>
              ) : isAttending ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 rounded-lg text-center border border-green-500/20">
                    <Check size={20} className="text-green-400 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-green-400">You're RSVP'd!</p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => setShowAttendanceDialog(true)}
                    disabled={isMarkingAttendance}
                  >
                    <Award size={18} />
                    Mark Attendance
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Get the verification code from the host to earn XP points
                  </p>
                </div>
              ) : checkEventPassed(session.date, session.time) ? (
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg text-center border border-border">
                    <Clock size={24} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-semibold text-muted-foreground">Event over</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      This session is no longer accepting RSVPs
                    </p>
                    <Link href={session.group ? `/study-groups/${session.group}` : "/discover"}>
                      <Button size="sm" variant="outline" className="w-full">
                        {session.group ? "View Group for More" : "Discover More Sessions"}
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleRSVP}
                  disabled={isRSVPing}
                >
                  <Check size={18} />
                  {isRSVPing ? "RSVP'ing..." : "RSVP to Session"}
                </Button>
              )}

              {/* Verification Code - Only visible to host */}
              {session.verification_code && user?.id === session.host && (
                <div className="mt-4 p-4 border-2 border-primary/30 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound size={16} className="text-primary" />
                    <p className="text-xs font-semibold text-primary">Verification Code</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-2xl font-bold font-mono tracking-wider">
                      {session.verification_code}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyVerificationCode}
                      className="flex-shrink-0"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Share this code with attendees to mark their attendance
                  </p>
                </div>
              )}

              {/* Attendees */}
              <div>
                <p className="text-sm font-semibold mb-3">
                  Attendees ({session.attendees_count || 0})
                </p>
                {session.attendees_list && session.attendees_list.length > 0 ? (
                  <div className="flex -space-x-2 mb-3">
                    {session.attendees_list.slice(0, 5).map((attendee: any, idx: number) => (
                      <Avatar key={idx} className="h-10 w-10 border-2 border-card">
                        <AvatarImage src={attendee.image} />
                        <AvatarFallback>{attendee.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ))}
                    {session.attendees_list.length > 5 && (
                      <div className="h-10 w-10 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-semibold">
                        +{session.attendees_list.length - 5}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No attendees yet</p>
                )}
              </div>

              {session.group_name && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Part of</p>
                  <Link href={`/study-groups/${session.group}`}>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-pointer hover:bg-blue-500/30 transition-colors">
                      {session.group_name}
                    </Badge>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resources Section - Only for attendees */}
        {isAttending && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Session Resources</h2>
              {isAttending && (
                <Button
                  onClick={() => setShowAddResourceDialog(true)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus size={16} />
                  Add Resource
                </Button>
              )}
            </div>
            <SessionResources
              sessionId={sessionId}
              canAddResource={isAttending}
              onAddClick={() => setShowAddResourceDialog(true)}
              externalShowDialog={showAddResourceDialog}
              externalSetShowDialog={setShowAddResourceDialog}
            />
          </div>
        )}

        {/* Chat Section - Only for attendees */}
        {isAttending && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Session Chat</h2>
              <Button
                onClick={() => setShowChat(!showChat)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {showChat ? (
                  <>
                    <ChevronUp size={16} />
                    Hide Chat
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Show Chat
                  </>
                )}
              </Button>
            </div>
            {showChat && (
              <SessionChat
                sessionId={sessionId}
                sessionTitle={session.title}
                attendeesCount={session.attendees_count || 0}
              />
            )}
          </div>
        )}
      </div>

      {/* Attendance Verification Dialog */}
      <MarkAttendanceDialog
        open={showAttendanceDialog}
        onOpenChange={setShowAttendanceDialog}
        onVerify={handleMarkAttendance}
        isLoading={isMarkingAttendance}
      />
    </AppLayout>
  )
}
