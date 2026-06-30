"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { BrainCircuit, LayoutDashboard, Search, Trophy, User, Moon, BookOpen, Menu } from 'lucide-react'
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/app/providers"
import { useAuth } from "@/lib/auth-context"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/discover", label: "Discover", icon: Search },
    { href: "/study-groups", label: "Study Groups", icon: BookOpen },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/profile", label: "My Profile", icon: User },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const SidebarContent = () => (
    <>
      <div className="glass sticky top-0 px-6 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsOpen(false)}>
          <Logo className="w-8 h-8" />
          <span className="text-lg font-semibold tracking-tight">StudySphere</span>
        </Link>
      </div>

      {/* Primary Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              <Button variant={active ? "default" : "ghost"} className="w-full justify-start gap-3 h-10">
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Bottom User Info */}
      <div className="absolute bottom-0 left-0 right-0 glass border-t border-border rounded-none p-4 space-y-3 bg-background">
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
    </>
  )

  return (
    <div className="flex h-screen bg-background flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border glass sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="text-lg font-semibold tracking-tight">StudySphere</span>
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu size={24} />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-background border-r border-border">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full relative">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border sticky top-0 h-screen overflow-hidden relative bg-background">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-auto relative bg-background">
        <div className="flex-1 px-4 sm:px-8 py-6">{children}</div>
        
        {/* Global Footer */}
        <footer className="w-full py-4 px-4 sm:px-8 border-t border-border/40 mt-auto text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left">© 2026 StudySphere BMSCE. Elevating Education.</p>
          <p className="flex items-center justify-center gap-1 flex-wrap">
            Built by{' '}
            <a href="https://github.com/talibuilds" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary transition-colors">Talibuilds</a>{' '}|{' '}
            <a href="https://github.com/razancodes" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary transition-colors">Razancodes</a>{' '}|{' '}
            <a href="https://github.com/maayaankmehta" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary transition-colors">Mayankmehta</a>
          </p>
        </footer>
      </main>
    </div>
  )
}
