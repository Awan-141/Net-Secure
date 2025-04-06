"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface AnimatedCardProps {
  children: React.ReactNode
  delay?: number
  title: string
  description?: string
  icon?: React.ReactNode
  className?: string
  hoverEffect?: "lift" | "glow" | "border"
  clickEffect?: boolean
}

export function AnimatedCard({
  children,
  className,
  hoverEffect = "lift",
  clickEffect = true,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  const getHoverStyles = () => {
    switch (hoverEffect) {
      case "lift":
        return {
          y: isHovered ? -8 : 0,
          boxShadow: isHovered
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }
      case "glow":
        return {
          boxShadow: isHovered
            ? "0 0 15px 2px rgba(var(--primary), 0.3)"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }
      case "border":
        return {
          boxShadow: isHovered
            ? "0 0 0 2px rgba(var(--primary), 0.5)"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }
      default:
        return {}
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={getHoverStyles()}
      whileTap={clickEffect ? { scale: 0.98 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsClicked(true)}
      onTap={() => setTimeout(() => setIsClicked(false), 150)}
      onTapCancel={() => setIsClicked(false)}
      className={cn(
        "relative rounded-xl border bg-card text-card-foreground shadow transition-all duration-300",
        className,
      )}
      {...props}
    >
      {children}
      {hoverEffect === "glow" && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 -z-10 rounded-xl bg-primary/10 blur-xl"
            />
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}

