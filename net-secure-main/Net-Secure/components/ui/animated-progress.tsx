"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: "default" | "success" | "warning" | "danger" | "gradient"
  showValue?: boolean
  size?: "sm" | "md" | "lg"
  animated?: boolean
  delay?: number
}

export function AnimatedProgress({
  value,
  max = 100,
  variant = "default",
  showValue = false,
  size = "md",
  animated = true,
  delay = 0,
  className,
  ...props
}: AnimatedProgressProps) {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setCurrentValue(value)
      }, delay * 100)
      return () => clearTimeout(timer)
    } else {
      setCurrentValue(value)
    }
  }, [value, animated, delay])

  const percentage = (currentValue / max) * 100

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "danger":
        return "bg-red-500"
      case "gradient":
        return "bg-gradient-to-r from-blue-500 via-purple-500 to-primary"
      default:
        return "bg-primary"
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "h-1.5"
      case "lg":
        return "h-4 rounded-md"
      default:
        return "h-2.5 rounded-sm"
    }
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-secondary", getSizeStyles(), className)} {...props}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: animated ? 1 : 0, ease: "easeOut", delay: delay * 0.1 }}
        className={cn("h-full", getVariantStyles())}
      >
        {showValue && size === "lg" && (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs font-medium text-white">{Math.round(percentage)}%</span>
          </div>
        )}
      </motion.div>
      {showValue && size !== "lg" && (
        <div className="mt-1 text-right text-xs text-muted-foreground">{Math.round(percentage)}%</div>
      )}
    </div>
  )
}
