"use client"

import { useState, useEffect } from "react"
import { Search, Plus, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import StudyGroupCard from "@/components/study-group-card"
import AppLayout from "@/components/app-layout"
import CreateStudyGroupDialog from "@/components/create-study-group-dialog"
import { groupsAPI } from "@/lib/api"

export default function StudyGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true)
        const data = await groupsAPI.getAll()
        // Handle both array and paginated response formats
        const groupsArray = Array.isArray(data) ? data : (data.results || [])
        setGroups(groupsArray)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch groups:", err)
        setError("Failed to load groups. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <AppLayout>
      <div className="max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
            <p className="text-muted-foreground text-sm mt-1">Join or create a study group to collaborate with peers</p>
          </div>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} />
            Create Group
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by group name, subject, or description..."
              className="pl-10 bg-secondary/50 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">Loading groups...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Groups List */}
        {!loading && !error && filteredGroups.length > 0 && (
          <div className="space-y-10">
            {filteredGroups.map((group) => (
              <StudyGroupCard
                key={group.id}
                group={{
                  id: group.id,
                  name: group.name,
                  subject: group.subject,
                  description: group.description,
                  members: group.members_count,
                  createdBy: group.creator_name,
                  memberImages: group.member_images || [],
                }}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredGroups.length === 0 && (
          <div className="text-center py-20 glass rounded-lg p-12 border border-border">
            <div className="flex justify-center mb-5">
              <div className="p-4 rounded-full bg-primary/10">
                <BookOpen size={48} className="text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">No groups found</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Try adjusting your search or create a new study group to get started.
            </p>
          </div>
        )}
      </div>

      {/* Create Study Group Dialog */}
      <CreateStudyGroupDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </AppLayout>
  )
}
