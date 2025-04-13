"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  Shield,
  Check,
  X,
  Copy,
  RefreshCw,
  Lock,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AnimatedProgress } from "@/components/ui/animated-progress"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Password complexity requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: true,
  minUniqueChars: 8,
  avoidCommonPatterns: true,
}

// Common password patterns to avoid
const COMMON_PATTERNS = [
  { pattern: /(.)\1{2,}/, description: "Repeated characters (e.g., 'aaa')" },
  { pattern: /^[A-Za-z]+\d+$/, description: "Simple word + number pattern (e.g., 'password123')" },
  { pattern: /12345|qwerty|asdfg|zxcvb/i, description: "Keyboard patterns (e.g., 'qwerty')" },
  { pattern: /password|admin|welcome|login|user/i, description: "Common words" },
  { pattern: /19\d{2}|20\d{2}|[01]\d[0123]\d/, description: "Date patterns" },
  { pattern: /^[a-z]+$|^[A-Z]+$|^\d+$/, description: "Single character type" },
  {
    pattern: /0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210/,
    description: "Sequential numbers",
  },
  {
    pattern:
      /abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz|zyxw|yxwv|xwvu|wvut|vuts|utsr|tsrq|srqp|rqpo|qpon|ponm|onml|nmlk|mlkj|lkji|kjih|jihg|ihgf|hgfe|gfed|fedc|edcb|dcba/,
    description: "Sequential letters",
  },
]

// List of the most common passwords (abbreviated)
const COMMON_PASSWORDS = [
  "123456",
  "password",
  "12345678",
  "qwerty",
  "123456789",
  "12345",
  "1234",
  "111111",
  "1234567",
  "dragon",
  "123123",
  "baseball",
  "abc123",
  "football",
  "monkey",
  "letmein",
  "shadow",
  "master",
  "666666",
  "qwertyuiop",
  "123321",
  "mustang",
  "1234567890",
  "michael",
  "654321",
  "superman",
  "1qaz2wsx",
  "7777777",
  "welcome",
  "admin",
  "password1",
  "123",
  "iloveyou",
  "1234567",
  "1q2w3e4r",
  "sunshine",
  "princess",
  "qwertyuiop",
  "trustno1",
  "password123",
]

// Data breach API simulation
const SIMULATED_BREACHED_PASSWORDS = [
  "password123",
  "qwerty123",
  "admin123",
  "welcome123",
  "letmein123",
  "monkey123",
  "sunshine123",
  "princess123",
  "dragon123",
  "baseball123",
]

