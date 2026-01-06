"use client"

import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { data: session, status } = useSession()

  // Activity tracking on login
  useEffect(() => {
    if (status === 'authenticated' && session) {
      trackUserActivity()
    }
  }, [session, status])

  const trackUserActivity = () => {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    const savedStats = localStorage.getItem('brainbell_stats')
    
    if (!savedStats) {
      // First time user
      initializeStats(today)
      return
    }

    const stats = JSON.parse(savedStats)
    
    // Already tracked today
    if (stats.lastActivityDate === today) {
      return
    }

    // Calculate new streak
    let newStreak = 1
    if (stats.lastActivityDate === yesterday) {
      newStreak = (stats.currentStreak || 0) + 1
    }

    const newStats = {
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak || 0, newStreak),
      activityCalendar: {
        ...stats.activityCalendar,
        [today]: (stats.activityCalendar?.[today] || 0) + 1
      },
      totalStudyDays: Object.keys({ ...stats.activityCalendar, [today]: 1 }).length,
      lastActivityDate: today
    }

    localStorage.setItem('brainbell_stats', JSON.stringify(newStats))
  }

  const initializeStats = (today: string) => {
    const initialStats = {
      currentStreak: 1,
      bestStreak: 1,
      activityCalendar: { [today]: 1 },
      totalStudyDays: 1,
      lastActivityDate: today
    }
    localStorage.setItem('brainbell_stats', JSON.stringify(initialStats))
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row">
        {/* Mobile nav - shown only on small screens */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#191919] z-50">
          <DashboardNav className="h-full" />
        </div>

        {/* Desktop nav - hidden on small screens */}
        <div className={cn(
          "hidden md:block fixed left-0 h-screen transition-all duration-300",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}>
          <DashboardNav 
            className="h-full" 
            onCollapse={setIsSidebarCollapsed}
          />
        </div>

        {/* Main content */}
        <div className={cn(
          "w-full transition-all duration-300",
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64",
          "pb-16 md:pb-0"
        )}>
          <main className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}