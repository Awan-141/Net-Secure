"use client"

// React and Next.js imports
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

// Component imports
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { SecurityToolsSection } from "@/components/SecurityToolsSection"
import { FileToolsSection } from "@/components/FileToolsSection"
import { SidebarToggleButton } from "@/components/SidebarToggleButton"
import { MobileHeader } from "@/components/MobileHeader"
import { MainContent } from "@/components/MainContent"

// Icons
import {
  RefreshCw,
  Lock,
  Zap,
  FileArchive,
  FileDigit,
  Shield,
  KeyRound,
  ArrowRight,
  HelpCircle,
  Menu,
  Wifi,
  Code,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Scan
} from "lucide-react"

// UI component imports
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

type Result = {
  [key: string]: string | number
}

type HistoryEntry = {
  timestamp: string
  ping: number
  download: number
  upload: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://52.4.69.90:3001/"

const SecureApp = () => {
  const router = useRouter()
  const [results, setResults] = useState<Result>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [username, setUsername] = useState<string>("")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [animateHero, setAnimateHero] = useState(false)
  const { setOpenMobile } = useSidebar()

  const logout = () => {
    localStorage.removeItem("username")
    router.push("/login")
  }

  useEffect(() => {
    // Check if user is logged in
    const storedUsername = localStorage.getItem("username") || "Demo User"
    setUsername(storedUsername)

    // Trigger hero animation after a short delay
    setTimeout(() => {
      setAnimateHero(true)
    }, 300)
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    // Simulated data loading
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }

  // Update the mobile button click handler
  const handleMobileMenuClick = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
    setOpenMobile(!mobileSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <AppSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        username={username} 
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <MobileHeader activeTab={activeTab} handleMobileMenuClick={handleMobileMenuClick} />

      <div className={cn(
        "min-h-screen pt-0 transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-64" : "lg:ml-16"
      )}>
        {/* Sidebar Toggle Button (Desktop) */}
        <SidebarToggleButton sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="mx-auto w-[95%] px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-card rounded-xl border shadow-sm p-6 sm:p-8">
            <MainContent
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              animateHero={animateHero}
              fetchData={fetchData}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default function Page() {
  return <SecureApp />
}
