"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface AnimatedTabsProps {
  value: string
  onValueChange: (value: string) => void
  tabItems?: Array<{
    value: string
    label: string
    icon?: React.ReactNode
  }>
  className?: string
}

export function AnimatedTabs({ value, onValueChange, tabItems, className, ...props }: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = useState(value || tabItems?.[0]?.value)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    // Update the indicator position when the active tab changes
    const activeIndex = tabItems?.findIndex((tab) => tab.value === activeTab) ?? -1
    if (activeIndex >= 0 && tabRefs.current[activeIndex]) {
      const tabElement = tabRefs.current[activeIndex]
      if (tabElement) {
        const { offsetLeft, offsetWidth } = tabElement
        setIndicatorStyle({ left: offsetLeft, width: offsetWidth })
      }
    }
  }, [activeTab, tabItems])

  const handleTabClick = (id: string) => {
    setActiveTab(id)
    onValueChange(id)
  }

  const getTabListStyles = () => {
    return "border-b"
  }

  const getTabStyles = (isActive: boolean) => {
    return cn(
      "px-4 py-2 text-sm font-medium transition-colors",
      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
    )
  }

  return (
    <div className={cn("w-full space-y-4", className)} {...props}>
      <div className={cn("relative flex", getTabListStyles(), "w-full")}>
        {tabItems?.map((tab, index) => (
          <button
            key={tab.value}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            onClick={() => handleTabClick(tab.value)}
            className={cn(getTabStyles(activeTab === tab.value), "flex-1 text-center")}
            role="tab"
            aria-selected={activeTab === tab.value}
          >
            {tab.label}
          </button>
        ))}
        <motion.div
          className="absolute bottom-0 h-0.5 bg-primary"
          initial={false}
          animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      <div className="relative overflow-hidden">{/* <AnimatedTabContent tabs={tabs} activeTab={activeTab} /> */}</div>
    </div>
  )
}

function AnimatedTabContent({
  tabs,
  activeTab,
}: {
  tabs: { id: string; label: React.ReactNode; content: React.ReactNode }[]
  activeTab: string
}) {
  return (
    <div className="relative">
      {tabs.map((tab) => (
        <motion.div
          key={tab.id}
          role="tabpanel"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: activeTab === tab.id ? 1 : 0,
            y: activeTab === tab.id ? 0 : 10,
            zIndex: activeTab === tab.id ? 1 : 0,
            position: activeTab === tab.id ? "relative" : "absolute",
          }}
          transition={{ duration: 0.3 }}
          className="w-full"
          aria-hidden={activeTab !== tab.id}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  )
}

