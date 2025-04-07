"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Lock,
  Zap,
  FileArchive,
  FileDigit,
  Shield,
  KeyRound,
  BarChart,
  AlertTriangle,
  Eye,
  Home,
  LogOut,
  ChevronRight,
  Code,
} from "lucide-react"

interface AppSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  username: string | null
  onLogout: () => void
}

export function MainAppSidebar({ activeTab, setActiveTab, username, onLogout }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-20 hidden w-64 bg-background border-r border-border lg:block">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SecureShield
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{username?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{username || "User"}</p>
              <p className="text-xs text-muted-foreground">Pro Account</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-6 custom-scrollbar">
          <div className="space-y-8">
            {/* Main Navigation */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mx-2">Main</h3>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-lg text-sm font-medium transition-all",
                  activeTab === "dashboard"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => setActiveTab("dashboard")}
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </div>

            {/* Security Tools */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mx-2">
                Security Tools
              </h3>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-lg text-sm font-medium transition-all",
                  activeTab === "site-inspector"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => setActiveTab("site-inspector")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Site Security Inspector
              </Button>

              
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-lg text-sm font-medium transition-all",
                  activeTab === "password-analyzer"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => setActiveTab("password-analyzer")}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Password Analyzer
              </Button>
              
              
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-lg text-sm font-medium transition-all",
                  activeTab === "password-generator"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => setActiveTab("password-generator")}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Password Generator
              </Button>
            </div>

            {/* File Tools */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase mx-2">File Tools</h3>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-lg text-sm font-medium transition-all",
                  activeTab === "encryption"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => setActiveTab("encryption")}
              >
                <Lock className="mr-2 h-4 w-4" />
                File Encryption
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-lg text-sm font-medium transition-all",
                  activeTab === "compressor"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => setActiveTab("compressor")}
              >
                <FileArchive className="mr-2 h-4 w-4" />
                File Compressor
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-lg text-sm font-medium transition-all",
                  activeTab === "hash-generator"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => setActiveTab("hash-generator")}
              >
                <FileDigit className="mr-2 h-4 w-4" />
                Hash Generator
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-lg text-sm font-medium transition-all",
                  activeTab === "estimator"
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-foreground hover:bg-muted",
                )}
                onClick={() => setActiveTab("estimator")}
              >
                <Zap className="mr-2 h-4 w-4" />
                Transfer Estimator
              </Button>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm font-medium text-muted-foreground hover:text-foreground group"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Logout
            <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </Button>
        </div>
      </div>
    </div>
  )
}


import type React from "react"
type SidebarProps = {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
  username: string
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
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
    <div className="w-64 bg-gray-100 h-screen p-4">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <ul>
        {navigationItems.map((item) => (
          <li key={item.name} className="mb-2">
            <a
              href={item.href}
              onClick={item.onClick}
              className={`flex items-center p-2 rounded-md hover:bg-gray-200 ${item.active ? "bg-gray-200" : ""}`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar

