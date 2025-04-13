"use client"

import * as React from "react"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  gradient?: boolean
  hover?: boolean
  animation?: "tilt" | "lift" | "glow" | "none"
}

export function AnimatedCard({ 
  children, 
  className, 
  gradient = false,
  hover = true,
  animation = "tilt",
  ...props 
}: AnimatedCardProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(0, { stiffness: 300, damping: 30 })
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 })
  const scale = useSpring(1, { stiffness: 300, damping: 30 })

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect()
    const x = clientX - left
    const y = clientY - top
    
    mouseX.set(x)
    mouseY.set(y)

    if (animation === "tilt") {
      const rotateXValue = ((y - height / 2) / height) * -10
      const rotateYValue = ((x - width / 2) / width) * 10
      rotateX.set(rotateXValue)
      rotateY.set(rotateYValue)
    }
  }

  function onMouseEnter() {
    if (animation === "lift") {
      scale.set(1.02)
    }
  }

  function onMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
  }

  const background = useMotionTemplate`
    radial-gradient(
      650px circle at ${mouseX}px ${mouseY}px,
      var(--gradient-color, hsl(var(--primary) / 0.15)),
      transparent 80%
    )
  `

  return (
    <motion.div
      className={cn(
        "rounded-xl border bg-card p-6 transition-colors relative overflow-hidden",
        hover && "hover:border-primary/50",
        className
      )}
      style={{
        scale,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={hover ? onMouseMove : undefined}
      onMouseEnter={hover ? onMouseEnter : undefined}
      onMouseLeave={hover ? onMouseLeave : undefined}
      {...props}
    >
      {gradient && (
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
          style={{ background }}
        />
      )}
      {children}
    </motion.div>
  )
}

