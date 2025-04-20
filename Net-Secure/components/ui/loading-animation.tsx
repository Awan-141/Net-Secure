"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "spinner" | "dots" | "pulse" | "skeleton" | "wave"
  size?: "sm" | "md" | "lg"
  color?: string
  text?: string
  fullscreen?: boolean
  transparent?: boolean
  message?: string
}

export function LoadingAnimation({
  variant = "spinner",
  size = "md",
  color = "hsl(var(--primary))",
  text,
  fullscreen = false,
  transparent = false,
  className,
  message = "Processing...",
  ...props
}: LoadingAnimationProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const renderLoadingIndicator = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "rounded-full",
                  size === "sm" ? "w-1 h-1" : size === "lg" ? "w-3 h-3" : "w-2 h-2"
                )}
                style={{ backgroundColor: color }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )

      case "pulse":
        return (
          <div className="relative">
            <motion.div
              className={cn("rounded-full", sizeClasses[size])}
              style={{ backgroundColor: color }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${color}` }}
              animate={{
                scale: [1, 1.4],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </div>
        )

      case "skeleton":
        return (
          <div
            className={cn(
              "relative overflow-hidden rounded-lg bg-secondary",
              size === "sm" ? "h-4 w-20" : size === "lg" ? "h-8 w-40" : "h-6 w-32"
            )}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full"
              animate={{
                translateX: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        )

      case "wave":
        return (
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "rounded-full",
                  size === "sm" ? "w-1 h-3" : size === "lg" ? "w-2 h-8" : "w-1.5 h-6"
                )}
                style={{ backgroundColor: color }}
                animate={{
                  scaleY: [1, 1.5, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        )

      default: // spinner
        return (
          <div className="relative">
            <motion.div
              className={cn("rounded-full border-2 border-r-transparent", sizeClasses[size])}
              style={{ borderColor: color }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: `${color}20` }}
              animate={{ rotate: -360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        )
    }
  }

  const content = (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {message && (
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  )

  if (fullscreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    )
  }

  return content
}