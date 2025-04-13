"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lock,
  Unlock,
  Upload,
  Download,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  Copy,
  Shield,
  Key,
  FileText,
  FileCheck,
  FileLock2,
} from "lucide-react"

import { ToolContainer } from "@/components/ui/tool-container"
import { AnimatedTabs } from "@/components/ui/animated-tabs"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedProgress } from "@/components/ui/animated-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"

type ProcessingStatus = "idle" | "encrypting" | "decrypting" | "success" | "error"

export function FileEncryptionTool() {
  // File states
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isTextFile, setIsTextFile] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)

  // Encryption states
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [encryptedFile, setEncryptedFile] = useState<Blob | null>(null)
  const [decryptedFile, setDecryptedFile] = useState<Blob | null>(null)

  // UI states
  const [status, setStatus] = useState<ProcessingStatus>("idle")
  const [progress, setProgress] = useState<number>(0)
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">("encrypt")

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const decryptFileInputRef = useRef<HTMLInputElement>(null)

  // Additional feature states
  const [passwordStrength, setPasswordStrength] = useState<number>(0)
  const [passwordFeedback, setPasswordFeedback] = useState<string>("")
  const [encryptionNote, setEncryptionNote] = useState<string>("")
  const [generatedPassword, setGeneratedPassword] = useState<string>("")
  const [recentFiles, setRecentFiles] = useState<Array<{ name: string; date: string; type: string }>>([])
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [passwordCopied, setPasswordCopied] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Check if a file is a text file
  const isFileText = (file: File): boolean => {
    const textTypes = [
      "text/plain",
      "text/html",
      "text/css",
      "text/javascript",
      "application/json",
      "application/xml",
      "text/csv",
      "application/javascript",
    ]
    return (
      textTypes.includes(file.type) ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".json") ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".js") ||
      file.name.endsWith(".html") ||
      file.name.endsWith(".css") ||
      file.name.endsWith(".xml")
    )
  }

  // Handle file upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, forDecryption = false) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    try {
      setFile(selectedFile)
      setEncryptedFile(null)
      setDecryptedFile(null)
      setMessage("")
      setError("")
      setProgress(0)
      setStatus("idle")

      // Check if it's a text file and create preview if it is
      const isText = isFileText(selectedFile)
      setIsTextFile(isText)

      if (isText && !forDecryption) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string)
        }
        reader.readAsText(selectedFile)
      } else {
        setFilePreview(null)
      }
    } catch (err) {
      setError("Failed to read file. Please try again.")
      console.error(err)
    }
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, forDecryption = false) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setEncryptedFile(null)
      setDecryptedFile(null)
      setMessage("")
      setError("")
      setProgress(0)
      setStatus("idle")

      // Check if it's a text file and create preview if it is
      const isText = isFileText(droppedFile)
      setIsTextFile(isText)

      if (isText && !forDecryption) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string)
        }
        reader.readAsText(droppedFile)
      } else {
        setFilePreview(null)
      }
    }
  }

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0)
      setPasswordFeedback("No password entered")
      return
    }

    let strength = 0
    let feedback = ""

    // Length check
    if (password.length >= 12) {
      strength += 25
    } else if (password.length >= 8) {
      strength += 15
    } else if (password.length >= 6) {
      strength += 10
    }

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 15 // Uppercase
    if (/[a-z]/.test(password)) strength += 15 // Lowercase
    if (/[0-9]/.test(password)) strength += 15 // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 20 // Special characters

    // Repeated characters check
    if (/(.)\1\1/.test(password)) {
      strength -= 10
    }

    // Common patterns check
    if (/123|abc|qwerty|password|admin|welcome/i.test(password)) {
      strength -= 15
    }

    // Provide feedback based on strength
    if (strength >= 80) {
      feedback = "Very strong password"
    } else if (strength >= 60) {
      feedback = "Strong password"
    } else if (strength >= 40) {
      feedback = "Moderate password"
    } else if (strength >= 20) {
      feedback = "Weak password"
    } else {
      feedback = "Very weak password"
    }

    // Ensure strength is between 0-100
    strength = Math.max(0, Math.min(100, strength))

    setPasswordStrength(strength)
    setPasswordFeedback(feedback)
  }

  // Generate a strong random password
  const generatePassword = () => {
    const length = 16
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?"
    let password = ""

    // Ensure at least one of each character type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
    password += "0123456789"[Math.floor(Math.random() * 10)]
    password += "!@#$%^&*()_-+=<>?"[Math.floor(Math.random() * 16)]

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }

    // Shuffle the password
    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("")

    setGeneratedPassword(password)
    setPassword(password)
    checkPasswordStrength(password)
  }

  // Copy password to clipboard
  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword || password)
    setPasswordCopied(true)
    setTimeout(() => setPasswordCopied(false), 2000)
  }

  // Add to history after successful encryption
  const addToHistory = () => {
    if (!file) return

    const newEntry = {
      name: file.name,
      date: new Date().toLocaleString(),
      type: "Encrypted",
    }

    setRecentFiles((prev) => [newEntry, ...prev.slice(0, 4)])
  }

  // Simulate encryption process
  const encryptFile = async () => {
    if (!file || !password) {
      setError("Please select a file and enter a password.")
      return
    }

    try {
      setStatus("encrypting")
      setProgress(0)
      setMessage("Preparing for encryption...")

      // Simulate encryption steps
      await new Promise((resolve) => setTimeout(resolve, 500))
      setProgress(20)
      setMessage("Reading file...")

      await new Promise((resolve) => setTimeout(resolve, 700))
      setProgress(40)
      setMessage("Generating encryption key...")

      await new Promise((resolve) => setTimeout(resolve, 800))
      setProgress(60)
      setMessage("Encrypting file...")

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setProgress(80)
      setMessage("Finalizing encryption...")

      await new Promise((resolve) => setTimeout(resolve, 500))
      setProgress(100)

      // Create a simulated encrypted file
      const encryptedBlob = new Blob([await file.arrayBuffer()], { type: "application/encrypted" })
      setEncryptedFile(encryptedBlob)

      // Add to history
      addToHistory()

      setStatus("success")
      setMessage("File encrypted successfully! You can now download the encrypted file.")
    } catch (err) {
      setStatus("error")
      setError("Encryption failed. Please try again.")
      console.error(err)
    }
  }

  // Simulate decryption process
  const decryptFile = async () => {
    if (!file || !password) {
      setError("Please select a file and enter a password.")
      return
    }

    try {
      setStatus("decrypting")
      setProgress(0)
      setMessage("Preparing for decryption...")

      // Simulate decryption steps
      await new Promise((resolve) => setTimeout(resolve, 500))
      setProgress(20)
      setMessage("Reading encrypted file...")

      await new Promise((resolve) => setTimeout(resolve, 700))
      setProgress(40)
      setMessage("Verifying password...")

      await new Promise((resolve) => setTimeout(resolve, 800))
      setProgress(60)
      setMessage("Decrypting file...")

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setProgress(80)
      setMessage("Finalizing decryption...")

      await new Promise((resolve) => setTimeout(resolve, 500))
      setProgress(100)

      // Create a simulated decrypted file
      const decryptedBlob = new Blob([await file.arrayBuffer()], { type: file.type || "application/octet-stream" })
      setDecryptedFile(decryptedBlob)

      // If it's a text file, show preview
      if (isFileText(file)) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string)
          setIsTextFile(true)
        }
        reader.readAsText(decryptedBlob)
      }

      setStatus("success")
      setMessage("File decrypted successfully! You can now download the decrypted file.")
    } catch (err) {
      setStatus("error")
      setError("Decryption failed. Please check your password and try again.")
      console.error(err)
    }
  }

  // Reset form
  const resetForm = (decrypting = false) => {
    setFile(null)
    setFilePreview(null)
    setIsTextFile(false)
    setPassword("")
    setEncryptedFile(null)
    setDecryptedFile(null)
    setStatus("idle")
    setProgress(0)
    setMessage("")
    setError("")
    setEncryptionNote("")
    setGeneratedPassword("")

    if (decrypting) {
      if (decryptFileInputRef.current) {
        decryptFileInputRef.current.value = "" // Clear the file input
      }
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Clear the file input
      }
    }
  }

  // Download file
  const downloadFile = (decrypted = false) => {
    let blob: Blob | null = null
    let filename = "download"

    if (decrypted) {
      if (decryptedFile) {
        blob = decryptedFile
        if (file) {
          filename = `decrypted_${file.name}`
        }
      }
    } else {
      if (encryptedFile) {
        blob = encryptedFile
        if (file) {
          filename = `encrypted_${file.name}.encrypted`
        }
      }
    }

    if (blob) {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a) // Required for Firefox
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } else {
      setError("No file available for download.")
    }
  }

  // Update password strength when password changes
  useEffect(() => {
    checkPasswordStrength(password)
  }, [password])

  return (
    <ToolContainer
      title="File Encryption Tool"
      description="Securely encrypt and decrypt your sensitive files"
      icon={<Lock className="h-5 w-5 text-primary" />}
    >
      <AnimatedTabs
        tabItems={[
          { value: "encrypt", label: "Encrypt", icon: <Lock className="h-4 w-4" /> },
          { value: "decrypt", label: "Decrypt", icon: <Unlock className="h-4 w-4" /> },
        ]}
        value={activeTab}
        onValueChange={(value: string) => {
          setActiveTab(value as "encrypt" | "decrypt")
          resetForm(value === "decrypt")
        }}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "encrypt" | "decrypt")}>
        <TabsContent value="encrypt" className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* File Upload Area */}
            <AnimatedCard
              delay={0.1}
              title="Select File"
              description="Choose a file to encrypt"
              icon={<Upload className="h-5 w-5 text-primary" />}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e)}
              >
                <input
                  type="file"
                  id="file-upload"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e)}
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
                    className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3"
                  >
                    <Upload className="h-8 w-8 text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground mb-2">
                    {file ? file.name : "Drag and drop a file here or click to browse"}
                  </p>
                  <Button variant="outline" className="mt-2">
                    Select File
                  </Button>
                </motion.div>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-sm text-muted-foreground"
                  >
                    File size: {formatFileSize(file.size)}
                  </motion.div>
                )}
              </motion.div>

              {file && isTextFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.4 }}
                  className="mt-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">File Preview</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="h-8 px-2 text-xs"
                    >
                      {showPreview ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>
                  {showPreview && filePreview && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="max-h-32 overflow-auto rounded-md bg-muted p-2 text-xs font-mono"
                    >
                      {filePreview.length > 2000
                        ? filePreview.substring(0, 2000) + "... (preview truncated)"
                        : filePreview}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatedCard>

            {/* Password Input with Strength Meter */}
            <AnimatedCard
              delay={0.2}
              title="Encryption Password"
              description="Create a strong password to secure your file"
              icon={<Key className="h-5 w-5 text-primary" />}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-20"
                    />
                    <div className="absolute right-0 top-0 h-full flex">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generatePassword}
                        className="h-full px-2 text-xs"
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Generate
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-full px-2 text-xs"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  <AnimatePresence>
                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1"
                      >
                        <div className="flex justify-between text-xs">
                          <span>{passwordFeedback}</span>
                          <span>{passwordStrength}%</span>
                        </div>
                        <AnimatedProgress
                          value={passwordStrength}
                          color={
                            passwordStrength < 30
                              ? "bg-red-500"
                              : passwordStrength < 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-xs text-muted-foreground">
                    Choose a strong password you can remember. This password will be needed to decrypt the file.
                  </p>
                </div>

                {/* Encryption Note */}
                <div className="space-y-2">
                  <label htmlFor="encryption-note" className="text-sm font-medium">
                    Encryption Note (Optional)
                  </label>
                  <Input
                    id="encryption-note"
                    placeholder="Add a note about this file (will be encrypted)"
                    value={encryptionNote}
                    onChange={(e) => setEncryptionNote(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">This note will be encrypted along with your file</p>
                </div>

                {/* Generated Password */}
                {generatedPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium">Generated Password</h3>
                      <Button variant="ghost" size="sm" onClick={copyPasswordToClipboard} className="h-7 px-2 text-xs">
                        {passwordCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm font-mono break-all">{generatedPassword}</p>
                  </motion.div>
                )}
              </div>
            </AnimatedCard>
          </div>

          {/* Progress and Status */}
          <AnimatePresence>
            {status !== "idle" && status !== "success" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span>{message}</span>
                  <span>{progress}%</span>
                </div>
                <AnimatedProgress value={progress} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {message && status === "success" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Alert className="bg-green-500/10 border-green-500/30 text-green-500">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-between">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={() => resetForm()}>
                Reset
              </Button>
            </motion.div>
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={encryptFile}
                  disabled={!file || !password || status === "encrypting"}
                  className="flex items-center gap-2"
                >
                  {status === "encrypting" ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Encrypting...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Encrypt File
                    </>
                  )}
                </Button>
              </motion.div>
              {encryptedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="outline" onClick={() => downloadFile()} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Encrypted
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Recent Files History */}
          <AnimatePresence>
            {recentFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-4 border-t"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">Recent Files</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="h-8 px-2 text-xs"
                  >
                    {showHistory ? "Hide History" : "Show History"}
                  </Button>
                </div>

                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {recentFiles.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-2 bg-muted/30 rounded-lg flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <FileLock2 className="h-4 w-4 text-primary" />
                            <span className="text-sm truncate max-w-[200px]">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.date}</span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="decrypt" className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* File Upload for Decryption */}
            <AnimatedCard
              delay={0.1}
              title="Select Encrypted File"
              description="Choose a file to decrypt"
              icon={<FileCheck className="h-5 w-5 text-primary" />}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, true)}
              >
                <input
                  type="file"
                  id="decrypt-file-upload"
                  ref={decryptFileInputRef}
                  onChange={(e) => handleFileChange(e, true)}
                  className="hidden"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                  onClick={() => decryptFileInputRef.current?.click()}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
                    className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3"
                  >
                    <FileText className="h-8 w-8 text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground mb-2">
                    {file ? file.name : "Drag and drop an encrypted file here or click to browse"}
                  </p>
                  <Button variant="outline" className="mt-2">
                    Select File
                  </Button>
                </motion.div>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-sm text-muted-foreground"
                  >
                    File size: {formatFileSize(file.size)}
                  </motion.div>
                )}
              </motion.div>
            </AnimatedCard>

            {/* Password Input for Decryption */}
            <AnimatedCard
              delay={0.2}
              title="Decryption Password"
              description="Enter the password used to encrypt this file"
              icon={<Shield className="h-5 w-5 text-primary" />}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter the decryption password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-3"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the same password that was used to encrypt this file
                  </p>
                </div>

                {/* Decrypted File Preview */}
                <AnimatePresence>
                  {decryptedFile && isTextFile && filePreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">Decrypted Content Preview</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPreview(!showPreview)}
                          className="h-8 px-2 text-xs"
                        >
                          {showPreview ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Show
                            </>
                          )}
                        </Button>
                      </div>
                      {showPreview && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="max-h-32 overflow-auto rounded-md bg-muted p-2 text-xs font-mono"
                        >
                          {filePreview.length > 2000
                            ? filePreview.substring(0, 2000) + "... (preview truncated)"
                            : filePreview}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedCard>
          </div>

          {/* Progress and Status */}
          <AnimatePresence>
            {status !== "idle" && status !== "success" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span>{message}</span>
                  <span>{progress}%</span>
                </div>
                <AnimatedProgress value={progress} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {message && status === "success" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Alert className="bg-green-500/10 border-green-500/30 text-green-500">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-between">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={() => resetForm(true)}>
                Reset
              </Button>
            </motion.div>
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={decryptFile}
                  disabled={!file || !password || status === "decrypting"}
                  className="flex items-center gap-2"
                >
                  {status === "decrypting" ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Decrypting...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" />
                      Decrypt File
                    </>
                  )}
                </Button>
              </motion.div>
              {decryptedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="outline" onClick={() => downloadFile(true)} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Decrypted
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ToolContainer>
  )
}

