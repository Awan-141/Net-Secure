"use client"

import * as React from "react"
import { motion, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import type { ButtonProps } from "./button"

interface AnimatedButtonProps extends ButtonProps {
  animateOnHover?: "bounce" | "shine" | "glow" | "pulse" | "none"
  glowColor?: string
  isLoading?: boolean
  loadingText?: string
  ripple?: boolean
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    animateOnHover = "bounce",
    glowColor = "hsl(var(--primary))",
    isLoading = false,
    loadingText = "Loading...",
    ripple = true,
    className,
    children,
    onClick,
    disabled,
    ...props
  }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false)
    const [rippleEffect, setRippleEffect] = React.useState<{ x: number; y: number; show: boolean }>({
      x: 0,
      y: 0,
      show: false,
    })
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const controls = useAnimation()

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return
      setIsPressed(true)

      if (ripple) {
        const button = buttonRef.current
        if (button) {
          const rect = button.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          setRippleEffect({ x, y, show: true })
          
          // Reset ripple after animation
          setTimeout(() => {
            setRippleEffect(prev => ({ ...prev, show: false }))
          }, 500)
        }
      }
    }

    const handleMouseUp = () => {
      if (disabled || isLoading) return
      setIsPressed(false)
    }

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return

      // Trigger click animation
      await controls.start({
        scale: [1, 0.95, 1],
        transition: { duration: 0.2 }
      })

      // Call original onClick handler
      onClick?.(e)
    }

    const getHoverAnimation = () => {
      switch (animateOnHover) {
        case "bounce":
          return {
            scale: 1.02,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 10
            }
          }
        case "shine":
          return {
            background: [
              "linear-gradient(90deg, transparent 0%, transparent 100%)",
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
              "linear-gradient(90deg, transparent 0%, transparent 100%)"
            ],
            transition: {
              duration: 1,
              repeat: Infinity
            }
          }
        case "glow":
          return {
            boxShadow: `0 0 20px ${glowColor}40`,
            transition: {
              duration: 0.2
            }
          }
        case "pulse":
          return {
            scale: [1, 1.02, 1],
            transition: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        default:
          return {}
      }
    }

    return (
      <motion.div
        animate={controls}
        className="relative inline-block"
        whileHover={!disabled && !isLoading ? getHoverAnimation() : {}}
      >
        <Button
          ref={buttonRef}
          className={cn(
            "relative overflow-hidden transition-all duration-200",
            isPressed && "transform scale-95",
            isLoading && "cursor-wait",
            className
          )}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          disabled={disabled || isLoading}
          {...props}
        >
          <motion.div
            className="relative z-10 flex items-center justify-center gap-2"
            animate={isLoading ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
            transition={isLoading ? { duration: 1, repeat: Infinity } : {}}
          >
            {isLoading ? (
              <>
                <motion.div
                  className="h-4 w-4 rounded-full border-2 border-current border-r-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>{loadingText}</span>
              </>
            ) : (
              children
            )}
          </motion.div>

          {/* Ripple effect */}
          {rippleEffect.show && (
            <motion.div
              className="absolute bg-white rounded-full pointer-events-none"
              initial={{
                width: 0,
                height: 0,
                opacity: 0.5,
                x: rippleEffect.x,
                y: rippleEffect.y,
              }}
              animate={{
                width: 500,
                height: 500,
                opacity: 0,
                x: rippleEffect.x - 250,
                y: rippleEffect.y - 250,
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
            />
          )}

          {/* Background shine effect for "shine" animation */}
          {animateOnHover === "shine" && !disabled && !isLoading && (
            <motion.div
              className="absolute inset-0 z-0"
              animate={{
                background: [
                  "linear-gradient(90deg, transparent 0%, transparent 100%)",
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                  "linear-gradient(90deg, transparent 0%, transparent 100%)"
                ],
                x: ["-100%", "100%", "100%"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3
              }}
            />
          )}
        </Button>

        {/* Glow effect */}
        {animateOnHover === "glow" && !disabled && !isLoading && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-lg blur-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.15, 0.25, 0.15], scale: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ backgroundColor: glowColor }}
          />
        )}
      </motion.div>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"