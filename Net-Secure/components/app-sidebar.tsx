"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lock,
  Zap,
  FileArchive,
  FileDigit,
  Shield,
  KeyRound,
  Home,
  LogOut,
  ChevronRight,
  Code,
  Menu,
  X,
  ChevronLeft,
  Volume2,
  VolumeX
} from "lucide-react"
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface AppSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  username: string | null
  onLogout: () => void
  isOpen?: boolean
  onClose?: () => void
}

export function AppSidebar({ activeTab, setActiveTab, username, onLogout, isOpen = true, onClose }: AppSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { setOpen, setOpenMobile } = useSidebar()
  const pathname = usePathname()
  const [soundEnabled, setSoundEnabled] = useState(false)
  const humAudioRef = useRef<HTMLAudioElement>(null)

  const playHumSound = () => {
    if (soundEnabled && humAudioRef.current) {
      humAudioRef.current.currentTime = 0
      humAudioRef.current.play()
    }
  }

  const stopHumSound = () => {
    if (humAudioRef.current) {
      humAudioRef.current.pause()
    }
  }

  // Sync sidebar state with props
  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen, setOpen])

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsMobileOpen(false)
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  const navigationItems = [
    {
      section: "Main",
      items: [
        {
          name: "Dashboard",
          icon: Home,
          tab: "dashboard"
        }
      ]
    },
    {
      section: "Security Tools",
      items: [
        {
          name: "Site Security Inspector",
          icon: Shield,
          tab: "site-inspector"
        },
        {
          name: "Password Analyzer",
          icon: KeyRound,
          tab: "password-analyzer"
        },
        {
          name: "Password Generator",
          icon: KeyRound,
          tab: "password-generator"
        },
        {
          name: "Code Obfuscator",
          icon: Code,
          tab: "code-obfuscator"
        }
      ]
    },
    {
      section: "File Tools",
      items: [
        {
          name: "File Encryption",
          icon: Lock,
          tab: "encryption"
        },
        {
          name: "File Compressor",
          icon: FileArchive,
          tab: "compressor"
        },
        {
          name: "Hash Generator",
          icon: FileDigit,
          tab: "hash-generator"
        },
        {
          name: "Transfer Estimator",
          icon: Zap,
          tab: "estimator"
        }
      ]
    }
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar 
        className="border-r bg-sidebar-background"
        onMouseEnter={playHumSound}
        onMouseLeave={stopHumSound}
      >
        <audio 
          ref={humAudioRef} 
          src="/sounds/lightsaber-hum.mp3" 
          loop 
          preload="auto"
        />

        {/* Lightsaber effect */}
        <div className="sidebar-lightsaber" />

        <SidebarHeader>
          <div className="flex h-16 items-center border-b border-border/10 px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold flex-1">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="h-6 w-6 text-primary" />
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/10"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <motion.span 
                className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                NetSecure
              </motion.span>
            </Link>
          </div>

          <div className="border-b border-border/10 p-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center relative group"
              >
                <span className="text-sm font-medium text-primary">
                  {username?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/5"
                  initial={false}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div className="space-y-0.5 flex-1">
                <p className="text-sm font-medium">{username || "User"}</p>
                
              </div>
              <ThemeToggle />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="flex-1 px-4 py-6">
            <nav className="space-y-6">
              {navigationItems.map((section, sectionIndex) => (
                <div key={section.section} className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase px-2">
                    {section.section}
                  </h3>
                  {section.items.map((item, itemIndex) => (
                    <Button
                      key={item.tab}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start rounded-lg text-sm font-medium transition-all duration-200",
                        "hover:bg-primary/10 hover:text-primary",
                        "relative overflow-hidden",
                        activeTab === item.tab && "bg-primary/10 text-primary"
                      )}
                      onClick={() => {
                        setActiveTab(item.tab)
                        setIsMobileOpen(false)
                      }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                      {activeTab === item.tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-lg border border-primary/20"
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </Button>
                  ))}
                </div>
              ))}
            </nav>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter>
          
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 group relative overflow-hidden"
              onClick={() => {
                onLogout()
                setIsMobileOpen(false)
              }}
            >
              <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Logout
              <motion.div
                className="absolute inset-0 bg-primary/5 rounded-lg"
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Menu Button */}
      <motion.div 
        className="lg:hidden fixed top-4 left-4 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-primary/10"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <AnimatePresence mode="wait">
            {isMobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

import type React from "react"
type SidebarProps = {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
  username: string
}

const SidebarComponent: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigationItems = [
    {
      name: "Code Obfuscator",
      icon: Code,
      href: "#",
      onClick: () => setActiveTab("code-obfuscator"),
      active: activeTab === "code-obfuscator",
    },
  ]

  return (
    <>
    </>
  )
}

export default SidebarComponent

