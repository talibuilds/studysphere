"use client"

import Link from "next/link"
import { Calendar, MapPin, Users, BookOpen, Code, Cpu, PenTool, Layout, Monitor, Briefcase, ChevronRight } from "lucide-react"

interface StudySessionCardProps {
  session: {
    id: string
    course_code: string
    title: string
    date: string
    time: string
    location: string
    attendees_count: number
    host_name: string
    group_name?: string
    group_icon?: string
    group_id?: number
  }
  compact?: boolean
}

// Icon mapper for string -> Lucide component
const getIconComponent = (iconName?: string) => {
  switch (iconName) {
    case 'code': return Code;
    case 'cpu': return Cpu;
    case 'pen-tool': return PenTool;
    case 'layout': return Layout;
    case 'monitor': return Monitor;
    case 'book-open': return BookOpen;
    case 'briefcase': return Briefcase;
    case 'users': 
    default: return Calendar; // Fallback to Calendar for sessions
  }
}

export default function StudySessionCard({ session, compact = false }: StudySessionCardProps) {
  const Icon = getIconComponent(session.group_icon)

  return (
    <Link href={`/session/${session.id}`} className="block w-full outline-none">
      <div className="relative group overflow-hidden bg-background/20 backdrop-blur-md border border-primary/20 rounded-xl transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 cursor-pointer p-[1px]">
        
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Inner Card Content */}
        <div className={`relative flex items-center rounded-xl bg-card/40 z-10 ${
          compact ? "flex-col sm:flex-row p-4 gap-4" : "p-5 gap-6"
        }`}>
          
          {/* Hexagon Icon Wrapper */}
          <div className={`relative flex-shrink-0 flex items-center justify-center ${
            compact ? "w-16 h-20 sm:w-20 sm:h-24" : "w-20 h-24"
          }`}>
            <svg viewBox="0 0 100 115" className="absolute inset-0 w-full h-full text-primary/20 group-hover:text-primary/40 transition-colors drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <path 
                d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" 
                fill="currentColor" 
                stroke="currentColor" 
                strokeWidth="2"
              />
              <path 
                d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" 
                fill="none" 
                stroke="hsl(var(--primary))" 
                strokeWidth="1" 
                strokeOpacity="0.5"
              />
            </svg>
            <div className="relative z-10 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]">
              <Icon size={compact ? 24 : 28} strokeWidth={2.5} />
            </div>
          </div>

          {/* Middle Content */}
          <div className="flex-1 space-y-2 w-full min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-primary/20 text-primary/90 border border-primary/30">
                {session.course_code}
              </span>
              {session.group_name && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 max-w-[200px] truncate">
                  {session.group_name}
                </span>
              )}
            </div>
            
            <h3 className={`font-bold tracking-tight text-white truncate ${
              compact ? "text-lg" : "text-xl"
            }`}>{session.title}</h3>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-primary" />
                <span className="truncate">{session.date} @ {session.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-primary" />
                <span className="truncate">{session.location}</span>
              </div>
            </div>
          </div>

          {/* Right Action / Stats */}
          <div className={`flex items-center gap-4 ${
            compact ? "w-full justify-between sm:w-auto sm:justify-end ml-0 sm:ml-4 border-t border-border/20 sm:border-t-0 pt-3 sm:pt-0" : "ml-4"
          }`}>
            <div className="flex flex-col items-center min-w-[60px]">
              <span className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">{session.attendees_count || 0}</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Going</span>
            </div>
            
            <div className="w-10 h-10 rounded-lg border border-primary/30 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary group-hover:bg-primary/10 transition-all">
              <ChevronRight size={20} />
            </div>
          </div>

        </div>
      </div>
    </Link>
  )
}
