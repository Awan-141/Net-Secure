"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="outline"
        size="icon"
        className="relative w-10 h-10 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <AnimatePresence mode="wait">
          {theme === "dark" ? (
            <motion.div
              key="dark"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                duration: 0.3,
                ease: [0.23, 1, 0.32, 1]
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="h-5 w-5 text-primary" />
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="light"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ 
                duration: 0.3,
                ease: [0.23, 1, 0.32, 1]
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="h-5 w-5 text-primary" />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
                  "--primary-glow": "hsl(var(--primary) / 0.2)"
                } as any}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  )
}