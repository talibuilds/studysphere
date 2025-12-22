"use client"

import { useState, useEffect } from "react"
import { CalendarPlus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import StudySessionCard from "@/components/study-session-card"
import AppLayout from "@/components/app-layout"
import { dashboardAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    const fetchDashboard = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      // Check if we have a token before making the request
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        if (typeof window !== 'undefined') {
          window.location.href = '/auth'
        }
        return
      }

      try {
        setLoading(true)
        const data = await dashboardAPI.getData()
        setUpcomingSessions(data.upcoming_sessions || [])
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch dashboard:", err)

        // If it's a 401 error, redirect to auth (the interceptor should handle this)
        if (err.response?.status === 401) {
          // Token refresh failed, user needs to login again
          if (typeof window !== 'undefined') {
            window.location.href = '/auth'
          }
          return
        }

        setError("Failed to load dashboard. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [isAuthenticated, authLoading])

  // Redirect to auth if not authenticated
  if (!authLoading && !isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth'
    }
    return null
  }

  return (
    <AppLayout>
      <div className="max-w-5xl leading-3">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Upcoming Study Sessions</h1>
          <p className="text-muted-foreground text-sm mt-1">Your study schedule for the week ahead</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">Loading your sessions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Sessions List */}
        {!loading && !error && upcomingSessions.length > 0 && (
          <div className="space-y-59">
            {upcomingSessions.map((session) => (
              <StudySessionCard
                key={session.id}
                session={{
                  id: session.id,
                  course_code: session.course_code,
                  title: session.title,
                  date: session.date,
                  time: session.time,
                  location: session.location,
                  attendees_count: session.attendees_count,
                  host_name: session.host_name,
                  group_name: session.group_name,
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && upcomingSessions.length === 0 && (
          <div className="text-center py-20 glass rounded-lg p-12 border border-border">
            <div className="flex justify-center mb-5">
              <div className="p-4 rounded-full bg-primary/10">
                <CalendarPlus size={48} className="text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Your calendar is empty</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Find your next study session and level up your learning.
            </p>
            <Button className="gap-2" asChild>
              <a href="/discover">
                <Search size={18} />
                Discover Sessions
              </a>
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
