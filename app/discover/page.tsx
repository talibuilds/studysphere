"use client"

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import StudySessionCard from "@/components/study-session-card"
import CreateSessionDialog from "@/components/create-session-dialog"
import AppLayout from "@/components/app-layout"
import { sessionsAPI } from "@/lib/api"

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filters = ["All", "Online", "In-Person", "This Week", "Exam Prep"]

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        const data = await sessionsAPI.getAll()
        // Handle both array and paginated response formats
        const sessionsArray = Array.isArray(data) ? data : (data.results || [])
        setSessions(sessionsArray)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch sessions:", err)
        setError("Failed to load sessions. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.group_name?.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeFilter === "All") return matchesSearch
    if (activeFilter === "Online")
      return matchesSearch && (session.location === "Discord Link" || session.location === "Online")
    if (activeFilter === "In-Person")
      return matchesSearch && session.location !== "Discord Link" && session.location !== "Online"
    if (activeFilter === "This Week") return matchesSearch
    if (activeFilter === "Exam Prep") return matchesSearch && session.title?.toLowerCase().includes("cie")

    return matchesSearch
  })

  // Refresh sessions after creating a new one
  const handleSessionCreated = () => {
    sessionsAPI.getAll().then(data => {
      const sessionsArray = Array.isArray(data) ? data : (data.results || [])
      setSessions(sessionsArray)
    })
  }

  return (
    <AppLayout>
      <div>
        <div className="flex justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Discover Sessions</h1>
            <p className="text-muted-foreground text-sm mt-1">Browse and join study sessions</p>
          </div>
          <Button className="gap-2 flex-shrink-0" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={18} />
            <span className="hidden sm:inline">Create Session</span>
          </Button>
        </div>

        {/* Search Input */}
        <div className="mb-6 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by course code, topic, or group..."
            className="pl-10 h-10 bg-muted border-border text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => setActiveFilter(filter)}
              size="sm"
              className="text-xs font-medium"
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">Loading sessions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Sessions Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSessions.map((session) => (
              <StudySessionCard
                key={session.id}
                session={session}
                compact={true}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredSessions.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No sessions found matching your search.</p>
          </div>
        )}

        <CreateSessionDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </AppLayout>
  )
}
