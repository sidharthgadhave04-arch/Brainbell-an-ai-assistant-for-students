"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Brain, FileText, Home, Timer, Users, LogOut, PanelLeftClose, PanelLeft, FileUp, Calendar } from "lucide-react"
import { signOut, useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface NavItem {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  badge?: string;
  onClick?: () => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface DashboardNavProps extends React.HTMLAttributes<HTMLDivElement> {
  onCollapse?: (collapsed: boolean) => void;
}

export function DashboardNav({ className, onCollapse, ...props }: DashboardNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse?.(!isCollapsed);
  }

  const navSections: NavSection[] = [
    {
      title: "General",
      items: [
        {
          label: 'Home',
          icon: Home,
          href: '/home',
        },
        {
          label: 'Profile',
          icon: Users,
          href: '/profile',
        },
      ]
    },
    {
      title: "Study Tools",
      items: [
        {
          label: 'Planner',
          icon: BookOpen,
          href: '/study-plan',
        },
        {
          label: 'Event Zone',
          icon: Calendar,
          href: '/events',
        },
        {
          label: 'Resources',
          icon: Brain,
          href: '/resources',
        },
        {
          label: 'Scriba',
          icon: FileUp,
          href: '/pdf',
        },
        {
          label: 'AI summarizer',
          icon: FileUp,
          href: '/summarizer',
        },
        {
          label: 'Timer',
          icon: Timer,
          href: '/timer',
        },
        {
          label: 'Notes',
          icon: FileText,
          href: '/notes',
        },
      ]
    },
    {
      title: "Account",
      items: [
        {
          label: 'Log out',
          icon: LogOut,
          href: '#',
          onClick: () => signOut({ callbackUrl: '/' })
        }
      ]
    }
  ]

  return (
    <nav
      className={cn(
        "relative h-full bg-background text-foreground transition-all duration-300 flex flex-col",
        isCollapsed ? "md:w-20" : "md:w-64",
        className
      )}
      {...props}
    >
      <div className="flex-1 overflow-hidden px-3 py-2">
        {/* Desktop View */}
        <div className="hidden md:block h-full">
          <div className={cn("mb-4", isCollapsed ? "px-2" : "px-4")}>
            {/* Avatar and Welcome Section */}
            <div className="flex flex-col items-center mb-3 mt-6">
              <Avatar className="h-10 w-10 bg-[color:var(--muted)] ring-2 ring-primary/20">
                <AvatarImage
                  src={session?.user?.image || "/images/default-avatar.png"}
                  alt={session?.user?.name || '@user'}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {session?.user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && session?.user?.name && (
                <p className="mt-2 text-sm font-medium text-center">
                  Welcome, {session.user.name}
                </p>
              )}
              
            </div>
            
            {/* Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full flex items-center justify-center gap-2 hover:bg-primary/10 transition-all duration-200",
                isCollapsed && "px-0"
              )}
              onClick={toggleCollapse}
            >
              {isCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Navigation Sections with reduced spacing */}
          {navSections.map((section, idx) => (
            <div key={section.title} className={cn(
              "py-1.5",
              idx !== 0 && "mt-2",
              isCollapsed && "px-0"
            )}>
              {!isCollapsed && (
                <h3 className={cn(
                  "px-4 text-xs font-semibold text-muted-foreground/80 mb-1.5 uppercase tracking-wider transition-all duration-500",
                  isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
                style={{ transitionDelay: `${idx * 100}ms` }}>
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {section.items.map((item, itemIdx) => {
                  const globalIdx = navSections.slice(0, idx).reduce((acc, s) => acc + s.items.length, 0) + itemIdx;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={item.onClick}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-100 ease-out overflow-hidden",
                        isActive
                          ? "text-foreground bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shadow-lg border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-md hover:translate-x-1 hover:border-black border border-transparent",
                        isCollapsed
                          ? "justify-center px-2 py-2.5"
                          : "px-4 py-2.5",
                        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      )}
                      style={{ transitionDelay: `${globalIdx * 50 + 200}ms` }}
                    >
                      {/* Animated gradient background */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-100",
                        isActive && "opacity-100 animate-pulse"
                      )} />
                      
                      {/* Active indicator bar with glow */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-r-full shadow-lg shadow-primary/50" />
                      )}
                      
                      {/* Icon with enhanced animation */}
                      <div className="relative">
                        <item.icon className={cn(
                          "h-4 w-4 relative z-10 transition-all duration-75",
                          isActive 
                            ? "text-primary scale-110 drop-shadow-md" 
                            : "text-foreground group-hover:scale-125 group-hover:rotate-6 group-hover:text-primary"
                        )} />
                        {isActive && (
                          <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse" />
                        )}
                      </div>
                      
                      {!isCollapsed && (
                        <span className="relative z-10 transition-all duration-75 group-hover:font-semibold">
                          {item.label}
                        </span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto relative z-10 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-md animate-bounce">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border shadow-2xl z-50">
          <div className="flex justify-around items-center overflow-x-auto py-2 px-2">
            {navSections.flatMap(section => section.items).map((item, idx) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={item.onClick}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-2 min-w-[65px] rounded-xl transition-all duration-100 ease-out overflow-hidden",
                    isActive
                      ? "text-foreground bg-primary/20 shadow-xl scale-110 border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-lg hover:scale-105 border border-transparent",
                    isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                  style={{ transitionDelay: `${idx * 30}ms` }}
                >
                  {/* Glowing effect */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-100",
                    isActive && "opacity-100"
                  )} />
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                  )}
                  
                  <item.icon className={cn(
                    "h-5 w-5 relative z-10 transition-all duration-100",
                    isActive 
                      ? "scale-110 text-primary drop-shadow-md" 
                      : "group-hover:scale-125 group-hover:-translate-y-1 group-hover:text-primary"
                  )} />
                  <span className={cn(
                    "text-[10px] mt-1 font-medium relative z-10 transition-all duration-100",
                    isActive && "text-primary font-semibold"
                  )}>{item.label}</span>
                  {item.badge && (
                    <span className="absolute top-0 right-0 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full z-10 shadow-md animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}