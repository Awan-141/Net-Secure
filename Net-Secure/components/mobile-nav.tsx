"use client"

import { Home, Shield, FileArchive, KeyRound, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  return (
    <div className="mobile-nav">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "flex flex-col items-center justify-center text-xs gap-1 h-auto py-2",
          activeTab === "dashboard" ? "text-primary" : "text-muted-foreground",
        )}
        onClick={() => setActiveTab("dashboard")}
      >
        <Home className="h-5 w-5" />
        <span>Home</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "flex flex-col items-center justify-center text-xs gap-1 h-auto py-2",
          activeTab === "site-inspector" ? "text-primary" : "text-muted-foreground",
        )}
        onClick={() => setActiveTab("site-inspector")}
      >
        <Shield className="h-5 w-5" />
        <span>Security</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "flex flex-col items-center justify-center text-xs gap-1 h-auto py-2",
          activeTab === "password-generator" || activeTab === "password-analyzer"
            ? "text-primary"
            : "text-muted-foreground",
        )}
        onClick={() => setActiveTab("password-generator")}
      >
        <KeyRound className="h-5 w-5" />
        <span>Password</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "flex flex-col items-center justify-center text-xs gap-1 h-auto py-2",
          activeTab === "encryption" || activeTab === "compressor" ? "text-primary" : "text-muted-foreground",
        )}
        onClick={() => setActiveTab("encryption")}
      >
        <FileArchive className="h-5 w-5" />
        <span>Files</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "flex flex-col items-center justify-center text-xs gap-1 h-auto py-2",
          activeTab === "entropy-analyzer" || activeTab === "binary-visualizer"
            ? "text-primary"
            : "text-muted-foreground",
        )}
        onClick={() => setActiveTab("entropy-analyzer")}
      >
        <BarChart className="h-5 w-5" />
        <span>Analysis</span>
      </Button>
    </div>
  )
}

