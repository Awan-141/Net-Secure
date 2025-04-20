"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  variant?: "default" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  delay?: number
  indeterminate?: boolean
}

export function AnimatedProgress({
  value,
  variant = "default",
  size = "md",
  showValue = false,
  delay = 0,
  indeterminate = false,
  className,
  ...props
}: AnimatedProgressProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-success"
      case "warning":
        return "bg-warning"
      case "danger":
        return "bg-destructive"
      default:
        return "bg-primary"
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-1"
      case "lg":
        return "h-4"
      default:
        return "h-2"
    }
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-secondary",
        getSizeClasses(),
        className
      )}
      {...props}
    >
      {indeterminate ? (
        <motion.div
          className={cn("absolute inset-y-0 rounded-full", getVariantClasses())}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
          style={{ width: "50%" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
      ) : (
        <motion.div
          className={cn("h-full rounded-full", getVariantClasses())}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut", delay }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {showValue && size !== "sm" && (
            <motion.span
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium",
                variant === "default" ? "text-primary-foreground" : "text-white"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {Math.round(value)}%
            </motion.span>
          )}
        </motion.div>
      )}
      
      {/* Pulse effect for emphasis */}
      {!indeterminate && value > 0 && (
        <motion.div
          className={cn(
            "absolute right-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full",
            getVariantClasses()
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay,
          }}
        />
      )}
      
      {/* Loading dots for indeterminate state */}
      {indeterminate && (
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn("h-1 w-1 rounded-full", getVariantClasses())}
              animate={{
                scale: [0.5, 1, 0.5],
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
      )}
    </div>
  )
}
