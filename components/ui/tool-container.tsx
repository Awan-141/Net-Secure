"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ToolContainerProps {
  children: ReactNode
  className?: string
  title: string
  description?: string
  icon?: ReactNode
}

export function ToolContainer({ children, className, title, description, icon }: ToolContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("space-y-6", className)}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center gap-3"
      >
        {icon && <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>}
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </motion.div>

      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl blur-lg opacity-50"></div>
        <div className="relative bg-card rounded-xl border shadow-sm overflow-hidden">{children}</div>
      </div>
    </motion.div>
  )
}

