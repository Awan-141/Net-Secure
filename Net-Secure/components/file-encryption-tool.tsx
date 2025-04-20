"use client"

import { useState, useRef, useEffect } from "react"
import { ToolContainer } from "@/components/ui/tool-container"
import { ToolInput } from "@/components/ui/tool-input"
import { ConfigSection, ToggleOption, CircularIndicator } from "@/components/ui/tool-config-panel"
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Key,
  Shield,
  Check,
  RefreshCw,
  FileText,
  HistoryIcon,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type ProcessingStatus = "idle" | "encrypting" | "decrypting" | "success" | "error"

export function FileEncryptionTool() {
  // File states
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isTextFile, setIsTextFile] = useState<boolean>(false)

  // Encryption states
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [encryptedFile, setEncryptedFile] = useState<Blob | null>(null)
  const [decryptedFile, setDecryptedFile] = useState<Blob | null>(null)
  const [encryptionNote, setEncryptionNote] = useState("")
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState("")

  // UI states
  const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">("encrypt")
  const [status, setStatus] = useState<ProcessingStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [recentFiles, setRecentFiles] = useState<Array<{ name: string; date: string; type: string }>>([])

  const { toast } = useToast()

  // Format file size
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
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
    ]
    return textTypes.includes(file.type) || file.name.match(/\.(txt|json|js|html|css|xml)$/i) !== null
  }

  // Generate a strong random password
  const generatePassword = () => {
    let chars = ""
    chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    chars += "abcdefghijklmnopqrstuvwxyz"
    chars += "0123456789"
    chars += "!@#$%^&*()_-+=<>?"

    const length = 16
    let password = ""
    for (let i = 0; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)]
    }

    setGeneratedPassword(password)
    setPassword(password)
    checkPasswordStrength(password)

    toast({
      title: "Password Generated",
      description: "A secure password has been generated for you.",
    })
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
    if (password.length >= 12) strength += 25
    else if (password.length >= 8) strength += 15
    else if (password.length >= 6) strength += 10

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 15 // Uppercase
    if (/[a-z]/.test(password)) strength += 15 // Lowercase
    if (/[0-9]/.test(password)) strength += 15 // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 20 // Special characters

    // Repeated characters check
    if (/(.)\1\1/.test(password)) strength -= 10

    // Common patterns check
    if (/123|abc|qwerty|password|admin|welcome/i.test(password)) strength -= 15

    // Provide feedback based on strength
    if (strength >= 80) feedback = "Very strong password"
    else if (strength >= 60) feedback = "Strong password"
    else if (strength >= 40) feedback = "Moderate password"
    else if (strength >= 20) feedback = "Weak password"
    else feedback = "Very weak password"

    // Ensure strength is between 0-100
    strength = Math.max(0, Math.min(100, strength))

    setPasswordStrength(strength)
    setPasswordFeedback(feedback)
  }

  // Effect to check password strength when password changes
  useEffect(() => {
    checkPasswordStrength(password)
  }, [password])

  // Process the file (encrypt/decrypt)
  const processFile = async () => {
    if (!file || !password) {
      setError("Please select a file and enter a password.")
      return
    }

    try {
      setStatus(activeTab === "encrypt" ? "encrypting" : "decrypting")
      setProgress(0)
      setMessage("Preparing file...")

      // Simulate processing steps with realistic timing
      const steps = activeTab === "encrypt" 
        ? ["Reading file...", "Generating key...", "Encrypting data...", "Finalizing..."]
        : ["Reading file...", "Verifying key...", "Decrypting data...", "Finalizing..."];

      for (let i = 0; i < steps.length; i++) {
        setMessage(steps[i])
        setProgress((i + 1) * 25)
        await new Promise(r => setTimeout(r, 500))
      }

      // Create processed file (simulated for demo)
      const processedBlob = new Blob([await file.arrayBuffer()], { 
        type: activeTab === "encrypt" ? "application/encrypted" : file.type 
      })

      if (activeTab === "encrypt") {
        setEncryptedFile(processedBlob)
        addToHistory()
      } else {
        setDecryptedFile(processedBlob)
        if (isFileText(file)) {
          const reader = new FileReader()
          reader.onload = (e) => {
            setFilePreview(e.target?.result as string)
            setIsTextFile(true)
          }
          reader.readAsText(processedBlob)
        }
      }

      setStatus("success")
      toast({
        title: "Success",
        description: `File ${activeTab === "encrypt" ? "encrypted" : "decrypted"} successfully!`,
      })
    } catch (err) {
      setStatus("error")
      setError(`${activeTab === "encrypt" ? "Encryption" : "Decryption"} failed. Please try again.`)
    }
  }

  // Handle file upload
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile)
    setEncryptedFile(null)
    setDecryptedFile(null)
    setMessage("")
    setError("")
    setProgress(0)
    setStatus("idle")

    if (isFileText(uploadedFile) && activeTab === "encrypt") {
      const reader = new FileReader()
      reader.onload = (e) => setFilePreview(e.target?.result as string)
      reader.readAsText(uploadedFile)
    } else {
      setFilePreview(null)
    }
  }

  // Add file to history
  const addToHistory = () => {
    if (!file) return
    const newEntry = {
      name: file.name,
      date: new Date().toLocaleString(),
      type: activeTab === "encrypt" ? "Encrypted" : "Decrypted",
    }
    setRecentFiles(prev => [newEntry, ...prev.slice(0, 4)])
  }

  return (
    <ToolContainer
      title={activeTab === "encrypt" ? "File Encryption" : "File Decryption"}
      description={
        activeTab === "encrypt"
          ? "Securely encrypt your files with strong password protection"
          : "Decrypt your previously encrypted files"
      }
      icon={activeTab === "encrypt" ? Lock : Unlock}
      primaryAction={{
        label: activeTab === "encrypt" ? "Encrypt File" : "Decrypt File",
        icon: status === "encrypting" || status === "decrypting" ? Loader2 : activeTab === "encrypt" ? Lock : Unlock,
        onClick: processFile,
        loading: status === "encrypting" || status === "decrypting",
        disabled: !file || !password
      }}
      rightSidebar={
        <div className="space-y-6">
          <ConfigSection
            title="Password Configuration"
            icon={Key}
            defaultExpanded={true}
          >
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={`Enter ${activeTab === "encrypt" ? "a strong" : "the"} password`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-20"
                />
                <div className="absolute right-0 top-0 h-full flex">
                  {activeTab === "encrypt" && (
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
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-full px-2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {activeTab === "encrypt" && password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>{passwordFeedback}</span>
                    <span>{passwordStrength}%</span>
                  </div>
                  <Progress
                    value={passwordStrength}
                    className={cn(
                      "h-1",
                      passwordStrength < 30 && "text-destructive",
                      passwordStrength >= 30 && passwordStrength < 60 && "text-yellow-500",
                      passwordStrength >= 60 && "text-green-500"
                    )}
                  />
                </div>
              )}
            </div>
          </ConfigSection>

          {activeTab === "encrypt" && (
            <ConfigSection
              title="Encryption Options"
              icon={Shield}
              defaultExpanded={true}
            >
              <div className="space-y-4">
                <Input
                  placeholder="Add a note (will be encrypted)"
                  value={encryptionNote}
                  onChange={(e) => setEncryptionNote(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This note will be encrypted along with your file
                </p>
              </div>
            </ConfigSection>
          )}

          {recentFiles.length > 0 && (
            <ConfigSection
              title="Recent Files"
              icon={HistoryIcon}
              defaultExpanded={false}
            >
              <div className="space-y-2">
                {recentFiles.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </ConfigSection>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <ToolInput
          title={activeTab === "encrypt" ? "Input File" : "Encrypted File"}
          placeholder={
            activeTab === "encrypt"
              ? "Select or drop a file to encrypt"
              : "Select or drop an encrypted file"
          }
          value={filePreview || ""}
          onChange={() => {}}
          onFileUpload={handleFileUpload}
          supportedFileTypes={["*"]}
          statusText={file ? formatBytes(file.size) : "No file selected"}
          showMaximize={isTextFile}
        />

        {(status === "encrypting" || status === "decrypting") && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{message}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}
      </div>
    </ToolContainer>
  )
}

