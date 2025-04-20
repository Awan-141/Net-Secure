"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Maximize2, Minimize2, type Icon as LucideIcon, type LucideProps } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { KeyboardShortcut } from "./tooltip"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip"

interface PrimaryAction {
  label: string
  icon?: React.ComponentType<LucideProps>
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  tooltip?: string
  shortcut?: string[]
}

interface ToolContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string
  description?: string
  icon?: React.ComponentType<LucideProps>
  rightSidebar?: React.ReactNode
  primaryAction?: PrimaryAction
  secondaryAction?: {
    label: string
    icon: React.ComponentType<LucideProps>
    onClick: () => void
    disabled?: boolean
  }
}

export function ToolContainer({
  children,
  className,
  title,
  description,
  icon: Icon,
  rightSidebar,
  primaryAction,
  secondaryAction,
  ...props
}: ToolContainerProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  return (
    <div
      className={cn(
        "tool-container",
        isFullscreen && "fixed inset-0 z-50",
        className
      )}
      {...props}
      role="main"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="space-y-1">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-primary">
              {title}
            </h2>
          </motion.div>
          {description && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-base"
              id={`${title}-description`}
            >
              {description}
            </motion.p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          </span>
        </Button>
      </div>

      {/* Main content with optional right sidebar */}
      <div className="flex-1 flex gap-6 p-6 pt-0 overflow-hidden">
        {/* Main content area */}
        <motion.div 
          className="flex-1 min-w-0"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative h-full">
            {/* Tool content */}
            <div className="space-y-4 h-full flex flex-col">
              <main aria-labelledby={description ? `${title}-description` : undefined}>
                {children}
              </main>

              {/* Action buttons at the bottom */}
              {(primaryAction || secondaryAction) && (
                <div className="flex items-center justify-center gap-4 mt-auto pt-4">
                  {secondaryAction && secondaryAction.icon && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={secondaryAction.onClick}
                      disabled={secondaryAction.disabled}
                      className="h-11 px-8 text-base"
                    >
                      {React.createElement(secondaryAction.icon, {
                        className: "mr-2 h-5 w-5",
                        "aria-hidden": true
                      })}
                      {secondaryAction.label}
                    </Button>
                  )}
                  {primaryAction && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="lg"
                          onClick={primaryAction.onClick}
                          disabled={primaryAction.disabled || primaryAction.loading}
                          className={cn(
                            "h-11 px-8 text-base bg-[#649eff] hover:bg-[#649eff]/90",
                            "hover:shadow-lg hover:shadow-primary/20 transition-all duration-300",
                            "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
                            "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
                            "overflow-hidden relative"
                          )}
                          aria-label={primaryAction.label}
                        >
                          {primaryAction.icon && React.createElement(primaryAction.icon, {
                            className: cn(
                              "mr-2 h-5 w-5",
                              primaryAction.loading && "animate-spin"
                            ),
                            "aria-hidden": true
                          })}
                          {primaryAction.loading ? "Processing..." : primaryAction.label}
                          {primaryAction.loading && (
                            <span className="sr-only">Processing...</span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" align="center">
                        <div className="space-y-1">
                          {primaryAction.tooltip}
                          {primaryAction.shortcut && (
                            <div aria-label="Keyboard shortcut">
                              <KeyboardShortcut combo={primaryAction.shortcut} />
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right sidebar */}
        {rightSidebar && (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "320px" }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l"
              aria-label="Configuration options"
            >
              <div className="w-80 p-6">
                {rightSidebar}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

