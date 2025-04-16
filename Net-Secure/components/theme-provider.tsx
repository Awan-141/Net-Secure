"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Ensure theme change doesn't happen during SSR
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NextThemesProvider {...props}>
      <AnimatePresence mode="wait">
        {mounted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="transition-colors duration-300"
          >
            {children}
          </motion.div>
        ) : (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </NextThemesProvider>
  )
}
