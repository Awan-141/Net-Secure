"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { AnimatedTabs } from "@/components/ui/animated-tabs"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedProgress } from "@/components/ui/animated-progress"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { File, Image, Video, FileText, Archive, Wifi, Network, ArrowRight, Upload, Download, Clock, Cloud, Shield, Zap, BarChart2, Settings } from 'lucide-react'

type FileUnit = "bytes" | "KB" | "MB" | "GB" | "TB"

const units: FileUnit[] = ["bytes", "KB", "MB", "GB", "TB"]

const unitSizes: Record<FileUnit, number> = {
  bytes: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
}

interface FileData {
  name: string
  size: number
  unit: FileUnit
  type: string
}

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

const calculateTime = (size: number, speed: number): number => (size * 8) / (speed * 1024 * 1024)

export function FileTransferEstimator() {
  const [files, setFiles] = useState<FileData[]>([])
  const [downloadSpeed, setDownloadSpeed] = useState<number>(100)
  const [uploadSpeed, setUploadSpeed] = useState<number>(20)
  const [compressionEnabled, setCompressionEnabled] = useState<boolean>(false)
  const [compressionRate, setCompressionRate] = useState<number>(50)
  const [downloadTime, setDownloadTime] = useState<number>(0)
  const [uploadTime, setUploadTime] = useState<number>(0)
  const [networkLatency, setNetworkLatency] = useState<number>(50)
  const [currentBandwidth, setCurrentBandwidth] = useState<number>(0)
  const [cloudProvider, setCloudProvider] = useState<string>("none")
  const [cloudUploadTime, setCloudUploadTime] = useState<number>(0)
  const [isVpnEnabled, setIsVpnEnabled] = useState<boolean>(false)
  const [connectionType, setConnectionType] = useState<"wifi" | "ethernet">("wifi")
  const [transferType, setTransferType] = useState<"direct" | "p2p">("direct")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("basic")
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [showResults, setShowResults] = useState<boolean>(false)

  const simulateBandwidthMonitoring = useCallback(() => {
    const baseBandwidth = (downloadSpeed + uploadSpeed) / 2
    const fluctuation = Math.random() * 0.2 - 0.1 // -10% to +10% fluctuation
    setCurrentBandwidth(baseBandwidth * (1 + fluctuation))
  }, [downloadSpeed, uploadSpeed])

  useEffect(() => {
    const intervalId = setInterval(simulateBandwidthMonitoring, 5000) // Update every 5 seconds
    return () => clearInterval(intervalId)
  }, [simulateBandwidthMonitoring])

  const calculateTimeWithLatency = (size: number, speed: number): number => {
    const baseTime = calculateTime(size, speed)
    return baseTime + networkLatency / 1000 // Convert latency from ms to seconds
  }

  const estimateCloudUploadTime = (size: number): number => {
    const cloudSpeedFactors: Record<string, number> = {
      none: 1,
      "google-drive": 0.9,
      "aws-s3": 1.1,
      onedrive: 0.95,
    }
    const effectiveSpeed = uploadSpeed * cloudSpeedFactors[cloudProvider]
    return calculateTimeWithLatency(size, effectiveSpeed)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const fileData = selectedFiles.map((file) => ({
      name: file.name,
      size: file.size,
      unit: "bytes" as FileUnit,
      type: file.type,
    }))
    setFiles(fileData)
    setShowResults(false)
  }

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
    const droppedFiles = Array.from(e.dataTransfer.files)
    const fileData = droppedFiles.map((file) => ({
      name: file.name,
      size: file.size,
      unit: "bytes" as FileUnit,
      type: file.type,
    }))
    setFiles(fileData)
    setShowResults(false)
  }

  const handleEstimate = () => {
    setIsCalculating(true)
    setShowResults(false)
    
    setTimeout(() => {
      let totalSizeBytes = files.reduce((sum, file) => sum + convertToBytes(file.size, file.unit), 0)

      if (compressionEnabled) {
        totalSizeBytes *= 1 - compressionRate / 100
      }

      const { size: finalSize } = convertFromBytes(totalSizeBytes)

      let effectiveDownloadSpeed = downloadSpeed
      let effectiveUploadSpeed = uploadSpeed

      if (isVpnEnabled) {
        effectiveDownloadSpeed *= 0.9
        effectiveUploadSpeed *= 0.9
      }

      if (connectionType === "ethernet") {
        effectiveDownloadSpeed *= 1.2
        effectiveUploadSpeed *= 1.2
      }

      if (transferType === "p2p") {
        effectiveDownloadSpeed *= 0.8
        effectiveUploadSpeed *= 0.8
      }

      const downloadTimeValue = calculateTimeWithLatency(finalSize, effectiveDownloadSpeed)
      const uploadTimeValue = calculateTimeWithLatency(finalSize, effectiveUploadSpeed)
      const cloudUploadTimeValue = estimateCloudUploadTime(finalSize)

      setDownloadTime(downloadTimeValue)
      setUploadTime(uploadTimeValue)
      setCloudUploadTime(cloudUploadTimeValue)
      setIsCalculating(false)
      setShowResults(true)
    }, 1500)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />
    if (fileType.startsWith("video/")) return <Video className="h-4 w-4" />
    if (fileType.startsWith("text/")) return <FileText className="h-4 w-4" />
    if (fileType.includes("compressed") || fileType.includes("zip")) return <Archive className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)} seconds`
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`
    return `${(seconds / 3600).toFixed(1)} hours`
  }

  const chartData = [
    { name: "Download", time: downloadTime },
    { name: "Upload", time: uploadTime },
    { name: "Cloud Upload", time: cloudUploadTime },
  ]

  const tabsContent = [
    {
      id: "basic",
      label: (
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          <span>Basic</span>
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="downloadSpeed">Download Speed (Mbps)</Label>
              <span className="text-sm text-muted-foreground">{downloadSpeed} Mbps</span>
            </div>
            <Slider
              id="downloadSpeed"
              min={1}
              max={1000}
              step={1}
              value={[downloadSpeed]}
              onValueChange={(value) => setDownloadSpeed(value[0])}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="uploadSpeed">Upload Speed (Mbps)</Label>
              <span className="text-sm text-muted-foreground">{uploadSpeed} Mbps</span>
            </div>
            <Slider
              id="uploadSpeed"
              min={1}
              max={500}
              step={1}
              value={[uploadSpeed]}
              onValueChange={(value) => setUploadSpeed(value[0])}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="compression" checked={compressionEnabled} onCheckedChange={setCompressionEnabled} />
            <Label htmlFor="compression">Enable compression</Label>
          </div>
          {compressionEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between">
                <Label htmlFor="compressionRate">Compression Rate</Label>
                <span className="text-sm text-muted-foreground">{compressionRate}%</span>
              </div>
              <Slider
                id="compressionRate"
                min={10}
                max={90}
                step={5}
                value={[compressionRate]}
                onValueChange={(value) => setCompressionRate(value[0])}
              />
            </motion.div>
          )}
        </div>
      ),
    },
    {
      id: "advanced",
      label: (
        <div className="flex items-center gap-1.5">
          <Settings className="h-3.5 w-3.5" />
          <span>Advanced</span>
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="latency">Network Latency (ms)</Label>
              <span className="text-sm text-muted-foreground">{networkLatency} ms</span>
            </div>
            <Slider
              id="latency"
              min={5}
              max={500}
              step={5}
              value={[networkLatency]}
              onValueChange={(value) => setNetworkLatency(value[0])}
            />
          </div>
          <div className="space-y-2">
            <Label>Connection Type</Label>
            <div className="flex space-x-2">
              <Button
                variant={connectionType === "wifi" ? "default" : "outline"}
                size="sm"
                onClick={() => setConnectionType("wifi")}
                className="flex-1"
              >
                <Wifi className="mr-2 h-4 w-4" />
                Wi-Fi
              </Button>
              <Button
                variant={connectionType === "ethernet" ? "default" : "outline"}
                size="sm"
                onClick={() => setConnectionType("ethernet")}
                className="flex-1"
              >
                <Network className="mr-2 h-4 w-4" />
                Ethernet
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Transfer Type</Label>
            <div className="flex space-x-2">
              <Button
                variant={transferType === "direct" ? "default" : "outline"}
                size="sm"
                onClick={() => setTransferType("direct")}
                className="flex-1"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Direct
              </Button>
              <Button
                variant={transferType === "p2p" ? "default" : "outline"}
                size="sm"
                onClick={() => setTransferType("p2p")}
                className="flex-1"
              >
                <Network className="mr-2 h-4 w-4" />
                Peer-to-Peer
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="vpn" checked={isVpnEnabled} onCheckedChange={setIsVpnEnabled} />
            <Label htmlFor="vpn">VPN Enabled</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cloudProvider">Cloud Provider</Label>
            <select
              id="cloudProvider"
              value={cloudProvider}
              onChange={(e) => setCloudProvider(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2"
            >
              <option value="none">None</option>
              <option value="google-drive">Google Drive</option>
              <option value="aws-s3">AWS S3</option>
              <option value="onedrive">OneDrive</option>
            </select>
          </div>
        </div>
      ),
    },
  ]

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
          <Clock className="h-5 w-5 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold">File Transfer Estimator</h2>
          <p className="text-muted-foreground">
            Calculate how long it will take to transfer files based on your connection speed
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <AnimatedCard delay={1} title={""}>
            <CardHeader>
              <CardTitle>Select Files</CardTitle>
              <CardDescription>Choose files to estimate transfer time</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`border-2 border-dashed rounded-md p-8 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Drag and drop files here, or click to select files</p>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mt-4">
                    Select Files
                  </Button>
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <h3 className="text-sm font-medium mb-2">Selected Files:</h3>
                    <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                      <ul className="space-y-1">
                        {files.map((file, index) => (
                          <motion.li 
                            key={index} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center text-sm"
                          >
                            {getFileIcon(file.type)}
                            <span className="ml-2 truncate">
                              {file.name} - {convertFromBytes(file.size).size.toFixed(2)}{" "}
                              {convertFromBytes(file.size).unit}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Total size:{" "}
                      {convertFromBytes(
                        files.reduce((sum, file) => sum + convertToBytes(file.size, file.unit), 0),
                      ).size.toFixed(2)}{" "}
                      {convertFromBytes(files.reduce((sum, file) => sum + convertToBytes(file.size, file.unit), 0)).unit}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={2} children={undefined} title={""}>
            <CardHeader>
              <CardTitle>Connection Settings</CardTitle>
              <CardDescription>Configure your network parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatedTabs defaultTab="basic" onChange={setActiveTab} variant="pills">
                {tabsContent.map((tab) => (
                  <div key={tab.id} id={tab.id} label={tab.label}>
                    {tab.content}
                  </div>
                ))}
              </AnimatedTabs>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleEstimate} 
                disabled={files.length === 0 || isCalculating} 
                className="w-full relative overflow-hidden group"
              >
                {isCalculating ? (
                  <span className="flex items-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-2"
                    >
                      <BarChart2 className="h-4 w-4" />
                    </motion.span>
                    Calculating...
                  </span>
                ) : (
                  <span>Calculate Transfer Times</span>
                )}
                <motion.span 
                  className="absolute bottom-0 left-0 h-1 bg-white/20"
                  initial={{ width: 0 }}
                  animate={{ width: isCalculating ? "100%" : 0 }}
                  transition={{ duration: 1.5 }}
                />
              </Button>
            </CardFooter>
          </AnimatedCard>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {showResults && (
              <AnimatedCard delay={3} hoverEffect="glow">
                <CardHeader>
                  <CardTitle>Estimated Transfer Times</CardTitle>
                  <CardDescription>Based on your connection and file selection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">Download</h3>
                      </div>
                      <p className="text-2xl font-bold">{formatTime(downloadTime)}</p>
                      <AnimatedProgress value={(downloadTime / (downloadTime + uploadTime + cloudUploadTime)) * 100} variant="default" size="sm" delay={1} />
                    </motion.div>
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">Upload</h3>
                      </div>
                      <p className="text-2xl font-bold">{formatTime(uploadTime)}</p>
                      <AnimatedProgress value={(uploadTime / (downloadTime + uploadTime + cloudUploadTime)) * 100} variant="success" size="sm" delay={2} />
                    </motion.div>
                  </motion.div>

                  {cloudProvider !== "none" && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">Cloud Upload ({cloudProvider})</h3>
                      </div>
                      <p className="text-2xl font-bold">{formatTime(cloudUploadTime)}</p>
                      <AnimatedProgress value={(cloudUploadTime / (downloadTime + uploadTime + cloudUploadTime)) * 100} variant="warning" size="sm" delay={3} />
                    </motion.div>
                  )}

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="pt-4"
                  >
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: "Time (seconds)", angle: -90, position: "insideLeft" }} />
                        <Tooltip formatter={(value) => [typeof value === "number" ? `${value.toFixed(2)} seconds` : value, "Time"]} />
                        <Bar dataKey="time" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-2 pt-2"
                  >
                    <h3 className="text-sm font-medium">Transfer Summary</h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Total Size:</span>{" "}
                        {convertFromBytes(
                          files.reduce((sum, file) => sum + convertToBytes(file.size, file.unit), 0) *
                            (compressionEnabled ? 1 - compressionRate / 100 : 1),
                        ).size.toFixed(2)}{" "}
                        {
                          convertFromBytes(
                            files.reduce((sum, file) => sum + convertToBytes(file.size, file.unit), 0) *
                              (compressionEnabled ? 1 - compressionRate / 100 : 1),
                          ).unit
                        }
                        {compressionEnabled && ` (${compressionRate}% compressed)`}
                      </p>
                      <p>
                        <span className="font-medium">Connection:</span>{" "}
                        {connectionType === "wifi" ? "Wi-Fi" : "Ethernet"}
                        {isVpnEnabled && " with VPN"}
                      </p>
                      <p>
                        <span className="font-medium">Effective Speed:</span> ↓{" "}
                        {(downloadSpeed * (connectionType === "ethernet" ? 1.2 : 1) * (isVpnEnabled ? 0.9 : 1)).toFixed(
                          1,
                        )}{" "}
                        Mbps, ↑{" "}
                        {(uploadSpeed * (connectionType === "ethernet" ? 1.2 : 1) * (isVpnEnabled ? 0.9 : 1)).toFixed(1)}{" "}
                        Mbps
                      </p>
                    </div>
                  </motion.div>
                </CardContent>
              </AnimatedCard>
            )}
          </AnimatePresence>

          <AnimatedCard delay={4} hoverEffect="border">
            <CardHeader>
              <CardTitle>Tips for Faster Transfers</CardTitle>
              <CardDescription>Optimize your file transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Use compression for text files, images, and documents to reduce transfer size",
                  "Ethernet connections are typically more stable and faster than Wi-Fi",
                  "VPNs can reduce transfer speeds by 10-20% due to encryption overhead",
                  "For large files, consider splitting them into smaller chunks for more reliable transfers",
                  "Cloud storage services may throttle bandwidth for large uploads"
                ].map((tip, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <Shield className="h-4 w-4 text-primary mt-1" />
                    <span className="text-sm">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}
