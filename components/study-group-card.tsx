"use client"

import Link from "next/link"
import { Users, Code, Cpu, PenTool, Layout, Monitor, BookOpen, Briefcase, ChevronRight } from "lucide-react"

interface StudyGroupCardProps {
  group: {
    id: string
    name: string
    subject: string
    description: string
    members: number
    createdBy: string
    memberImages: string[]
    chatLink?: string
    icon?: string
  }
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
    default: return Users;
  }
}

export default function StudyGroupCard({ group }: StudyGroupCardProps) {
  const Icon = getIconComponent(group.icon)

  return (
    <Link href={`/study-groups/${group.id}`} className="block w-full outline-none">
      <div className="relative group overflow-hidden bg-background/20 backdrop-blur-md border border-primary/20 rounded-xl transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 cursor-pointer p-[1px]">
        
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Inner Card Content */}
        <div className="relative flex items-center p-5 gap-6 rounded-xl bg-card/40 z-10">
          
          {/* Hexagon Icon Wrapper */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-20 h-24">
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
              <Icon size={28} strokeWidth={2.5} />
            </div>
          </div>

          {/* Middle Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-primary/20 text-primary/90 border border-primary/30">
                {group.subject}
              </span>
              <span className="text-xs text-primary/80 font-medium tracking-wide">
                Study Group
              </span>
            </div>
            
            <h3 className="text-xl font-bold tracking-tight text-white">{group.name}</h3>
            
            <p className="text-sm text-muted-foreground line-clamp-1 max-w-[80%]">
              {group.description}
            </p>
          </div>

          {/* Right Action / Stats */}
          <div className="flex items-center gap-6 ml-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white drop-shadow-md">{group.members}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Members</span>
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
