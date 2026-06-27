"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Users, ClipboardCheck, BookOpen, Heart, Moon, Sun, ArrowRight, Flame } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/app/providers"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StudySessionCard from "@/components/study-session-card"
import { sessionsAPI } from "@/lib/api"
import { Card } from "@/components/ui/card"

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme()
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [popularSessions, setPopularSessions] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // Fetch real-time sessions
    const fetchSessions = async () => {
      try {
        const data = await sessionsAPI.getAll()
        // Extract array from paginated response if needed
        const sessionsArray = data.results ? data.results : data
        
        if (Array.isArray(sessionsArray)) {
          // Sort by attendees_count descending
          const sorted = sessionsArray.sort((a: any, b: any) => (b.attendees_count || 0) - (a.attendees_count || 0))
          setPopularSessions(sorted.slice(0, 4)) // Take top 4
        } else {
          console.error("API did not return an array of sessions", data)
        }
      } catch (err) {
        console.error("Failed to fetch sessions", err)
      } finally {
        setLoadingSessions(false)
      }
    }
    
    fetchSessions()
  }, [])

  return (
    <main className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500 font-sans selection:bg-primary/30">
      
      {/* Global Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-[100px] animate-[spin_30s_linear_infinite] origin-bottom-right" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-[80px] animate-[spin_25s_linear_infinite_reverse] origin-top-left" />
      </div>
      
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-bold tracking-tight">StudySphere</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/discover" className="hover:text-foreground transition-colors">Explore</Link>
            <Link href="/discover" className="hover:text-foreground transition-colors">Sessions</Link>
            <Link href="/study-groups" className="hover:text-foreground transition-colors">Resources</Link>
            <Link href="/leaderboard" className="hover:text-foreground transition-colors">Community</Link>
          </div>

          <div className="flex items-center gap-4">
            {mounted && (
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
            <Link href={isAuthenticated ? "/dashboard" : "/auth"}>
              <Button variant="secondary" className="rounded-full font-semibold px-6">
                {isAuthenticated ? "Dashboard" : "Login"}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 min-h-[90vh] flex flex-col justify-center relative z-10">
        {/* Background glow effects for dark mode */}
        {mounted && isDark && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px]" />
          </div>
        )}

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text & CTA */}
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 backdrop-blur-md">
              <Sparkles size={16} />
              <span>#1 Collaboration Platform for BMSCE</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Where BMSCE <br />
                Studies <span className="text-blue-500">Together</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Connect with peers, join interactive study sessions, share resources, and accelerate your learning journey with peers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button size="lg" className="rounded-xl gap-2 px-8 py-6 text-base w-full sm:w-auto shadow-lg shadow-blue-500/25 bg-blue-500 hover:bg-blue-600 text-white" asChild>
                <Link href="/auth">
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl gap-2 px-8 py-6 text-base w-full sm:w-auto border-border/50 bg-background/50 backdrop-blur hover:bg-muted" asChild>
                <Link href="/discover">
                  Explore Sessions
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center">
            {mounted && (
              isDark ? (
                /* Dark Mode: 3D Glowing Sphere with Orbits */
                <div className="relative w-72 h-72 lg:w-96 lg:h-96">
                  {/* Central glowing sphere */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-700 via-blue-500 to-blue-300 shadow-[0_0_80px_rgba(59,130,246,0.5)] opacity-90 animate-[pulse_4s_ease-in-out_infinite]"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-transparent to-black/40"></div>
                  <div className="absolute top-4 left-10 w-20 h-20 bg-white/30 rounded-full blur-2xl"></div>
                  
                  {/* Orbital rings */}
                  <div className="absolute inset-[-20%] rounded-[100%] border border-blue-400/30 transform -rotate-12"></div>
                  <div className="absolute inset-[-45%] rounded-[100%] border border-blue-400/20 transform rotate-12"></div>
                  <div className="absolute inset-[-30%] rounded-[100%] border-t border-purple-400/40 transform rotate-[60deg]"></div>

                  {/* Avatars on orbits */}
                  <div className="absolute top-[-10%] right-[10%] p-1 bg-background/50 backdrop-blur rounded-full border border-border/50 animate-[bounce_4s_infinite]">
                    <Avatar className="h-12 w-12 border-2 border-blue-500">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                    </Avatar>
                  </div>
                  
                  <div className="absolute bottom-[5%] right-[-15%] p-1 bg-background/50 backdrop-blur rounded-full border border-border/50 animate-[bounce_5s_infinite_1s]">
                    <Avatar className="h-14 w-14 border-2 border-purple-500">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aidan" />
                    </Avatar>
                  </div>
                  
                  <div className="absolute bottom-[20%] left-[-10%] p-1 bg-background/50 backdrop-blur rounded-full border border-border/50 animate-[bounce_6s_infinite_0.5s]">
                    <Avatar className="h-10 w-10 border-2 border-pink-500">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                    </Avatar>
                  </div>
                  
                  <div className="absolute top-[20%] left-[-25%] p-3 bg-background/50 backdrop-blur-md rounded-xl border border-border/50 shadow-xl flex items-center justify-center text-blue-400 animate-[bounce_4s_infinite_1.5s]">
                    <BookOpen size={24} />
                  </div>
                  
                  {/* Stars/Particles */}
                  <div className="absolute top-[-30%] left-[20%] w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_10px_rgba(147,197,253,1)]"></div>
                  <div className="absolute bottom-[-20%] right-[30%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,1)]"></div>
                  <div className="absolute top-[50%] right-[-40%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]"></div>
                </div>
              ) : (
                /* Light Mode: Flat vector illustration */
                <div className="relative w-full h-[350px] lg:h-[450px]">
                  {/* Decorative background blob for light mode */}
                  <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] rounded-full bg-blue-100/50 blur-[80px] -z-10" />
                  <Image 
                    src="/students_illustration.png" 
                    alt="Students studying together"
                    fill
                    className="object-contain"
                    priority
                  />
                  {/* Floating Elements mimicking the reference */}
                  <div className="absolute top-[10%] left-[0%] p-3 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-[bounce_4s_infinite]">
                     <Avatar className="h-10 w-10">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mia" />
                    </Avatar>
                    <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                  
                  <div className="absolute top-[25%] right-[0%] p-3 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-2 animate-[bounce_5s_infinite_1s]">
                    <div className="flex gap-2">
                       <div className="h-6 w-6 bg-blue-100 rounded flex items-center justify-center text-blue-500">
                         <ClipboardCheck size={14} />
                       </div>
                       <div className="h-2 w-12 bg-gray-200 rounded-full mt-2"></div>
                    </div>
                    <div className="h-8 w-full flex items-end gap-1">
                      <div className="w-2 h-4 bg-blue-200 rounded-t-sm"></div>
                      <div className="w-2 h-6 bg-blue-400 rounded-t-sm"></div>
                      <div className="w-2 h-8 bg-blue-600 rounded-t-sm"></div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Stats Banner */}
        <div className="max-w-5xl mx-auto w-full mt-16 relative z-10">
          <div className="glass rounded-2xl border border-border/50 p-6 md:p-8 flex flex-wrap md:flex-nowrap justify-between gap-6 md:gap-4 shadow-xl">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">500+</h3>
                <p className="text-sm text-muted-foreground font-medium">Active Students</p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-border/50 self-center"></div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">120+</h3>
                <p className="text-sm text-muted-foreground font-medium">Study Sessions</p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-border/50 self-center"></div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">50+</h3>
                <p className="text-sm text-muted-foreground font-medium">Resources Shared</p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-border/50 self-center"></div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
                <Heart size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">98%</h3>
                <p className="text-sm text-muted-foreground font-medium">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sessions Section */}
      <section className="py-24 px-6 relative z-10 border-t border-border/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Flame className="text-orange-500" size={24} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trending Sessions</h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl">Join the most active study groups happening right now. Powered by real-time student activity.</p>
            </div>
            <Button variant="ghost" className="gap-2 group hover:bg-transparent hover:text-primary">
              <Link href="/discover" className="flex items-center gap-2">
                View all sessions
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {loadingSessions ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : popularSessions.length > 0 ? (
            <div
              className="overflow-x-auto pb-8 -mx-6 px-6 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex gap-6 w-max">
                {popularSessions.map((session, i) => (
                  <div key={session.id} className="w-[350px] md:w-[400px] flex-shrink-0 hover:-translate-y-2 transition-transform duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                    <StudySessionCard session={session} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 glass rounded-2xl border border-border/50">
              <p className="text-muted-foreground">No sessions available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-24 px-6 relative z-10 border-t border-border/20 bg-muted/30">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How it works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Get started in three simple steps and revolutionize the way you study.</p>
          </div>

          <div className="space-y-24">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 md:order-1 order-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xl border border-blue-500/20">1</div>
                <h3 className="text-3xl font-bold">Create Your Profile</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Sign up with your college email and set up your personalized learning profile. Add your courses, interests, and study preferences so StudySphere can perfectly match you with the right peers.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Connect with classmates instantly</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Customize your learning journey</li>
                </ul>
              </div>
              <div className="md:order-2 order-1 relative h-[300px] md:h-[400px] glass rounded-3xl border border-border/50 flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                {/* Custom CSS Illustration for Profile */}
                <div className="relative w-64 h-80 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 transform group-hover:scale-105 transition-transform duration-500">
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full mx-auto flex items-center justify-center text-blue-500 mb-2 ring-4 ring-background animate-pulse">
                    <Users size={32} />
                  </div>
                  <div className="h-4 w-32 bg-border rounded-full mx-auto"></div>
                  <div className="h-3 w-24 bg-border/50 rounded-full mx-auto"></div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10"></div>
                      <div className="flex-1 h-8 rounded-lg bg-muted"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10"></div>
                      <div className="flex-1 h-8 rounded-lg bg-muted"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10"></div>
                      <div className="flex-1 h-8 rounded-lg bg-muted"></div>
                    </div>
                  </div>
                  
                  {/* Floating badge */}
                  <div className="absolute -right-6 top-1/4 p-3 glass rounded-xl border border-blue-500/30 text-blue-500 shadow-xl animate-[bounce_3s_infinite]">
                    <Sparkles size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative h-[300px] md:h-[400px] glass rounded-3xl border border-border/50 flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
                {/* Custom CSS Illustration for Networking */}
                <div className="relative w-full h-full flex items-center justify-center">
                   {/* Center Node */}
                   <div className="absolute z-10 w-20 h-20 bg-purple-500 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center text-white">
                     <Users size={32} />
                   </div>
                   
                   {/* Surrounding Nodes */}
                   <div className="absolute top-[20%] left-[20%] w-12 h-12 glass rounded-full flex items-center justify-center border-purple-500/30 animate-[bounce_4s_infinite]">
                     <Avatar className="w-10 h-10"><AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" /></Avatar>
                   </div>
                   <div className="absolute top-[30%] right-[15%] w-14 h-14 glass rounded-full flex items-center justify-center border-purple-500/30 animate-[bounce_3.5s_infinite]">
                     <Avatar className="w-12 h-12"><AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" /></Avatar>
                   </div>
                   <div className="absolute bottom-[25%] left-[25%] w-16 h-16 glass rounded-full flex items-center justify-center border-purple-500/30 animate-[bounce_5s_infinite]">
                     <Avatar className="w-14 h-14"><AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amit" /></Avatar>
                   </div>
                   <div className="absolute bottom-[20%] right-[25%] w-12 h-12 glass rounded-full flex items-center justify-center border-purple-500/30 animate-[bounce_4.5s_infinite]">
                     <Avatar className="w-10 h-10"><AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Neha" /></Avatar>
                   </div>
                   
                   {/* SVG Lines connecting nodes */}
                   <svg className="absolute inset-0 w-full h-full -z-10 opacity-30">
                     <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,5" className="animate-[pulse_2s_infinite]" />
                     <line x1="50%" y1="50%" x2="80%" y2="35%" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,5" className="animate-[pulse_2s_infinite_0.5s]" />
                     <line x1="50%" y1="50%" x2="30%" y2="70%" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,5" className="animate-[pulse_2s_infinite_1s]" />
                     <line x1="50%" y1="50%" x2="70%" y2="75%" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,5" className="animate-[pulse_2s_infinite_1.5s]" />
                   </svg>
                </div>
              </div>
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xl border border-purple-500/20">2</div>
                <h3 className="text-3xl font-bold">Find Your Squad</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Discover and join active study groups that perfectly match your academic goals. Whether it's last-minute exam prep or weekly coding sessions, there's a squad waiting for you.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Browse popular study groups</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Engage in active discussions</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 md:order-1 order-2">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xl border border-cyan-500/20">3</div>
                <h3 className="text-3xl font-bold">Start Learning & Earn XP</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  RSVP to upcoming sessions, collaborate in real-time, and earn XP for your progress. Share resources, ask questions, and climb the global leaderboard as you master new skills!
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Earn XP for every session attended</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Unlock badges and rise up the leaderboard</li>
                </ul>
              </div>
              <div className="md:order-2 order-1 relative h-[300px] md:h-[400px] glass rounded-3xl border border-border/50 flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent"></div>
                {/* Custom CSS Illustration for Learning/XP */}
                <div className="relative w-64 h-64 flex flex-col items-center justify-end gap-2 px-8 pt-8 pb-4">
                  {/* Chart bars */}
                  <div className="flex items-end justify-between w-full h-40 gap-2 relative z-10">
                    <div className="w-1/4 bg-cyan-500/20 h-[30%] rounded-t-lg transition-all group-hover:h-[40%]"></div>
                    <div className="w-1/4 bg-cyan-500/40 h-[50%] rounded-t-lg transition-all group-hover:h-[70%]"></div>
                    <div className="w-1/4 bg-cyan-500/60 h-[70%] rounded-t-lg transition-all group-hover:h-[90%]"></div>
                    <div className="w-1/4 bg-cyan-500 h-[90%] rounded-t-lg relative transition-all group-hover:h-[100%] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                       <div className="absolute -top-10 -left-6 glass border-cyan-500/30 text-cyan-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-bounce">
                         +500 XP
                       </div>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-border rounded-full"></div>
                  
                  <div className="absolute top-8 left-8 p-4 glass rounded-2xl border border-cyan-500/30 text-cyan-500 shadow-xl animate-[pulse_3s_infinite]">
                    <Flame size={32} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6 bg-background/80 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xl font-bold text-primary">
            <Logo className="w-6 h-6" />
            StudySphere
          </div>
          <p className="text-muted-foreground text-sm font-medium">© 2026 StudySphere BMSCE. Elevating Education.</p>
        </div>
      </footer>
    </main>
  )
}
