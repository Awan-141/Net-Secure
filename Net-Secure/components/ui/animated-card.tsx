"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  delay?: number
  title?: string
  hoverEffect?: "lift" | "glow" | "border" | "none"
  animate?: boolean
  children: React.ReactNode
}

export function AnimatedCard({
  delay = 0,
  title,
  hoverEffect = "lift",
  animate = true,
  className,
  children,
  ...props
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const hoverStyles = {
    lift: {
      initial: { y: 0, boxShadow: "0 0 0 rgba(0, 0, 0, 0)" },
      hover: { 
        y: -4,
        boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.2)",
        borderColor: "hsl(var(--primary) / 0.5)"
      }
    },
    glow: {
      initial: { 
        boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
        background: "hsl(var(--card))"
      },
      hover: {
        boxShadow: [
          "0 0 20px -5px hsl(var(--primary) / 0.2)",
          "0 0 30px -10px hsl(var(--primary) / 0.3)",
          "0 0 40px -15px hsl(var(--primary) / 0.1)"
        ],
        background: "linear-gradient(130deg, hsl(var(--card)), hsl(var(--card)) 60%, hsl(var(--primary) / 0.1))"
      }
    },
    border: {
      initial: { 
        boxShadow: "0 0 0 1px hsl(var(--border))",
        background: "hsl(var(--card))"
      },
      hover: {
        boxShadow: "0 0 0 2px hsl(var(--primary) / 0.5)",
        background: "linear-gradient(130deg, hsl(var(--card)), hsl(var(--card)) 60%, hsl(var(--primary) / 0.05))"
      }
    },
    none: {
      initial: {},
      hover: {}
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.3,
        delay,
        ease: "easeOut"
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <motion.div
        className={cn(
          "relative rounded-lg border bg-card overflow-hidden",
          className
        )}
        initial={hoverStyles[hoverEffect].initial}
        animate={isHovered ? hoverStyles[hoverEffect].hover : hoverStyles[hoverEffect].initial}
        transition={{
          duration: 0.2,
          ease: "easeInOut"
        }}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
      >
        {/* Background gradient effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Shine effect */}
        {hoverEffect !== "none" && (
          <motion.div
            className="absolute inset-0 opacity-0"
            initial={{ opacity: 0 }}
            animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -skew-x-12 translate-x-[-100%] animate-[shine_2s_ease-in-out_infinite]" />
          </motion.div>
        )}

        {/* Card content with subtle lift effect */}
        <motion.div
          className="relative"
          animate={isHovered ? { y: -2 } : { y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.div>

      {/* Bottom reflection/shadow effect */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-primary/5 to-transparent opacity-0 blur-xl"
        initial={{ opacity: 0, y: 0 }}
        animate={isHovered ? { opacity: 0.5, y: 4 } : { opacity: 0, y: 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}

