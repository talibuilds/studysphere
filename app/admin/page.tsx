"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import AppLayout from "@/components/app-layout"
import { CheckCircle, XCircle, BarChart3, Users, BookOpen } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface GroupRequest {
  id: string
  name: string
  creator_name: string
  description: string
  created_at: string
  status: "pending" | "approved" | "rejected"
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [adminData, setAdminData] = useState<any>(null)
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
      const data = await adminAPI.getGroups()
      setAdminData(data)
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
      fetchAdminData() // Refresh data
    } catch (err) {
      console.error("Failed to approve group:", err)
      alert("Failed to approve group")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await adminAPI.rejectGroup(id)
      fetchAdminData() // Refresh data
    } catch (err) {
      console.error("Failed to reject group:", err)
      alert("Failed to reject group")
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
  const stats = adminData.stats || {}

  const RequestCard = ({ request, showActions }: { request: GroupRequest; showActions: boolean }) => (
    <Card className="glass-card p-6 mb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{request.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">Created by: {request.creator_name}</p>
          <p className="text-sm mb-3">{request.description}</p>
          <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</p>
        </div>
        {showActions && (
          <div className="flex gap-2">
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
        )}
        {!showActions && (
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${request.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}
          >
            {request.status === "approved" ? "Approved" : "Rejected"}
          </div>
        )}
      </div>
    </Card>
  )

  return (
    <AppLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage study group requests and view platform statistics</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
                <p className="text-sm text-muted-foreground mb-1">Approved</p>
                <p className="text-2xl font-bold text-green-400">{stats.approved_groups || 0}</p>
              </div>
              <CheckCircle size={32} className="text-green-400/50" />
            </div>
          </Card>
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-400">{stats.rejected_groups || 0}</p>
              </div>
              <XCircle size={32} className="text-red-400/50" />
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
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
            <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
          </TabsList>

          {/* Pending Requests */}
          <TabsContent value="pending">
            {pendingRequests.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No pending requests</p>
              </Card>
            ) : (
              <div>
                {pendingRequests.map((req: GroupRequest) => (
                  <RequestCard key={req.id} request={req} showActions={true} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Approved Requests */}
          <TabsContent value="approved">
            {approvedRequests.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No approved groups yet</p>
              </Card>
            ) : (
              <div>
                {approvedRequests.map((req: GroupRequest) => (
                  <RequestCard key={req.id} request={req} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rejected Requests */}
          <TabsContent value="rejected">
            {rejectedRequests.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No rejected groups</p>
              </Card>
            ) : (
              <div>
                {rejectedRequests.map((req: GroupRequest) => (
                  <RequestCard key={req.id} request={req} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