export function PasswordPatternAnalyzer() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [strengthColor, setStrengthColor] = useState("bg-gray-200")
  const [strengthLabel, setStrengthLabel] = useState("Enter a password")
  const [strengthScore, setStrengthScore] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState("")
  const [activeTab, setActiveTab] = useState("analysis")
  const [breachCheckResult, setBreachCheckResult] = useState<{ checked: boolean; breached: boolean; message: string }>({
    checked: false,
    breached: false,
    message: "",
  })

  // Update strength meter on password change
  useEffect(() => {
    if (!password) {
      setStrengthColor("bg-gray-200")
      setStrengthLabel("Enter a password")
      setStrengthScore(0)
      return
    }

    const quickScore = calculateQuickStrengthScore(password)
    setStrengthScore(quickScore.score)
    setStrengthColor(quickScore.color)
    setStrengthLabel(quickScore.label)
  }, [password])

  const analyzePassword = async () => {
    if (!password) {
      setError("Please enter a password to analyze")
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)
    setAnalysisProgress(0)
    setBreachCheckResult({ checked: false, breached: false, message: "" })

    try {
      // Simulate analysis steps with progress updates
      await simulateAnalysisStep("Analyzing character composition...", 15)
      const compositionAnalysis = analyzeComposition(password)

      await simulateAnalysisStep("Detecting patterns and vulnerabilities...", 30)
      const patternAnalysis = analyzePatterns(password)

      await simulateAnalysisStep("Checking against common passwords...", 45)
      const commonPasswordCheck = checkCommonPasswords(password)

      await simulateAnalysisStep("Calculating strength metrics...", 60)
      const strengthAnalysis = analyzeStrength(password)

      await simulateAnalysisStep("Estimating crack time...", 75)
      const crackTimeEstimate = estimateCrackTime(password, patternAnalysis, compositionAnalysis)

      await simulateAnalysisStep("Checking against data breaches...", 85)
      const breachCheck = await checkForDataBreaches(password)
      setBreachCheckResult(breachCheck)

      await simulateAnalysisStep("Generating recommendations...", 95)
      const suggestions = generateSuggestions(password, strengthAnalysis, patternAnalysis, compositionAnalysis)

      await simulateAnalysisStep("Creating secure alternative...", 100)
      const secureAlternative = generateSecureAlternative(password)
      setGeneratedPassword(secureAlternative)

      // Validate against complexity requirements
      const complexityValidation = validatePasswordComplexity(password)

      const results = {
        password,
        strengthAnalysis,
        compositionAnalysis,
        patternAnalysis,
        commonPasswordCheck,
        crackTimeEstimate,
        suggestions,
        secureAlternative,
        complexityValidation,
        breachCheck,
      }

      setResults(results)
    } catch (err) {
      console.error(err)
      setError("Failed to analyze password")
    } finally {
      setLoading(false)
    }
  }

  const simulateAnalysisStep = async (message: string, progress: number) => {
    setCurrentAnalysisStep(message)
    setAnalysisProgress(progress)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300))
  }

  const validatePasswordComplexity = (password: string) => {
    const requirements = [
      {
        name: "Minimum Length",
        description: `At least ${PASSWORD_REQUIREMENTS.minLength} characters`,
        met: password.length >= PASSWORD_REQUIREMENTS.minLength,
        importance: "high",
      },
      {
        name: "Uppercase Letters",
        description: "Contains uppercase letters (A-Z)",
        met: PASSWORD_REQUIREMENTS.requireUppercase ? /[A-Z]/.test(password) : true,
        importance: "medium",
      },
      {
        name: "Lowercase Letters",
        description: "Contains lowercase letters (a-z)",
        met: PASSWORD_REQUIREMENTS.requireLowercase ? /[a-z]/.test(password) : true,
        importance: "medium",
      },
      {
        name: "Numbers",
        description: "Contains numbers (0-9)",
        met: PASSWORD_REQUIREMENTS.requireNumbers ? /\d/.test(password) : true,
        importance: "medium",
      },
      {
        name: "Special Characters",
        description: "Contains special characters (!@#$%^&*)",
        met: PASSWORD_REQUIREMENTS.requireSpecial ? /[^A-Za-z0-9]/.test(password) : true,
        importance: "medium",
      },
      {
        name: "Unique Characters",
        description: `At least ${PASSWORD_REQUIREMENTS.minUniqueChars} unique characters`,
        met: new Set(password).size >= PASSWORD_REQUIREMENTS.minUniqueChars,
        importance: "low",
      },
    ]

    // Check for common patterns
    const patternViolations = []
    if (PASSWORD_REQUIREMENTS.avoidCommonPatterns) {
      for (const pattern of COMMON_PATTERNS) {
        if (pattern.pattern.test(password)) {
          patternViolations.push(pattern.description)
        }
      }
    }

    const allRequirementsMet = requirements.every((req) => req.met) && patternViolations.length === 0

    return {
      requirements,
      patternViolations,
      allRequirementsMet,
    }
  }

  const checkForDataBreaches = async (password: string) => {
    // In a real application, you would use a service like "Have I Been Pwned" API
    // Here we'll simulate a check against a list of known breached passwords
    await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API call

    const isBreached = SIMULATED_BREACHED_PASSWORDS.includes(password)

    return {
      checked: true,
      breached: isBreached,
      message: isBreached
        ? "This password has been found in known data breaches. It is strongly recommended to choose a different password."
        : "No matches found in our simulated breach database. In a real application, this would check against actual data breach records.",
    }
  }

  const calculateQuickStrengthScore = (password: string) => {
    // This is a simplified version of the full analysis for real-time feedback
    let score = 0

    // Length contribution (up to 40 points)
    score += Math.min(40, password.length * 3)

    // Character variety contribution (up to 60 points)
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)

    if (hasLower) score += 10
    if (hasUpper) score += 15
    if (hasDigit) score += 15
    if (hasSpecial) score += 20

    // Penalize for common patterns
    for (const pattern of COMMON_PATTERNS) {
      if (pattern.pattern.test(password)) {
        score -= 15
        break
      }
    }

    // Check for common passwords
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      score = Math.min(score, 10) // Cap at 10 if it's a common password
    }

    // Normalize to 0-100
    score = Math.max(0, Math.min(100, score))

    // Determine color and label based on score
    let color, label

    if (score >= 80) {
      color = "bg-green-500"
      label = "Strong"
    } else if (score >= 60) {
      color = "bg-blue-500"
      label = "Good"
    } else if (score >= 40) {
      color = "bg-yellow-500"
      label = "Fair"
    } else if (score >= 20) {
      color = "bg-orange-500"
      label = "Weak"
    } else {
      color = "bg-red-500"
      label = "Very Weak"
    }

    return { score, color, label }
  }

  const analyzeStrength = (password: string) => {
    // Calculate entropy and strength score
    const length = password.length

    // Character set size estimation
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)

    let charSetSize = 0
    if (hasLower) charSetSize += 26
    if (hasUpper) charSetSize += 26
    if (hasDigit) charSetSize += 10
    if (hasSpecial) charSetSize += 33 // Approximate for common special chars

    // Calculate entropy (bits)
    const entropy = Math.log2(Math.pow(Math.max(1, charSetSize), length))

    // Calculate strength score (0-100)
    let strengthScore = 0

    // Length contribution (up to 40 points)
    strengthScore += Math.min(40, length * 3)

    // Character variety contribution (up to 60 points)
    if (hasLower) strengthScore += 10
    if (hasUpper) strengthScore += 15
    if (hasDigit) strengthScore += 15
    if (hasSpecial) strengthScore += 20

    // Penalize for patterns
    for (const pattern of COMMON_PATTERNS) {
      if (pattern.pattern.test(password)) {
        strengthScore -= 15
        break
      }
    }

    // Check for common passwords
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      strengthScore = Math.min(strengthScore, 10) // Cap at 10 if it's a common password
    }

    // Normalize to 0-100
    strengthScore = Math.max(0, Math.min(100, strengthScore))

    // Determine strength category
    let strengthCategory
    if (strengthScore >= 80) strengthCategory = "Strong"
    else if (strengthScore >= 60) strengthCategory = "Good"
    else if (strengthScore >= 40) strengthCategory = "Fair"
    else if (strengthScore >= 20) strengthCategory = "Weak"
    else strengthCategory = "Very Weak"

    return {
      entropy: entropy.toFixed(2),
      score: strengthScore,
      category: strengthCategory,
      length,
      charSetSize,
    }
  }

  const analyzeComposition = (password: string) => {
    const composition = {
      lowercase: 0,
      uppercase: 0,
      digits: 0,
      special: 0,
      unique: new Set(password).size,
      distribution: {} as Record<string, number>,
    }

    // Count character types
    for (const char of password) {
      if (/[a-z]/.test(char)) composition.lowercase++
      else if (/[A-Z]/.test(char)) composition.uppercase++
      else if (/\d/.test(char)) composition.digits++
      else composition.special++

      // Track distribution
      composition.distribution[char] = (composition.distribution[char] || 0) + 1
    }

    // Calculate most frequent characters
    const mostFrequent = Object.entries(composition.distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      ...composition,
      mostFrequent,
      percentages: {
        lowercase: ((composition.lowercase / password.length) * 100).toFixed(1),
        uppercase: ((composition.uppercase / password.length) * 100).toFixed(1),
        digits: ((composition.digits / password.length) * 100).toFixed(1),
        special: ((composition.special / password.length) * 100).toFixed(1),
      },
    }
  }

  const analyzePatterns = (password: string) => {
    const patterns = {
      repeatedCharacters: false,
      keyboardPatterns: false,
      sequentialCharacters: false,
      commonWords: false,
      datePatterns: false,
      wordAndNumberCombo: false,
      l33tSpeak: false,
      detectedPatterns: [] as string[],
    }

    // Check for repeated characters (3+ same char)
    if (/(.)\1{2,}/.test(password)) {
      patterns.repeatedCharacters = true
      patterns.detectedPatterns.push("Repeated characters")
    }

    // Check for keyboard patterns
    const keyboardPatterns = ["qwert", "asdfg", "zxcvb", "yuiop", "hjkl", "bnm", "12345", "67890", "09876", "54321"]

    for (const pattern of keyboardPatterns) {
      if (password.toLowerCase().includes(pattern)) {
        patterns.keyboardPatterns = true
        patterns.detectedPatterns.push("Keyboard pattern")
        break
      }
    }

    // Check for sequential characters
    const checkSequential = (str: string) => {
      for (let i = 0; i < str.length - 2; i++) {
        const c1 = str.charCodeAt(i)
        const c2 = str.charCodeAt(i + 1)
        const c3 = str.charCodeAt(i + 2)

        if ((c1 + 1 === c2 && c2 + 1 === c3) || (c1 - 1 === c2 && c2 - 1 === c3)) {
          return true
        }
      }
      return false
    }

    if (checkSequential(password)) {
      patterns.sequentialCharacters = true
      patterns.detectedPatterns.push("Sequential characters")
    }

    // Check for common words
    const commonWords = ["password", "admin", "welcome", "login", "user", "hello", "secret"]
    for (const word of commonWords) {
      if (password.toLowerCase().includes(word)) {
        patterns.commonWords = true
        patterns.detectedPatterns.push(`Common word: "${word}"`)
        break
      }
    }

    // Check for date patterns
    if (/19\d{2}|20\d{2}|[01]\d[0123]\d/.test(password)) {
      patterns.datePatterns = true
      patterns.detectedPatterns.push("Date pattern")
    }

    // Check for word + number combination
    if (/^[A-Za-z]+\d+$/.test(password)) {
      patterns.wordAndNumberCombo = true
      patterns.detectedPatterns.push("Word + number combination")
    }

    // Check for l33t speak
    if (/[a@][s$][e3]|[p][a@][s$][s$]|[l][e3][e3][t]|[h][a@][x][x]|[a@]dm[i1]n/i.test(password)) {
      patterns.l33tSpeak = true
      patterns.detectedPatterns.push("L33t speak substitution")
    }

    return patterns
  }

  const checkCommonPasswords = (password: string) => {
    const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase())
    const similarPasswords = []

    // Check for similar passwords (simple check)
    if (!isCommon) {
      for (const commonPwd of COMMON_PASSWORDS) {
        // Check if the password is a common one with some characters changed
        if (commonPwd.length === password.length) {
          let differences = 0
          for (let i = 0; i < commonPwd.length; i++) {
            if (commonPwd[i].toLowerCase() !== password[i].toLowerCase()) {
              differences++
            }
          }

          // If less than 30% different, consider it similar
          if (differences / commonPwd.length < 0.3) {
            similarPasswords.push(commonPwd)
          }
        }
      }
    }

    return {
      isCommon,
      similarPasswords: similarPasswords.slice(0, 3), // Limit to 3 similar passwords
    }
  }

  const estimateCrackTime = (password: string, patternAnalysis: any, compositionAnalysis: any) => {
    // This is a simplified model for educational purposes
    // Real password cracking depends on many factors

    const length = password.length

    // Base guesses per second (modern computer)
    const baseGuessesPerSecond = 1_000_000_000 // 1 billion

    // Calculate character set size
    let charSetSize = 0
    if (compositionAnalysis.lowercase > 0) charSetSize += 26
    if (compositionAnalysis.uppercase > 0) charSetSize += 26
    if (compositionAnalysis.digits > 0) charSetSize += 10
    if (compositionAnalysis.special > 0) charSetSize += 33

    // Calculate theoretical max combinations
    let combinations = Math.pow(Math.max(1, charSetSize), length)

    // Adjust for patterns (simplified)
    if (patternAnalysis.repeatedCharacters) combinations /= 10
    if (patternAnalysis.keyboardPatterns) combinations /= 100
    if (patternAnalysis.sequentialCharacters) combinations /= 50
    if (patternAnalysis.commonWords) combinations /= 1000
    if (patternAnalysis.datePatterns) combinations /= 500
    if (patternAnalysis.wordAndNumberCombo) combinations /= 100

    // Check if it's a common password
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      combinations = 1 // Instant crack
    }

    // Calculate time in seconds
    const seconds = combinations / baseGuessesPerSecond

    // Convert to human-readable format
    let timeString
    let timeCategory

    if (seconds < 1) {
      timeString = "Instantly"
      timeCategory = "Instant"
    } else if (seconds < 60) {
      timeString = `${Math.round(seconds)} seconds`
      timeCategory = "Seconds"
    } else if (seconds < 3600) {
      timeString = `${Math.round(seconds / 60)} minutes`
      timeCategory = "Minutes"
    } else if (seconds < 86400) {
      timeString = `${Math.round(seconds / 3600)} hours`
      timeCategory = "Hours"
    } else if (seconds < 2592000) {
      timeString = `${Math.round(seconds / 86400)} days`
      timeCategory = "Days"
    } else if (seconds < 31536000) {
      timeString = `${Math.round(seconds / 2592000)} months`
      timeCategory = "Months"
    } else if (seconds < 315360000) {
      timeString = `${Math.round(seconds / 31536000)} years`
      timeCategory = "Years"
    } else if (seconds < 3153600000) {
      timeString = `${Math.round(seconds / 315360000)} decades`
      timeCategory = "Decades"
    } else {
      timeString = "Centuries or more"
      timeCategory = "Centuries+"
    }

    return {
      combinations,
      timeString,
      timeCategory,
      seconds,
    }
  }

  const generateSuggestions = (
    password: string,
    strengthAnalysis: any,
    patternAnalysis: any,
    compositionAnalysis: any,
  ) => {
    const suggestions = []

    // Suggest longer password if too short
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      suggestions.push(`Increase password length to at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
    }

    // Suggest adding character types
    if (PASSWORD_REQUIREMENTS.requireLowercase && compositionAnalysis.lowercase === 0) {
      suggestions.push("Add lowercase letters")
    }
    if (PASSWORD_REQUIREMENTS.requireUppercase && compositionAnalysis.uppercase === 0) {
      suggestions.push("Add uppercase letters")
    }
    if (PASSWORD_REQUIREMENTS.requireNumbers && compositionAnalysis.digits === 0) {
      suggestions.push("Add numbers")
    }
    if (PASSWORD_REQUIREMENTS.requireSpecial && compositionAnalysis.special === 0) {
      suggestions.push("Add special characters")
    }

    // Suggest avoiding patterns
    if (patternAnalysis.repeatedCharacters) {
      suggestions.push("Avoid repeated characters (e.g., 'aaa')")
    }
    if (patternAnalysis.keyboardPatterns) {
      suggestions.push("Avoid keyboard patterns (e.g., 'qwerty')")
    }
    if (patternAnalysis.sequentialCharacters) {
      suggestions.push("Avoid sequential characters (e.g., 'abc', '123')")
    }
    if (patternAnalysis.commonWords) {
      suggestions.push("Avoid common words")
    }
    if (patternAnalysis.datePatterns) {
      suggestions.push("Avoid using dates")
    }
    if (patternAnalysis.wordAndNumberCombo) {
      suggestions.push("Avoid simple word + number combinations")
    }

    // Suggest more unique characters if needed
    if (compositionAnalysis.unique < PASSWORD_REQUIREMENTS.minUniqueChars) {
      suggestions.push(`Use more unique characters (at least ${PASSWORD_REQUIREMENTS.minUniqueChars})`)
    }

    return suggestions
  }

  const generateSecureAlternative = (password: string) => {
    // Generate a secure password that meets all requirements

    // Start with a completely new password
    const length = Math.max(PASSWORD_REQUIREMENTS.minLength, 16)

    // Create character sets based on requirements
    const lowerChars = "abcdefghijklmnopqrstuvwxyz"
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const digitChars = "0123456789"
    const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?/"

    let allChars = ""
    if (PASSWORD_REQUIREMENTS.requireLowercase) allChars += lowerChars
    if (PASSWORD_REQUIREMENTS.requireUppercase) allChars += upperChars
    if (PASSWORD_REQUIREMENTS.requireNumbers) allChars += digitChars
    if (PASSWORD_REQUIREMENTS.requireSpecial) allChars += specialChars

    // Generate random password
    let securePassword = ""

    // Ensure we have at least one of each required character type
    if (PASSWORD_REQUIREMENTS.requireLowercase) {
      securePassword += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length))
    }
    if (PASSWORD_REQUIREMENTS.requireUppercase) {
      securePassword += upperChars.charAt(Math.floor(Math.random() * upperChars.length))
    }
    if (PASSWORD_REQUIREMENTS.requireNumbers) {
      securePassword += digitChars.charAt(Math.floor(Math.random() * digitChars.length))
    }
    if (PASSWORD_REQUIREMENTS.requireSpecial) {
      securePassword += specialChars.charAt(Math.floor(Math.random() * specialChars.length))
    }

    // Fill the rest with random characters
    while (securePassword.length < length) {
      securePassword += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }

    // Shuffle the password to avoid predictable patterns
    securePassword = securePassword
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("")

    return securePassword
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateNewPassword = () => {
    const newPassword = generateSecureAlternative("")
    setGeneratedPassword(newPassword)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
        >
          <Lock className="h-5 w-5 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold">Password Pattern Analyzer</h2>
          <p className="text-muted-foreground">Analyze passwords for strength, patterns, and vulnerabilities</p>
        </div>
      </motion.div>

      <AnimatedCard delay={1} title="Password Analysis">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password Analysis
          </CardTitle>
          <CardDescription>Enter a password to analyze its strength and security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password to analyze"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="eye"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Password Strength</span>
                <span>{strengthLabel}</span>
              </div>
              <AnimatedProgress value={strengthScore} className={strengthColor} delay={1} />
            </div>

            <Button
              onClick={analyzePassword}
              disabled={loading || !password}
              className="w-full relative overflow-hidden group"
            >
              {loading ? (
                <span className="flex items-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                    className="mr-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.span>
                  <span>{currentAnalysisStep}</span>
                </span>
              ) : (
                <span className="flex items-center">
                  <Search className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span>Analyze Password</span>
                </span>
              )}
            </Button>

            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <AnimatedProgress value={analysisProgress} variant="gradient" size="sm" />
              </motion.div>
            )}
          </div>
        </CardContent>
      </AnimatedCard>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Tabs defaultValue="analysis" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="security">Security Checks</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatedCard delay={1} hoverEffect="lift" title="Password Analysis">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Strength Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm font-medium">Overall Strength:</span>
                          <Badge
                            className={
                              results.strengthAnalysis.score >= 80
                                ? "bg-green-500"
                                : results.strengthAnalysis.score >= 60
                                  ? "bg-blue-500"
                                  : results.strengthAnalysis.score >= 40
                                    ? "bg-yellow-500"
                                    : results.strengthAnalysis.score >= 20
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                            }
                          >
                            {results.strengthAnalysis.category}
                          </Badge>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-2"
                        >
                          <div className="flex justify-between text-xs">
                            <span>Strength Score</span>
                            <span>{results.strengthAnalysis.score}/100</span>
                          </div>
                          <AnimatedProgress
                            value={results.strengthAnalysis.score}
                            className={
                              results.strengthAnalysis.score >= 80
                                ? "bg-green-500"
                                : results.strengthAnalysis.score >= 60
                                  ? "bg-blue-500"
                                  : results.strengthAnalysis.score >= 40
                                    ? "bg-yellow-500"
                                    : results.strengthAnalysis.score >= 20
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                            }
                            delay={1}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="grid grid-cols-2 gap-2 text-sm"
                        >
                          <span className="text-muted-foreground">Entropy:</span>
                          <span>{results.strengthAnalysis.entropy} bits</span>

                          <span className="text-muted-foreground">Length:</span>
                          <span>{results.strengthAnalysis.length} characters</span>

                          <span className="text-muted-foreground">Character Set Size:</span>
                          <span>{results.strengthAnalysis.charSetSize} possible characters</span>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="border rounded-md p-3 bg-secondary/20"
                        >
                          <div className="text-xs font-medium mb-1">Estimated Crack Time</div>
                          <div className="text-sm font-medium">{results.crackTimeEstimate.timeString}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Using a modern computer with {(1_000_000_000).toLocaleString()} guesses per second
                          </div>
                        </motion.div>

                        <AnimatePresence>
                          {results.commonPasswordCheck.isCommon && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: 0.6 }}
                            >
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Common Password Detected</AlertTitle>
                                <AlertDescription>
                                  This is one of the most commonly used passwords and would be cracked instantly.
                                </AlertDescription>
                              </Alert>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {results.commonPasswordCheck.similarPasswords.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: 0.7 }}
                            >
                              <Alert variant="default">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Similar to Common Password</AlertTitle>
                                <AlertDescription>
                                  This password is similar to common passwords like:{" "}
                                  {results.commonPasswordCheck.similarPasswords.join(", ")}
                                </AlertDescription>
                              </Alert>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </AnimatedCard>

                  <AnimatedCard delay={2} hoverEffect="lift" title="Password Composition">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Password Composition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="grid grid-cols-2 gap-2 text-sm"
                        >
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Lowercase Letters</div>
                            <div className="font-medium">
                              {results.compositionAnalysis.lowercase} (
                              {results.compositionAnalysis.percentages.lowercase}%)
                            </div>
                            <AnimatedProgress
                              value={Number(results.compositionAnalysis.percentages.lowercase)}
                              variant="default"
                              size="sm"
                              delay={1}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Uppercase Letters</div>
                            <div className="font-medium">
                              {results.compositionAnalysis.uppercase} (
                              {results.compositionAnalysis.percentages.uppercase}%)
                            </div>
                            <AnimatedProgress
                              value={Number(results.compositionAnalysis.percentages.uppercase)}
                              variant="success"
                              size="sm"
                              delay={1.2}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Numbers</div>
                            <div className="font-medium">
                              {results.compositionAnalysis.digits} ({results.compositionAnalysis.percentages.digits}%)
                            </div>
                            <AnimatedProgress
                              value={Number(results.compositionAnalysis.percentages.digits)}
                              variant="warning"
                              size="sm"
                              delay={1.4}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Special Characters</div>
                            <div className="font-medium">
                              {results.compositionAnalysis.special} ({results.compositionAnalysis.percentages.special}%)
                            </div>
                            <AnimatedProgress
                              value={Number(results.compositionAnalysis.percentages.special)}
                              variant="danger"
                              size="sm"
                              delay={1.6}
                            />
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-1"
                        >
                          <div className="text-xs text-muted-foreground">Unique Characters</div>
                          <div className="font-medium">
                            {results.compositionAnalysis.unique} of {results.strengthAnalysis.length} (
                            {((results.compositionAnalysis.unique / results.strengthAnalysis.length) * 100).toFixed(1)}
                            %)
                          </div>
                          <AnimatedProgress
                            value={(results.compositionAnalysis.unique / results.strengthAnalysis.length) * 100}
                            variant="gradient"
                            size="sm"
                            delay={1.8}
                          />
                        </motion.div>

                        {results.compositionAnalysis.mostFrequent.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-1"
                          >
                            <div className="text-xs text-muted-foreground">Most Frequent Characters</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {results.compositionAnalysis.mostFrequent.map(
                                ([char, count]: [string, number], i: number) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                  >
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {char === " " ? "␣" : char} ({count})
                                    </Badge>
                                  </motion.div>
                                ),
                              )}
                            </div>
                          </motion.div>
                        )}

                        {results.patternAnalysis.detectedPatterns.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="border-t pt-3 mt-3"
                          >
                            <div className="text-xs font-medium mb-2">Detected Patterns</div>
                            <div className="space-y-2">
                              {results.patternAnalysis.detectedPatterns.map((pattern: string, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.6 + i * 0.1 }}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                  <span>{pattern}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </AnimatedCard>
                </div>

                <AnimatedCard delay={3} hoverEffect="glow" title="Improvement Suggestions">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.suggestions.length > 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-2"
                        >
                          {results.suggestions.map((suggestion: string, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Check className="h-4 w-4 text-green-500 shrink-0" />
                              <span>{suggestion}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Alert className="bg-green-50 border-green-200">
                            <Check className="h-4 w-4 text-green-500" />
                            <AlertTitle>Good Password</AlertTitle>
                            <AlertDescription>
                              Your password meets all the recommended security criteria.
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="border-t pt-4 mt-2"
                      >
                        <div className="text-sm font-medium mb-3">Suggested Secure Alternative</div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border rounded-md p-3">
                          <div className="font-mono break-all">{generatedPassword || results.secureAlternative}</div>
                          <div className="flex gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button variant="outline" size="sm" className="h-8" onClick={generateNewPassword}>
                                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                New
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => copyToClipboard(generatedPassword || results.secureAlternative)}
                              >
                                {copied ? (
                                  <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5 mr-1" />
                                )}
                                {copied ? "Copied!" : "Copy"}
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </AnimatedCard>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-4">
                <AnimatedCard delay={1} hoverEffect="lift" title="Default Title">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Password Requirements
                    </CardTitle>
                    <CardDescription>Check if your password meets the security requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {results.complexityValidation.requirements.map((req: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              {req.met ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <div>
                                <div className="font-medium">{req.name}</div>
                                <div className="text-xs text-muted-foreground">{req.description}</div>
                              </div>
                            </div>
                            <Badge
                              variant={req.met ? "outline" : "destructive"}
                              className={req.met ? "border-green-500 text-green-500" : ""}
                            >
                              {req.met ? "Pass" : "Fail"}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>

                      {results.complexityValidation.patternViolations.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mt-4 pt-4 border-t"
                        >
                          <div className="text-sm font-medium mb-2">Pattern Violations</div>
                          <div className="space-y-2">
                            {results.complexityValidation.patternViolations.map((violation: string, i: number) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                className="flex items-center gap-2 text-sm"
                              >
                                <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                                <span>{violation}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-4"
                      >
                        <Alert variant={results.complexityValidation.allRequirementsMet ? "default" : "destructive"}>
                          {results.complexityValidation.allRequirementsMet ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <AlertTitle>All Requirements Met</AlertTitle>
                              <AlertDescription>Your password meets all the security requirements.</AlertDescription>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Requirements Not Met</AlertTitle>
                              <AlertDescription>
                                Your password does not meet all the security requirements. Please address the issues
                                highlighted above.
                              </AlertDescription>
                            </>
                          )}
                        </Alert>
                      </motion.div>
                    </div>
                  </CardContent>
                </AnimatedCard>

                <AnimatedCard delay={2} hoverEffect="lift" title="Default Title">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Password Security Best Practices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-primary" />
                              <span>Length and Complexity</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>Use at least 12 characters, preferably 16 or more for sensitive accounts</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>
                                  Include a mix of uppercase and lowercase letters, numbers, and special characters
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>
                                  Avoid using predictable patterns like keyboard sequences (qwerty) or number sequences
                                  (12345)
                                </span>
                              </li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                          <AccordionTrigger>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-primary" />
                              <span>Common Mistakes to Avoid</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <span>Using personal information (names, birthdays, pet names)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <span>Using common words with simple substitutions (p@ssw0rd)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <span>Reusing passwords across multiple accounts</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <span>Using words followed by numbers (password123)</span>
                              </li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                          <AccordionTrigger>
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <span>Creating Memorable Strong Passwords</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>
                                  Use a passphrase: combine multiple random words with special characters and numbers
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>Create an acronym from a memorable sentence and add special characters</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>Consider using a password manager to generate and store complex passwords</span>
                              </li>
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>
                </AnimatedCard>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <AnimatedCard delay={1} hoverEffect="lift" title="Default Title">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Data Breach Check
                    </CardTitle>
                    <CardDescription>Check if your password has appeared in known data breaches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.breachCheck.checked ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {results.breachCheck.breached ? (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Password Found in Data Breach</AlertTitle>
                              <AlertDescription>{results.breachCheck.message}</AlertDescription>
                            </Alert>
                          ) : (
                            <Alert variant="default">
                              <CheckCircle className="h-4 w-4" />
                              <AlertTitle>Password Not Found in Data Breaches</AlertTitle>
                              <AlertDescription>{results.breachCheck.message}</AlertDescription>
                            </Alert>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Data Breach Check</AlertTitle>
                            <AlertDescription>
                              Analyze your password to check if it has appeared in known data breaches.
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-4"
                      >
                        <div className="text-sm">
                          <p className="mb-2">
                            <strong>Why this matters:</strong> Passwords that have appeared in data breaches are at high
                            risk because:
                          </p>
                          <ul className="space-y-1 list-disc pl-5">
                            <li>They are often added to "password dictionaries" used by hackers</li>
                            <li>They may be used in credential stuffing attacks on your other accounts</li>
                            <li>They are more likely to be guessed in brute force attacks</li>
                          </ul>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </AnimatedCard>

                <AnimatedCard delay={2} hoverEffect="lift" title="Additional Security Recommendations">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Additional Security Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium">Use a password manager</div>
                              <div className="text-sm text-muted-foreground">
                                Password managers can generate, store, and autofill strong unique passwords for all your
                                accounts.
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium">Enable two-factor authentication (2FA)</div>
                              <div className="text-sm text-muted-foreground">
                                2FA adds an extra layer of security by requiring a second form of verification beyond
                                your password.
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium">Use unique passwords for each account</div>
                              <div className="text-sm text-muted-foreground">
                                If one account is compromised, using unique passwords prevents attackers from accessing
                                your other accounts.
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium">Regularly update critical passwords</div>
                              <div className="text-sm text-muted-foreground">
                                Change passwords for important accounts (banking, email) every 3-6 months.
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </AnimatedCard>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

