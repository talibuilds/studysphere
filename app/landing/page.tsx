"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, BrainCircuit, Sparkles, Flame, BookOpen, CheckCircle, Rocket, Users, Target } from "lucide-react"
import Link from "next/link"
import StudySessionCard from "@/components/study-session-card"

const mockPopularSessions = [
  {
    id: "1",
    course_code: "22CS3AEFWD",
    title: "Full Stack Web Development",
    date: "Oct 22",
    time: "8:00 AM - 10:00 AM",
    location: "CSE-UG LAB2",
    attendees_count: 4,
    host_name: "RazanCodes",
    group_name: "Team StudySphere",
  },
  {
    id: "2",
    course_code: "23MA3BSSDM",
    title: "Probability Practice",
    date: "Oct 23",
    time: "1:00 PM - 2:00 PM",
    location: "Reference Section, 1st Floor PJA Block",
    attendees_count: 8,
    host_name: "Talib Khan",
    group_name: "SDM Group",
  },
  {
    id: "3",
    course_code: "23CS3PCOOJ ",
    title: "Java Coding Session (cie-1)",
    date: "Oct 25",
    time: "3:00 PM - 5:00 PM",
    location: "CSE Dept, Room 102",
    attendees_count: 12,
    host_name: "RazanCodes",
    group_name: "Backend Fans",
  },
  {
    id: "4",
    course_code: "23CS3PCDST",
    title: "Data Structures",
    date: "Oct 31",
    time: "5:00 PM - 7:00 PM",
    location: "cse DEPT, DS LAB",
    attendees_count: 15,
    host_name: "Muzammil Zahoor",
    group_name: "DSA FANS",
  },
]

const steps = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up with your email and set up your profile to get started with StudySphere.",
    icon: Users,
  },
  {
    number: 2,
    title: "Join Study Groups",
    description: "Discover and join study groups that match your interests and academic level.",
    icon: Target,
  },
  {
    number: 3,
    title: "Join Study Sessions",
    description: "Browse upcoming sessions and RSVP to join collaborative study sessions with peers.",
    icon: BookOpen,
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 backdrop-blur-md bg-background/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold text-primary">
            <BrainCircuit size={24} />
            StudySphere
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/discover">Explore</Link>
            </Button>
            <Button asChild>
              <Link href="/">Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Rocket className="text-primary" size={32} />
            </div>
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              WHERE BMSCE STUDYS - StudySphere
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect with peers, join collaborative study sessions, and accelerate your learning journey with
              StudySphere.
            </p>
          </div>

          <div className="pt-4">
            <Button size="lg" className="gap-2 px-8 py-6 text-base" asChild>
              <Link href="/auth">
                Join StudySphere
                <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Sessions Carousel */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <Flame className="text-orange-500" size={28} />
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Popular Study Sessions</h2>
              <p className="text-muted-foreground">Discover the most popular sessions happening right now</p>
            </div>
          </div>

          <div
            className="overflow-x-auto pb-4 -mx-6 px-6 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="flex gap-6 w-max">
              {mockPopularSessions.map((session) => (
                <div key={session.id} className="w-96 flex-shrink-0">
                  <StudySessionCard session={session} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">How to Use StudySphere</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const IconComponent = step.icon
              return (
                <Card
                  key={step.number}
                  className="glass border border-border p-8 space-y-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-primary">{step.number}</span>
                    </div>
                    <IconComponent className="text-primary/60" size={24} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-4">
            <Rocket className="text-primary" size={32} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Ready to Transform Your Studies?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of students already learning together on StudySphere.
            </p>
          </div>
          <Button size="lg" className="gap-2 px-8 py-6 text-base" asChild>
            <Link href="/auth">
              Get Started Now
              <ArrowRight size={20} />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">© 2025 StudySphere. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
