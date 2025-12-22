"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { BrainCircuit, LayoutDashboard, Search, Trophy, User, Moon, BookOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/app/providers"
import { useAuth } from "@/lib/auth-context"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/discover", label: "Discover", icon: Search },
    { href: "/study-groups", label: "Study Groups", icon: BookOpen },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/profile", label: "My Profile", icon: User },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border sticky top-0 overflow-y-auto">
        <div className="glass sticky top-0 px-6 py-5 border-b border-border">
          <Link href="/landing" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-lg bg-primary/15 text-primary">
              <BrainCircuit size={24} />
            </div>
            <span className="text-lg font-semibold tracking-tight">StudySphere</span>
          </Link>
        </div>

        {/* Primary Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={active ? "default" : "ghost"} className="w-full justify-start gap-3 h-10">
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Bottom User Info */}
        <div className="absolute bottom-0 left-0 right-0 glass border-t border-border rounded-none p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`} />
              <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {isAuthenticated
                  ? (user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username || 'User')
                  : 'Guest'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAuthenticated ? `Level ${user?.level || 1}` : 'Not logged in'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 h-9"
            onClick={toggleTheme}
          >
            <Moon size={16} />
            <span className="text-xs font-medium">{isDark ? "Light" : "Dark"}</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6">{children}</div>
      </main>
    </div>
  )
}
