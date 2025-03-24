"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
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
  FileIcon,
} from "lucide-react"

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

  // Generate encryption key from password
  const getKeyFromPassword = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const encoder = new TextEncoder()
    const passwordData = encoder.encode(password)

    // Import the password as a key
    const passwordKey = await window.crypto.subtle.importKey("raw", passwordData, { name: "PBKDF2" }, false, [
      "deriveKey",
    ])

    // Derive an AES-GCM key using PBKDF2
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    )
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

  // Encrypt file
  const encryptFile = async () => {
    if (!file || !password) {
      setError("Please select a file and enter a password.")
      return
    }

    try {
      setStatus("encrypting")
      setProgress(10)
      setMessage("Preparing for encryption...")

      // Generate a random salt
      const salt = window.crypto.getRandomValues(new Uint8Array(16))

      // Generate a random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12))

      // Derive key from password
      const key = await getKeyFromPassword(password, salt)

      setProgress(30)
      setMessage("Reading file...")

      // Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer()

      setProgress(50)
      setMessage("Encrypting file...")

      // Encrypt the file
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        fileBuffer,
      )

      setProgress(80)
      setMessage("Finalizing encryption...")

      // Create a metadata object
      const metadata = {
        note: encryptionNote || "",
        filename: file.name,
        date: new Date().toISOString(),
      }

      // Convert metadata to JSON and then to Uint8Array
      const metadataStr = JSON.stringify(metadata)
      const encoder = new TextEncoder()
      const metadataBytes = encoder.encode(metadataStr)

      // Create a 4-byte header for metadata length
      const metadataLength = new Uint8Array(4)
      const dv = new DataView(metadataLength.buffer)
      dv.setUint32(0, metadataBytes.length, true)

      // Combine salt + iv + metadata length + metadata + encrypted data into a single file
      const resultBuffer = new Uint8Array(
        salt.length + iv.length + metadataLength.length + metadataBytes.length + encryptedBuffer.byteLength,
      )

      let offset = 0
      resultBuffer.set(salt, offset)
      offset += salt.length

      resultBuffer.set(iv, offset)
      offset += iv.length

      resultBuffer.set(metadataLength, offset)
      offset += metadataLength.length

      resultBuffer.set(metadataBytes, offset)
      offset += metadataBytes.length

      resultBuffer.set(new Uint8Array(encryptedBuffer), offset)

      // Create a Blob from the encrypted data
      const encryptedBlob = new Blob([resultBuffer], { type: "application/encrypted" })
      setEncryptedFile(encryptedBlob)

      // Add to history
      addToHistory()

      setProgress(100)
      setStatus("success")
      setMessage("File encrypted successfully! You can now download the encrypted file.")
    } catch (err) {
      setStatus("error")
      setError("Encryption failed. Please try again.")
      console.error(err)
    }
  }

  // Decrypt file
  const decryptFile = async () => {
    if (!file || !password) {
      setError("Please select a file and enter a password.")
      return
    }

    try {
      setStatus("decrypting")
      setProgress(10)
      setMessage("Preparing for decryption...")

      // Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer()
      const fileData = new Uint8Array(fileBuffer)

      // Extract salt and iv
      const salt = fileData.slice(0, 16)
      const iv = fileData.slice(16, 28)

      // Extract metadata length (4 bytes after iv)
      const metadataLengthBytes = fileData.slice(28, 32)
      const metadataLength = new DataView(metadataLengthBytes.buffer).getUint32(0, true)

      // Extract metadata
      const metadataBytes = fileData.slice(32, 32 + metadataLength)
      const decoder = new TextDecoder()
      let metadata = { note: "", filename: "", date: "" }

      try {
        const metadataStr = decoder.decode(metadataBytes)
        metadata = JSON.parse(metadataStr)
      } catch (e) {
        console.warn("Could not parse metadata, assuming legacy format")
      }

      // Extract encrypted data (everything after metadata)
      const encryptedData = fileData.slice(32 + metadataLength)

      setProgress(30)
      setMessage("Deriving key from password...")

      // Derive key from password
      const key = await getKeyFromPassword(password, salt)

      setProgress(50)
      setMessage("Decrypting file...")

      // Decrypt the file
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        encryptedData,
      )

      setProgress(90)
      setMessage("Finalizing decryption...")

      // Create a Blob from the decrypted data
      const decryptedBlob = new Blob([decryptedBuffer], { type: "application/octet-stream" })
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

      // If there was a note in the metadata, show it
      if (metadata.note) {
        setEncryptionNote(metadata.note)
      }

      setProgress(100)
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
    <div className="bg-[#0f1e36] rounded-xl shadow-lg overflow-hidden border border-[#1a2942] p-3">
      <div className="space-y-3">
        {/* Tabs */}
        <div className="flex border-b border-[#1a2942]">
          <button
            className={`py-1.5 px-3 font-medium text-xs ${
              activeTab === "encrypt"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("encrypt")}
          >
            <Lock className="inline-block mr-1.5 h-3.5 w-3.5" />
            Encrypt
          </button>
          <button
            className={`py-1.5 px-3 font-medium text-xs ${
              activeTab === "decrypt"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("decrypt")}
          >
            <Unlock className="inline-block mr-1.5 h-3.5 w-3.5" />
            Decrypt
          </button>
        </div>

        {/* Encrypt Tab */}
        {activeTab === "encrypt" && (
          <div className="space-y-3">
            {/* File Upload */}
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/10" : "border-[#1a2942] hover:border-muted"
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
              <Upload className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground mb-2 text-xs">
                {file ? file.name : "Drag and drop a file here or click to browse"}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs"
              >
                Select File
              </button>
              {file && (
                <p className="mt-1.5 text-[10px] text-muted-foreground">File size: {formatFileSize(file.size)}</p>
              )}
            </div>

            {/* File Information */}
            {file && (
              <div className="bg-[#1a2942]/50 border border-[#1a2942] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <FileIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium text-xs text-card-foreground">File Information</span>
                  </div>
                  {isTextFile && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center space-x-1 text-[10px] text-primary hover:text-primary/80"
                    >
                      {showPreview ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Hide Preview</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Show Preview</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div>
                    <strong className="text-card-foreground">Name:</strong> {file.name}
                  </div>
                  <div>
                    <strong className="text-card-foreground">Size:</strong> {formatFileSize(file.size)}
                  </div>
                  <div>
                    <strong className="text-card-foreground">Type:</strong> {file.type || "Unknown"}
                  </div>
                </div>

                {isTextFile && showPreview && filePreview && (
                  <div className="mt-2">
                    <div className="text-[10px] font-medium text-card-foreground mb-1">Preview:</div>
                    <pre className="max-h-32 overflow-auto rounded-md bg-[#0a1629] p-2 text-[10px] text-muted-foreground font-mono">
                      {filePreview.length > 2000
                        ? filePreview.substring(0, 2000) + "... (preview truncated)"
                        : filePreview}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Password Input with Strength Meter */}
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-medium text-card-foreground">
                    Encryption Password
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="flex items-center space-x-1 text-[10px] px-1.5 py-0.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors"
                  >
                    <RefreshCw className="h-2.5 w-2.5" />
                    <span>Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#0a1629] border border-[#1a2942] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground pr-16 text-xs"
                  />
                  <div className="absolute right-0 top-0 h-full flex">
                    {generatedPassword && (
                      <button
                        type="button"
                        className="h-full px-1.5 text-muted-foreground hover:text-white"
                        onClick={copyPasswordToClipboard}
                      >
                        {passwordCopied ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      className="h-full px-1.5 text-muted-foreground hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{passwordFeedback}</span>
                      <span>{passwordStrength}%</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-[#1a2942] overflow-hidden">
                      <div
                        className={`h-1 rounded-full ${
                          passwordStrength < 30
                            ? "bg-red-500"
                            : passwordStrength < 60
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground">
                  Choose a strong password you can remember. This password will be needed to decrypt the file.
                </p>
              </div>

              {/* Encryption Note */}
              <div className="space-y-1">
                <label htmlFor="encryption-note" className="text-xs font-medium text-card-foreground">
                  Encryption Note (Optional)
                </label>
                <input
                  id="encryption-note"
                  placeholder="Add a note about this file (will be encrypted)"
                  value={encryptionNote}
                  onChange={(e) => setEncryptionNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#1a2942]/70 border border-[#1a2942] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-white text-xs"
                />
                <p className="text-[10px] text-muted-foreground">This note will be encrypted along with your file</p>
              </div>
            </div>

            {/* Recent Files History */}
            {recentFiles.length > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-medium text-card-foreground">Recent Files</h3>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-[10px] text-primary hover:text-primary/80"
                  >
                    {showHistory ? "Hide History" : "Show History"}
                  </button>
                </div>

                {showHistory && (
                  <div className="bg-[#1a2942]/50 border border-[#1a2942] rounded-lg divide-y divide-[#1a2942]">
                    {recentFiles.map((item, index) => (
                      <div key={index} className="p-2 text-xs flex justify-between items-center">
                        <div className="flex items-center space-x-1.5">
                          <FileIcon className="h-3 w-3 text-primary" />
                          <span className="font-medium truncate max-w-[150px] text-muted-foreground text-[10px]">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="px-1 py-0.5 text-[10px] bg-primary/20 text-primary/80 rounded">
                            {item.type}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Progress and Status */}
            {status !== "idle" && status !== "success" && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{message}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1 bg-[#1a2942] rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && status === "success" && (
              <div className="rounded-md bg-emerald-900/20 border border-emerald-700/30 p-2 text-xs text-emerald-400">
                {message}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-destructive/20 border border-destructive/30 p-2 text-xs text-destructive flex items-start space-x-1.5">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-between">
              <button
                onClick={() => resetForm()}
                className="px-3 py-1.5 bg-[#1a2942] hover:bg-[#243552] text-white rounded-lg transition-colors text-xs"
              >
                Reset
              </button>
              <div className="flex gap-2">
                <button
                  onClick={encryptFile}
                  disabled={!file || !password || status === "encrypting"}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Encrypt File</span>
                </button>
                {encryptedFile && (
                  <button
                    onClick={() => downloadFile()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1a2942] hover:bg-[#243552] text-white rounded-lg transition-colors text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Encrypted</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Decrypt Tab */}
        {activeTab === "decrypt" && (
          <div className="space-y-3">
            {/* File Upload for Decryption */}
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/10" : "border-[#1a2942] hover:border-muted"
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
              <Upload className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground mb-2 text-xs">{file ? file.name : "Upload an encrypted file"}</p>
              <button
                onClick={() => decryptFileInputRef.current?.click()}
                className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs"
              >
                Select File
              </button>
              {file && (
                <p className="mt-1.5 text-[10px] text-muted-foreground">File size: {formatFileSize(file.size)}</p>
              )}
            </div>

            {/* File Information */}
            {file && (
              <div className="bg-[#1a2942]/50 border border-[#1a2942] rounded-lg p-3">
                <div className="flex items-center space-x-1.5 mb-2">
                  <FileIcon className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-xs text-card-foreground">Encrypted File</span>
                </div>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div>
                    <strong className="text-card-foreground">Name:</strong> {file.name}
                  </div>
                  <div>
                    <strong className="text-card-foreground">Size:</strong> {formatFileSize(file.size)}
                  </div>
                </div>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1">
              <label htmlFor="decrypt-password" className="text-xs font-medium text-card-foreground">
                Decryption Password
              </label>
              <div className="relative">
                <input
                  id="decrypt-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter the password used for encryption"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#1a2942]/70 border border-[#1a2942] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-white pr-8 text-xs"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-2 text-muted-foreground hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Decrypted File Preview */}
            {decryptedFile && isTextFile && filePreview && (
              <div className="bg-[#1a2942]/50 border border-[#1a2942] rounded-lg p-3">
                <div className="flex items-center space-x-1.5 mb-2">
                  <FileIcon className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-xs text-card-foreground">Decrypted Content Preview</span>
                </div>
                <pre className="max-h-32 overflow-auto rounded-md bg-[#0a1629] p-2 text-[10px] text-muted-foreground font-mono">
                  {filePreview.length > 2000 ? filePreview.substring(0, 2000) + "... (preview truncated)" : filePreview}
                </pre>
              </div>
            )}

            {/* Progress and Status */}
            {status !== "idle" && status !== "success" && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{message}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1 bg-[#1a2942] rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && status === "success" && (
              <div className="rounded-md bg-emerald-900/20 border border-emerald-700/30 p-2 text-xs text-emerald-400">
                {message}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-destructive/20 border border-destructive/30 p-2 text-xs text-destructive flex items-start space-x-1.5">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-between">
              <button
                onClick={() => resetForm(true)}
                className="px-3 py-1.5 bg-[#1a2942] hover:bg-[#243552] text-white rounded-lg transition-colors text-xs"
              >
                Reset
              </button>
              <div className="flex gap-2">
                <button
                  onClick={decryptFile}
                  disabled={!file || !password || status === "decrypting"}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Decrypt File</span>
                </button>
                {decryptedFile && (
                  <button
                    onClick={() => downloadFile(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1a2942] hover:bg-[#243552] text-white rounded-lg transition-colors text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Decrypted</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

