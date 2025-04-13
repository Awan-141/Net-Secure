"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import type { ButtonProps } from "./button"

interface AnimatedButtonProps extends ButtonProps {
  glowColor?: string
  pulseOnHover?: boolean
  ripple?: boolean
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, glowColor, pulseOnHover, ripple, children, ...props }, ref) => {
    const [rippleEffect, setRippleEffect] = React.useState<{ x: number; y: number; show: boolean }>({
      x: 0,
      y: 0,
      show: false,
    })

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setRippleEffect({ x, y, show: true })
      setTimeout(() => setRippleEffect(prev => ({ ...prev, show: false })), 500)
    }

    return (
      <motion.div
        className="relative inline-block"
        whileHover={pulseOnHover ? { scale: 1.02 } : undefined}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          ref={ref}
          className={cn(
            "relative overflow-hidden transition-all duration-200",
            glowColor && "hover:shadow-lg",
            className
          )}
          style={{
            ...(glowColor ? {
              "--glow-color": glowColor,
              boxShadow: "0 0 0 0 var(--glow-color)",
            } : {}),
          }}
          onMouseDown={handleMouseDown}
          {...props}
        >
          {ripple && rippleEffect.show && (
            <motion.span
              className="absolute rounded-full bg-white/30 pointer-events-none"
              initial={{
                width: 0,
                height: 0,
                x: rippleEffect.x,
                y: rippleEffect.y,
                opacity: 0.5,
              }}
              animate={{
                width: 500,
                height: 500,
                x: rippleEffect.x - 250,
                y: rippleEffect.y - 250,
                opacity: 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
            />
          )}
          {children}
          {glowColor && (
            <motion.div
              className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100"
              style={{
                background: `radial-gradient(circle at center, ${glowColor}20 0%, transparent 70%)`,
              }}
              animate={pulseOnHover ? {
                scale: [1, 1.05, 1],
                opacity: [0, 0.5, 0],
              } : undefined}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
        </Button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"