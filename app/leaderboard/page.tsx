"use client"

import { useEffect, useState } from "react"
import { Trophy } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AppLayout from "@/components/app-layout"
import { leaderboardAPI } from "@/lib/api"

const badgeDefinitions = {
  Initiator: { color: "bg-yellow-500/20", textColor: "text-yellow-600" },
  "Weekend Warrior": { color: "bg-red-500/20", textColor: "text-red-600" },
  "Knowledge Seeker": { color: "bg-blue-500/20", textColor: "text-blue-600" },
  "Team Player": { color: "bg-green-500/20", textColor: "text-green-600" },
  "Rising Star": { color: "bg-purple-500/20", textColor: "text-purple-600" },
  "Study Buddy": { color: "bg-cyan-500/20", textColor: "text-cyan-600" },
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={20} className="text-yellow-500" />
  if (rank === 2) return <Trophy size={20} className="text-gray-400" />
  if (rank === 3) return <Trophy size={20} className="text-orange-600" />
  return null
}

function LeaderboardRow({ item }: { item: any }) {
  const badge = badgeDefinitions[item.badge as keyof typeof badgeDefinitions] || badgeDefinitions["Rising Star"]

  return (
    <Card className="glass-card p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-8 flex justify-center">
            {[1, 2, 3].includes(item.rank) ? (
              <MedalIcon rank={item.rank} />
            ) : (
              <span className="font-bold text-lg text-muted-foreground">#{item.rank}</span>
            )}
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`} />
            <AvatarFallback>{item.username?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <span className="font-semibold">{item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : item.username}</span>
            <div className="mt-1">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.color} ${badge.textColor}`}>
                {item.badge}
              </span>
            </div>
          </div>
        </div>
        <span className="font-bold text-lg text-primary">{item.xp?.toLocaleString()} XP</span>
      </div>
    </Card>
  )
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'week' | 'all'>('week')
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const data = await leaderboardAPI.get(period)
        setLeaderboard(data)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch leaderboard:", err)
        setError("Failed to load leaderboard. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [period])

  const handleTabChange = (value: string) => {
    setPeriod(value as 'week' | 'all')
  }

  return (
    <AppLayout>
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Student Leaderboard</h1>

        <Tabs value={period} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="all">All-Time</TabsTrigger>
          </TabsList>

          {loading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">Loading leaderboard...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <TabsContent value="week" className="space-y-3">
                {leaderboard.map((item) => (
                  <LeaderboardRow key={item.id} item={item} />
                ))}
              </TabsContent>

              <TabsContent value="all" className="space-y-3">
                {leaderboard.map((item) => (
                  <LeaderboardRow key={item.id} item={item} />
                ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AppLayout>
  )
}
