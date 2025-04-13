"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  indicatorClassName?: string
  showValue?: boolean
  variant?: "default" | "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
  animate?: boolean
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  indicatorClassName,
  showValue = false,
  variant = "default",
  size = "md",
  animate = true,
}: AnimatedProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const variants = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500"
  }

  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  }

  const shimmer = {
    hidden: { x: "-100%" },
    visible: { 
      x: "100%",
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear"
      }
    }
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-primary/10",
          sizes[size],
          className
        )}
      >
        <motion.div
          className={cn(
            "h-full w-full flex items-center rounded-full",
            variants[variant],
            indicatorClassName
          )}
          style={{
            transformOrigin: "0%",
          }}
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="relative w-full h-full overflow-hidden">
            <motion.div
              className="absolute inset-0 w-full h-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
              variants={shimmer}
              initial="hidden"
              animate="visible"
            />
          </div>
        </motion.div>
      </div>
      {showValue && (
        <motion.span
          className="absolute right-0 -top-6 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  )
}
