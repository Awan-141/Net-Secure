"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedTabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  defaultTab?: string
  onTabChange?: (value: string) => void
  variant?: "default" | "pills" | "underline"
  orientation?: "horizontal" | "vertical"
  animated?: boolean
  children: React.ReactElement<{ id: string; children: React.ReactNode }>[]
}

export function AnimatedTabs({
  defaultTab,
  onTabChange,
  variant = "default",
  orientation = "horizontal",
  animated = true,
  className,
  children,
  ...props
}: AnimatedTabsProps) {
  const [activeTab, setActiveTab] = React.useState<string>(
    defaultTab || ((children[0] as React.ReactElement<{ id: string }>)?.props.id) || ""
  )

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const getVariantClasses = (isActive: boolean) => {
    switch (variant) {
      case "pills":
        return cn(
          "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      case "underline":
        return cn(
          "pb-2 text-sm font-medium transition-all duration-200 border-b-2",
          isActive
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )
      default:
        return cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-secondary text-secondary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
    }
  }

  const tabContainerVariants = {
    hidden: {
      opacity: 0,
      x: orientation === "horizontal" ? 20 : 0,
      y: orientation === "vertical" ? 20 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
    exit: {
      opacity: 0,
      x: orientation === "horizontal" ? -20 : 0,
      y: orientation === "vertical" ? -20 : 0,
    },
  }

  return (
    <div
      className={cn(
        "w-full",
        orientation === "vertical" && "flex gap-6",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex gap-2",
          orientation === "vertical" ? "flex-col" : "flex-row",
          variant === "underline" && orientation === "horizontal" && "border-b"
        )}
      >
        {children.map((child) => {
          const isActive = activeTab === (child.props as { id: string }).id
          return (
            <div key={child.props.id} className="relative">
              <motion.button
                onClick={() => handleTabChange(child.props.id)}
                className={getVariantClasses(isActive)}
                whileTap={{ scale: 0.97 }}
                whileHover={
                  variant === "pills"
                    ? { scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }
                    : {}
                }
              >
                {child.props.children.find(
                  (c: React.ReactElement) => c.props.className === "tab-label"
                )}
              </motion.button>

              {/* Active tab indicator */}
              {variant !== "underline" && isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={cn(
                    "absolute bottom-0 h-0.5 bg-primary",
                    orientation === "vertical"
                      ? "left-0 w-0.5 h-full"
                      : "left-0 right-0"
                  )}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Glow effect for active tab */}
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 rounded-lg bg-primary/5 -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {children.map((child) =>
            child.props.id === activeTab ? (
              <motion.div
                key={child.props.id}
                variants={animated ? tabContainerVariants : {}}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative"
              >
                {/* Tab content background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-lg -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Tab content */}
                <div className="space-y-4">
                  {React.Children.toArray(child.props.children).find(
                    (c) =>
                      React.isValidElement(c) &&
                      !c.props.className?.includes("tab-label")
                  )}
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

