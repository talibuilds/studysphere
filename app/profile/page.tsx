"use client"

import { useEffect, useState } from "react"
import { BookOpen, Target, Users, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import AppLayout from "@/components/app-layout"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth'
      }
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
              {user?.is_staff && (
                <Link href="/admin">
                  <Button className="gap-2">
                    <ShieldAlert size={18} />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={logout} className="gap-2">
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
