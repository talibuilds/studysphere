"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AppLayout from "@/components/app-layout"
import { CheckCircle, XCircle, BarChart3, Users, BookOpen, Trash2 } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface GroupRequest {
  id: string
  name: string
  creator_name: string
  description: string
  created_at: string
  status: "pending" | "approved" | "rejected"
}

interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  image: string
  level: number
  xp: number
  is_staff: boolean
  created_at: string
}

interface Session {
  id: string
  title: string
  course_code: string
  host_name: string
  group_name: string | null
  date: string
  time: string
  attendees_count: number
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [adminData, setAdminData] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user?.is_staff) {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
      return
    }

    fetchAdminData()
  }, [isAuthenticated, authLoading, user])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const [data, usersData, sessionsData] = await Promise.all([
        adminAPI.getGroups(),
        adminAPI.getUsers(),
        adminAPI.getSessions()
      ])
      setAdminData(data)
      setUsers(usersData)
      setSessions(sessionsData)
      setError(null)
    } catch (err: any) {
      console.error("Failed to fetch admin data:", err)
      setError("Failed to load admin data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.approveGroup(id)
      toast.success("Group approved successfully!")
      fetchAdminData() // Refresh data
    } catch (err) {
      console.error("Failed to approve group:", err)
      toast.error("Failed to approve group")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await adminAPI.rejectGroup(id)
      toast.success("Group rejected successfully!")
      fetchAdminData() // Refresh data
    } catch (err) {
      console.error("Failed to reject group:", err)
      toast.error("Failed to reject group")
    }
  }

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group? All related sessions will also be deleted.")) return;
    try {
      await adminAPI.deleteGroup(id)
      toast.success("Group deleted successfully!")
      fetchAdminData()
    } catch (err) {
      toast.error("Failed to delete group")
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? ALL their data (groups, sessions, RSVPs) will be permanently deleted!")) return;
    try {
      await adminAPI.deleteUser(id)
      toast.success("User deleted successfully!")
      fetchAdminData()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete user")
    }
  }

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await adminAPI.deleteSession(id)
      toast.success("Session deleted successfully!")
      fetchAdminData()
    } catch (err) {
      toast.error("Failed to delete session")
    }
  }


  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground text-sm">Loading admin panel...</p>
        </div>
      </AppLayout>
    )
  }

  if (error || !adminData) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-red-500 text-sm">{error || "Failed to load admin data"}</p>
        </div>
      </AppLayout>
    )
  }

  const pendingRequests = adminData.pending || []
  const approvedRequests = adminData.approved || []
  const rejectedRequests = adminData.rejected || []
  const allGroups = [...approvedRequests, ...rejectedRequests]
  const stats = adminData.stats || {}

  const RequestCard = ({ request, isPending }: { request: GroupRequest; isPending: boolean }) => (
    <Card className="glass-card p-6 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{request.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">Created by: {request.creator_name}</p>
          <p className="text-sm mb-3">{request.description}</p>
          <div className="flex gap-2 items-center">
            <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</p>
            {!isPending && (
                <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                >
                    {request.status === "approved" ? "Approved" : "Rejected"}
                </div>
            )}
          </div>
        </div>
        {isPending ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button size="sm" variant="default" className="gap-1" onClick={() => handleApprove(request.id)}>
              <CheckCircle size={16} />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 bg-transparent"
              onClick={() => handleReject(request.id)}
            >
              <XCircle size={16} />
              Reject
            </Button>
          </div>
        ) : (
            <Button
              size="sm"
              variant="destructive"
              className="gap-1"
              onClick={() => handleDeleteGroup(request.id)}
            >
              <Trash2 size={16} />
              Delete
            </Button>
        )}
      </div>
    </Card>
  )

  const UserCard = ({ userItem }: { userItem: User }) => (
    <Card className="glass-card p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 border border-primary/20">
          <AvatarImage src={userItem.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userItem.username}`} alt={userItem.username} />
          <AvatarFallback>{userItem.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{userItem.first_name} {userItem.last_name}</h3>
          <p className="text-xs text-muted-foreground">@{userItem.username} • {userItem.email}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs font-medium text-primary">Lvl {userItem.level}</span>
            <span className="text-xs text-muted-foreground">{userItem.xp} XP</span>
            {userItem.is_staff && <span className="text-xs font-medium text-yellow-500">Admin</span>}
          </div>
        </div>
      </div>
      {!userItem.is_staff && (
        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(userItem.id)}>
          <Trash2 size={16} className="mr-1"/> Delete
        </Button>
      )}
    </Card>
  )

  const SessionCard = ({ sessionItem }: { sessionItem: Session }) => (
    <Card className="glass-card p-4 mb-4 flex items-center justify-between">
      <div>
        <h3 className="font-medium text-primary">{sessionItem.course_code} - {sessionItem.title}</h3>
        <p className="text-xs text-muted-foreground mb-1">Host: {sessionItem.host_name} {sessionItem.group_name && `• Group: ${sessionItem.group_name}`}</p>
        <p className="text-xs text-muted-foreground">{sessionItem.date} at {sessionItem.time} • {sessionItem.attendees_count} Attendees</p>
      </div>
      <Button size="sm" variant="destructive" onClick={() => handleDeleteSession(sessionItem.id)}>
        <Trash2 size={16} className="mr-1"/> Delete
      </Button>
    </Card>
  )


  return (
    <AppLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, study groups, sessions, and platform operations</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                <p className="text-2xl font-bold text-yellow-400">{users.length}</p>
              </div>
              <Users size={32} className="text-yellow-400/50" />
            </div>
          </Card>
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Groups</p>
                <p className="text-2xl font-bold">{stats.total_groups || 0}</p>
              </div>
              <BookOpen size={32} className="text-primary/50" />
            </div>
          </Card>
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Groups</p>
                <p className="text-2xl font-bold text-orange-400">{pendingRequests.length}</p>
              </div>
              <CheckCircle size={32} className="text-orange-400/50" />
            </div>
          </Card>
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.total_sessions || 0}</p>
              </div>
              <BarChart3 size={32} className="text-blue-400/50" />
            </div>
          </Card>
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Sessions</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.active_sessions || 0}</p>
              </div>
              <Users size={32} className="text-cyan-400/50" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="groups">Groups ({allGroups.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
          </TabsList>

          {/* Pending Requests */}
          <TabsContent value="requests">
            {pendingRequests.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No pending requests</p>
              </Card>
            ) : (
              <div>
                {pendingRequests.map((req: GroupRequest) => (
                  <RequestCard key={req.id} request={req} isPending={true} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Managed Groups */}
          <TabsContent value="groups">
            {allGroups.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No groups to manage</p>
              </Card>
            ) : (
              <div>
                {allGroups.map((req: GroupRequest) => (
                  <RequestCard key={req.id} request={req} isPending={false} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            {users.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No users found</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((userItem: User) => (
                  <UserCard key={userItem.id} userItem={userItem} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sessions */}
          <TabsContent value="sessions">
            {sessions.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No sessions found</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((sessionItem: Session) => (
                  <SessionCard key={sessionItem.id} sessionItem={sessionItem} />
                ))}
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  )
}
