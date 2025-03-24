"use client"
import { Lock, Upload } from "lucide-react"
import type React from "react"

import { useState, useRef } from "react"

interface SimpleEncryptionProps {
  openEncryptionTool: () => void
}

export function SimpleEncryption({ openEncryptionTool }: SimpleEncryptionProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      openEncryptionTool()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      openEncryptionTool()
    }
  }

  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border h-full">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-card-foreground">File Encryption</h3>
          <div className="p-1.5 bg-primary/20 rounded-lg">
            <Lock className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-muted"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input type="file" id="file-upload" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <Upload className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground mb-2 text-xs">Drag and drop a file to encrypt or decrypt</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs"
          >
            Select File
          </button>
        </div>

        <button
          onClick={openEncryptionTool}
          className="w-full mt-3 py-1.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs font-medium"
        >
          Open Encryption Tool
        </button>
      </div>
    </div>
  )
}

