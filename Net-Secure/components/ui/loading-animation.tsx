"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingAnimationProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary"
}

export function LoadingAnimation({ 
  className, 
  size = "md", 
  variant = "default" 
}: LoadingAnimationProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  const variantClasses = {
    default: "text-muted-foreground",
    primary: "text-primary",
    secondary: "text-secondary"
  }

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className={cn(
          "border-2 rounded-full",
          sizeClasses[size],
          variantClasses[variant]
        )}
        style={{
          borderTopColor: "currentColor",
          borderRightColor: "transparent",
          borderBottomColor: "currentColor",
          borderLeftColor: "transparent"
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className={cn(
          "absolute inset-0 border-2 rounded-full",
          sizeClasses[size],
          variantClasses[variant]
        )}
        style={{
          borderTopColor: "transparent",
          borderRightColor: "currentColor",
          borderBottomColor: "transparent",
          borderLeftColor: "currentColor",
          opacity: 0.3
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}