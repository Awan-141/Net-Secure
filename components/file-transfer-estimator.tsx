"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, ArrowRight, BarChart3 } from "lucide-react"

type FileUnit = "bytes" | "KB" | "MB" | "GB" | "TB"

const units: FileUnit[] = ["bytes", "KB", "MB", "GB", "TB"]

const unitSizes: Record<FileUnit, number> = {
  bytes: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
}

// Accurate conversion functions
const convertToBytes = (size: number, unit: FileUnit): number => size * unitSizes[unit]

const convertFromBytes = (bytes: number): { size: number; unit: FileUnit } => {
  let unitIndex = 0
  let size = bytes
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return { size: Number.parseFloat(size.toFixed(2)), unit: units[unitIndex] }
}

// Formula to calculate file transfer time in seconds
// File Size (bits) / Transfer Speed (bits per second)
const calculateTime = (fileSizeBytes: number, speedMbps: number): number => {
  // Convert file size from bytes to bits
  const fileSizeBits = fileSizeBytes * 8
  // Convert speed from Mbps to bps (1 Mbps = 1,000,000 bps)
  const speedBps = speedMbps * 1000000
  // Calculate time in seconds
  return fileSizeBits / speedBps
}

export function FileTransferEstimator() {
  const [file, setFile] = useState<File | null>(null)
  const [manualFileSize, setManualFileSize] = useState<number>(100)
  const [manualFileUnit, setManualFileUnit] = useState<FileUnit>("MB")
  const [downloadSpeed, setDownloadSpeed] = useState<number>(100)
  const [uploadSpeed, setUploadSpeed] = useState<number>(20)
  const [compressionEnabled, setCompressionEnabled] = useState<boolean>(false)
  const [compressionRate, setCompressionRate] = useState<number>(50)
  const [downloadTime, setDownloadTime] = useState<number>(0)
  const [uploadTime, setUploadTime] = useState<number>(0)
  const [networkLatency, setNetworkLatency] = useState<number>(50)
  const [connectionType, setConnectionType] = useState<"wifi" | "ethernet" | "4g" | "5g">("wifi")
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Medium speed factors (relative to base speed)
  const mediumFactors: Record<string, number> = {
    wifi: 1.0, // Base reference
    ethernet: 1.5, // Faster - Wired connections are more stable and often faster
    "4g": 0.5, // Mobile network - Variable but generally slower than WiFi
    "5g": 1.2, // Fast mobile network - Can be faster than standard WiFi
  }

  // Get effective speed based on selected medium
  const getEffectiveSpeed = (baseSpeed: number): number => {
    return baseSpeed * mediumFactors[connectionType]
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const { size, unit } = convertFromBytes(selectedFile.size)
      setManualFileSize(size)
      setManualFileUnit(unit)
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      const { size, unit } = convertFromBytes(droppedFile.size)
      setManualFileSize(size)
      setManualFileUnit(unit)
    }
  }

  // Calculate transfer times
  const handleEstimate = () => {
    // Calculate total file size in bytes
    const totalSizeBytes = file ? file.size : convertToBytes(manualFileSize, manualFileUnit)

    // Calculate compressed size if compression is enabled
    let effectiveSizeBytes = totalSizeBytes
    if (compressionEnabled) {
      effectiveSizeBytes = totalSizeBytes * (1 - compressionRate / 100)
    }

    // Get effective speeds based on connection settings
    const effectiveDownloadSpeed = getEffectiveSpeed(downloadSpeed)
    const effectiveUploadSpeed = getEffectiveSpeed(uploadSpeed)

    // Calculate transfer times
    const downloadTimeValue = calculateTime(effectiveSizeBytes, effectiveDownloadSpeed)
    const uploadTimeValue = calculateTime(effectiveSizeBytes, effectiveUploadSpeed)

    setDownloadTime(downloadTimeValue)
    setUploadTime(uploadTimeValue)
  }

  // Format time for display
  const formatTime = (seconds: number): string => {
    if (seconds < 0.01) {
      return "< 0.01 seconds"
    } else if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)} milliseconds`
    } else if (seconds < 60) {
      return `${seconds.toFixed(2)} seconds`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes} min ${remainingSeconds.toFixed(0)} sec`
    } else if (seconds < 86400) {
      // Less than a day
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours} hr ${minutes} min`
    } else {
      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      return `${days} days ${hours} hr`
    }
  }

  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border p-5">
      <div className="space-y-5">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-muted"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input type="file" id="fileUpload" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
          <Upload className="h-8 w-8 mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground mb-3 text-sm">
            {file ? file.name : "Drag and drop a file here or click to browse"}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm"
          >
            Select File
          </button>
          {file && (
            <p className="mt-2 text-xs text-muted-foreground">
              File size: {convertFromBytes(file.size).size.toFixed(2)} {convertFromBytes(file.size).unit}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <h3 className="text-base font-medium text-card-foreground">File Size</h3>
            {!file && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fileSize" className="block text-sm font-medium text-muted-foreground mb-1">
                    Size
                  </label>
                  <input
                    id="fileSize"
                    type="number"
                    value={manualFileSize}
                    onChange={(e) => setManualFileSize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="fileUnit" className="block text-sm font-medium text-muted-foreground mb-1">
                    Unit
                  </label>
                  <select
                    id="fileUnit"
                    value={manualFileUnit}
                    onChange={(e) => setManualFileUnit(e.target.value as FileUnit)}
                    className="w-full px-3 py-2 bg-muted/70 border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-white text-sm"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="compressionToggle" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    id="compressionToggle"
                    type="checkbox"
                    className="sr-only"
                    checked={compressionEnabled}
                    onChange={() => setCompressionEnabled(!compressionEnabled)}
                  />
                  <div className="block bg-muted w-12 h-6 rounded-full"></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      compressionEnabled ? "transform translate-x-6 bg-primary" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-muted-foreground text-sm">Enable Compression</div>
              </label>

              {compressionEnabled && (
                <div className="mt-3">
                  <label htmlFor="compressionRate" className="block text-sm font-medium text-muted-foreground mb-1">
                    Compression Rate: {compressionRate}%
                  </label>
                  <input
                    id="compressionRate"
                    type="range"
                    min="0"
                    max="95"
                    value={compressionRate}
                    onChange={(e) => setCompressionRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Note: Compression effectiveness varies by file type
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-medium text-card-foreground">Network Settings</h3>

            <div>
              <label htmlFor="connectionType" className="block text-sm font-medium text-muted-foreground mb-1">
                Connection Type
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    connectionType === "wifi"
                      ? "bg-primary text-white"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setConnectionType("wifi")}
                >
                  Wi-Fi
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    connectionType === "ethernet"
                      ? "bg-primary text-white"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setConnectionType("ethernet")}
                >
                  Ethernet
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    connectionType === "4g"
                      ? "bg-primary text-white"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setConnectionType("4g")}
                >
                  4G
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    connectionType === "5g"
                      ? "bg-primary text-white"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setConnectionType("5g")}
                >
                  5G
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="downloadSpeed" className="block text-sm font-medium text-muted-foreground mb-1">
                Download Speed (Mbps)
              </label>
              <input
                id="downloadSpeed"
                type="number"
                value={downloadSpeed}
                onChange={(e) => setDownloadSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/70 border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-white text-sm"
              />
            </div>

            <div>
              <label htmlFor="uploadSpeed" className="block text-sm font-medium text-muted-foreground mb-1">
                Upload Speed (Mbps)
              </label>
              <input
                id="uploadSpeed"
                type="number"
                value={uploadSpeed}
                onChange={(e) => setUploadSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/70 border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-white text-sm"
              />
            </div>

            <div>
              <label htmlFor="networkLatency" className="block text-sm font-medium text-muted-foreground mb-1">
                Network Latency (ms)
              </label>
              <input
                id="networkLatency"
                type="number"
                value={networkLatency}
                onChange={(e) => setNetworkLatency(Number(e.target.value))}
                className="w-full px-3 py-2 bg-muted/70 border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-white text-sm"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleEstimate}
          className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Calculate Transfer Time</span>
        </button>

        {(downloadTime > 0 || uploadTime > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-muted/50 border-border p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-1.5 bg-chart-1/20 rounded-lg">
                  <ArrowRight className="h-4 w-4 text-chart-1" />
                </div>
                <h3 className="text-base font-medium text-card-foreground">Download Time</h3>
              </div>
              <p className="text-2xl font-bold text-white">{formatTime(downloadTime)}</p>
              <p className="text-xs text-muted-foreground mt-1.5">
                At {getEffectiveSpeed(downloadSpeed).toFixed(2)} Mbps effective speed
              </p>
            </div>

            <div className="bg-muted/50 border-border p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-1.5 bg-chart-2/20 rounded-lg">
                  <ArrowRight className="h-4 w-4 text-chart-2" />
                </div>
                <h3 className="text-base font-medium text-card-foreground">Upload Time</h3>
              </div>
              <p className="text-2xl font-bold text-white">{formatTime(uploadTime)}</p>
              <p className="text-xs text-muted-foreground mt-1.5">
                At {getEffectiveSpeed(uploadSpeed).toFixed(2)} Mbps effective speed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

