"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Lock,
  Zap,
  FileArchive,
  FileDigit,
  Shield,
  KeyRound,
  Home,
  Network,
  Code,
  Settings,
} from "lucide-react"

interface MobileNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const navItems = [
  {
    icon: Home,
    label: "Home",
    tab: "dashboard",
  },
  {
    icon: Shield,
    label: "Security",
    tab: "site-inspector",
  },
  {
    icon: Network,
    label: "Network",
    tab: "network-test",
  },
  {
    icon: Code,
    label: "Code",
    tab: "code-obfuscator",
  },
  {
    icon: Settings,
    label: "Tools",
    tab: "tools",
  },
]

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      {/* Backdrop blur and gradient */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-lg" />
      
      {/* Top border gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative grid grid-cols-5 gap-1 p-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab
          const Icon = item.icon

          return (
            <Button
              key={item.tab}
              variant="ghost"
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 h-16 rounded-lg hover:bg-primary/10",
                isActive && "bg-primary/10 text-primary"
              )}
              onClick={() => setActiveTab(item.tab)}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -inset-1 rounded-full bg-primary/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              
              <span className="text-xs font-medium">{item.label}</span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -top-0.5 h-1 w-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Button press effect */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute inset-0 rounded-lg bg-primary/5"
                  />
                )}
              </AnimatePresence>
            </Button>
          )
        })}
      </div>

      {/* Bottom safe area for iOS */}
      <div className="h-safe-area bg-background/80 backdrop-blur-lg" />
    </motion.nav>
  )
}

