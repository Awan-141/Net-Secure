"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { KeyRound, Copy, Check, RefreshCw, Shield, Zap, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedProgress } from "@/components/ui/animated-progress"

export function PasswordGenerator() {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState(16)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [entropy, setEntropy] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    generatePassword()
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols, excludeSimilar])

  const generatePassword = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      let charset = ""

      if (useLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
      if (useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      if (useNumbers) charset += "0123456789"
      if (useSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?/"

      if (excludeSimilar) {
        charset = charset.replace(/[il1Lo0O]/g, "")
      }

      if (charset === "") {
        setPassword("Select at least one character type")
        setEntropy(0)
        setIsGenerating(false)
        return
      }

      let result = ""
      const charsetLength = charset.length

      // Use Web Crypto API for secure random values
      const randomValues = new Uint32Array(length)
      window.crypto.getRandomValues(randomValues)

      for (let i = 0; i < length; i++) {
        result += charset.charAt(randomValues[i] % charsetLength)
      }

      setPassword(result)

      // Calculate entropy (bits)
      const entropyBits = Math.floor(length * Math.log2(charsetLength))
      setEntropy(entropyBits)
      setIsGenerating(false)
    }, 300)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getEntropyDescription = () => {
    if (entropy < 45) return "Weak"
    if (entropy < 60) return "Moderate"
    if (entropy < 80) return "Strong"
    if (entropy < 100) return "Very Strong"
    return "Extremely Strong"
  }

  const getEntropyColor = () => {
    if (entropy < 45) return "text-red-500"
    if (entropy < 60) return "text-orange-500"
    if (entropy < 80) return "text-yellow-500"
    if (entropy < 100) return "text-green-500"
    return "text-emerald-500"
  }

  const getEntropyProgressVariant = () => {
    if (entropy < 45) return "danger"
    if (entropy < 60) return "warning"
    if (entropy < 80) return "warning"
    if (entropy < 100) return "success"
    return "success"
  }

  return (
    <AnimatedCard className="bg-[#0f1e36] border-[#1a2942]" hoverEffect="glow" title={""}>
      <CardHeader>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="text-primary"
            >
              <KeyRound className="h-5 w-5" />
            </motion.div>
            Secure Password Generator
          </CardTitle>
          <CardDescription>Generate cryptographically secure random passwords with high entropy</CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2"
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              readOnly
              className="pr-20 font-mono text-sm bg-[#0a1629] border-[#1a2942] focus:ring-primary"
            />
            <div className="absolute right-1 top-1 flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-[#1a2942]" 
                onClick={() => setShowPassword(!showPassword)}
              >
                <AnimatePresence mode="wait">
                  {showPassword ? (
                    <motion.div
                      key="eye-off"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EyeOff className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="eye"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Eye className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="sr-only">Toggle password visibility</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-[#1a2942]" 
                onClick={generatePassword}
              >
                <motion.div
                  animate={isGenerating ? { rotate: 360 } : {}}
                  transition={{ duration: 0.5, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                <span className="sr-only">Generate new password</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-[#1a2942]" 
                onClick={copyToClipboard}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="sr-only">Copy password</span>
              </Button>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span>Entropy: {entropy} bits</span>
            <span className={getEntropyColor()}>{getEntropyDescription()}</span>
          </div>
          <AnimatedProgress 
            value={(entropy / 128) * 100} 
            variant={getEntropyProgressVariant()} 
            size="sm" 
            delay={1}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-2"
        >
          <div className="flex justify-between items-center">
            <Label htmlFor="password-length">Length: {length}</Label>
          </div>
          <Slider
            id="password-length"
            min={4}
            max={64}
            step={1}
            value={[length]}
            onValueChange={(value) => setLength(value[0])}
            className="bg-[#1a2942]"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>4</span>
            <span>64</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3"
        >
          {[
            { id: "uppercase", label: "Uppercase Letters (A-Z)", state: useUppercase, setState: setUseUppercase, icon: <Lock className="h-3.5 w-3.5 mr-1.5 text-primary" /> },
            { id: "lowercase", label: "Lowercase Letters (a-z)", state: useLowercase, setState: setUseLowercase, icon: <Lock className="h-3.5 w-3.5 mr-1.5 text-primary" /> },
            { id: "numbers", label: "Numbers (0-9)", state: useNumbers, setState: setUseNumbers, icon: <Zap className="h-3.5 w-3.5 mr-1.5 text-primary" /> },
            { id: "symbols", label: "Special Characters (!@#$%^&*)", state: useSymbols, setState: setUseSymbols, icon: <Shield className="h-3.5 w-3.5 mr-1.5 text-primary" /> },
            { id: "exclude-similar", label: "Exclude Similar Characters (i, l, 1, L, o, 0, O)", state: excludeSimilar, setState: setExcludeSimilar, icon: <Eye className="h-3.5 w-3.5 mr-1.5 text-primary" /> }
          ].map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between"
            >
              <Label htmlFor={item.id} className="cursor-pointer flex items-center">
                {item.icon}
                {item.label}
              </Label>
              <Switch 
                id={item.id} 
                checked={item.state} 
                onCheckedChange={item.setState}
                className="data-[state=checked]:bg-primary"
              />
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 border-t border-[#1a2942] pt-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="space-y-1 w-full"
        >
          <p>
            <strong>Security note:</strong> This tool uses the Web Crypto API to generate cryptographically secure
            random values.
          </p>
          <p>
            <strong>Privacy guarantee:</strong> All password generation happens locally in your browser. No data is
            transmitted.
          </p>
        </motion.div>
      </CardFooter>
    </AnimatedCard>
  )
}
