"use client"

import { useEffect, useState } from "react"
import { BookOpen, Target, Users, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import AppLayout from "@/components/app-layout"
import Link from "next/link"
import { ShieldAlert, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { authAPI } from "@/lib/api"

const badgeIcons: any = {
  Zap,
  Target,
  BookOpen,
  Users,
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState({ first_name: '', last_name: '', username: '', email: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '' })
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const data = await authAPI.getCurrentUser()
        setProfileData(data)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch profile:", err)
        setError("Failed to load profile. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    if (profileData) {
      setEditData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        username: profileData.username || '',
        email: profileData.email || ''
      })
    }
  }, [profileData])

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setEditError(null)
    try {
      await authAPI.updateProfile({
        first_name: editData.first_name,
        last_name: editData.last_name,
        username: editData.username
      })
      setProfileData({ ...profileData, ...editData })
      setIsEditDialogOpen(false)
    } catch (err: any) {
      console.error("Failed to update profile", err)
      setEditError(err.response?.data?.username?.[0] || "Failed to update profile. Username might be taken.")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingPassword(true)
    setPasswordError(null)
    try {
      await authAPI.changePassword(passwordData)
      setIsPasswordDialogOpen(false)
      setPasswordData({ old_password: '', new_password: '' })
      alert("Password changed successfully!")
    } catch (err: any) {
      console.error("Failed to change password", err)
      const errorData = err.response?.data;
      const errorMessage = errorData?.new_password?.[0] 
        || errorData?.old_password?.[0] 
        || errorData?.detail 
        || "Failed to change password.";
      setPasswordError(errorMessage)
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </AppLayout>
    )
  }

  if (error || !profileData) {
    if (!isAuthenticated) {
      return (
        <AppLayout>
          <div className="text-center py-20 glass rounded-lg p-12 max-w-lg mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Guest Profile</h2>
            <p className="text-slate-400 mb-8">You are currently exploring as a guest. Log in to track your XP, earn badges, and manage your study groups.</p>
            <Link href="/auth">
              <Button className="w-full">Sign in to your account</Button>
            </Link>
          </div>
        </AppLayout>
      )
    }

    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-red-500 text-sm">{error || "Failed to load profile"}</p>
        </div>
      </AppLayout>
    )
  }

  const currentXP = profileData.xp || 0
  const level = profileData.level || 1
  const nextLevelXP = level * 500 + 500 // Simple calculation
  const badges = profileData.badges || []
  const groups = profileData.groups || []

  return (
    <AppLayout>
      <div className="max-w-3xl">
        <Card className="glass-card p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileData.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.username}`} />
              <AvatarFallback>{profileData.username?.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                {profileData.first_name && profileData.last_name
                  ? `${profileData.first_name} ${profileData.last_name}`
                  : profileData.username
                }
              </h1>
              <p className="text-lg text-muted-foreground">Level {level}</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Edit2 size={16} />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
                    {editError && <p className="text-sm text-red-500">{editError}</p>}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={editData.email} 
                        disabled 
                        className="opacity-60 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={editData.username} 
                        onChange={(e) => setEditData({...editData, username: e.target.value})} 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input 
                        id="first_name" 
                        value={editData.first_name} 
                        onChange={(e) => setEditData({...editData, first_name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input 
                        id="last_name" 
                        value={editData.last_name} 
                        onChange={(e) => setEditData({...editData, last_name: e.target.value})} 
                      />
                    </div>
                    <div className="flex gap-2 w-full pt-2">
                      <Button type="submit" className="flex-1" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                        {profileData.has_usable_password ? "Change Password" : "Set Password"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{profileData.has_usable_password ? "Change Password" : "Set Password"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4">
                    {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    
                    {profileData.has_usable_password && (
                      <div className="space-y-2">
                        <Label htmlFor="old_password">Current Password</Label>
                        <Input 
                          id="old_password" 
                          type="password"
                          value={passwordData.old_password} 
                          onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})} 
                          required
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input 
                        id="new_password" 
                        type="password"
                        value={passwordData.new_password} 
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} 
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSavingPassword}>
                      {isSavingPassword ? (profileData.has_usable_password ? "Updating..." : "Setting...") : (profileData.has_usable_password ? "Update Password" : "Set Password")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {user?.is_staff && (
                <Link href="/admin">
                  <Button className="gap-2">
                    <ShieldAlert size={18} />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Button onClick={logout} variant="destructive" className="gap-2 bg-red-900/50 hover:bg-red-800/80 text-red-100 border border-red-800">
                Logout
              </Button>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">XP Progress</span>
              <span className="font-semibold">
                {currentXP} / {nextLevelXP} XP to next level
              </span>
            </div>
            <Progress value={(currentXP / nextLevelXP) * 100} className="h-3" />
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="groups">My Groups</TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges">
            {badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {badges.map((badge: any, idx: number) => {
                  const IconComponent = badgeIcons[badge.icon] || Zap
                  return (
                    <Card key={idx} className="glass-card p-6 text-center">
                      <div className={`p-4 rounded-full ${badge.bg_color} mb-3 inline-block`}>
                        <IconComponent size={32} className={badge.color} />
                      </div>
                      <p className="font-semibold">{badge.name}</p>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No badges earned yet. Start participating to earn badges!
              </div>
            )}
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups">
            {groups.length > 0 ? (
              <div className="space-y-3">
                {groups.map((group: any, idx: number) => (
                  <Link key={idx} href={`/study-groups/${group.id}`}>
                    <Card className="glass-card p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{group.name}</p>
                          <p className="text-sm text-muted-foreground">{group.members_count} members</p>
                        </div>
                        <span className="text-primary font-semibold">{group.members_count}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                You haven't joined any groups yet. Browse study groups to get started!
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
