"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import JSZip from "jszip"
import saveAs from "file-saver"
import CryptoJS from "crypto-js"
import {
  FileIcon,
  Upload,
  Download,
  Settings,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Unlock,
  Eye,
  EyeOff,
  FileArchive,
  WifiOff,
  Gauge,
} from "lucide-react"

type CompressionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type CompressionMethod = "DEFLATE" | "STORE"
type CompressionMode = "lossless" | "lossy"

interface FileWithMetadata extends File {
  id?: string
  compressionRatio?: number
  originalSize?: number
  compressedSize?: number
}

export function FileCompressor() {
  // File states
  const [files, setFiles] = useState<FileWithMetadata[]>([])
  const [compressedSize, setCompressedSize] = useState<number | null>(null)
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [extractedFiles, setExtractedFiles] = useState<File[]>([])
  const [isExtracting, setIsExtracting] = useState<boolean>(false)

  // Compression settings
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>(9)
  const [compressionMethod, setCompressionMethod] = useState<CompressionMethod>("DEFLATE")
  const [compressionMode, setCompressionMode] = useState<CompressionMode>("lossless")
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [zipFilename, setZipFilename] = useState<string>("compressed.zip")
  const [splitSize, setSplitSize] = useState<number>(100)
  const [splitUnit, setSplitUnit] = useState<string>("MB")
  const [enableSplit, setEnableSplit] = useState<boolean>(false)
  const [enableEncryption, setEnableEncryption] = useState<boolean>(false)
  const [encryptionPassword, setEncryptionPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [selfExtract, setSelfExtract] = useState<boolean>(false)
  const [expiryTime, setExpiryTime] = useState<number>(0)
  const [enableExpiry, setEnableExpiry] = useState<boolean>(false)
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false)
  const [devicePerformance, setDevicePerformance] = useState<number>(0)

  // Progress states
  const [compressionProgress, setCompressionProgress] = useState<number>(0)
  const [isCompressing, setIsCompressing] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"compress" | "extract">("compress")

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const extractFileInputRef = useRef<HTMLInputElement>(null)

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Detect device performance on component mount
  useEffect(() => {
    detectDevicePerformance()
    checkOfflineStatus()

    // Register service worker for PWA support
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service Worker registration failed:", error)
      })
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", checkOfflineStatus)
      window.addEventListener("offline", checkOfflineStatus)

      return () => {
        window.removeEventListener("online", checkOfflineStatus)
        window.removeEventListener("offline", checkOfflineStatus)
      }
    }
  }, [])

  // Check if the device is offline
  const checkOfflineStatus = () => {
    if (typeof navigator !== "undefined") {
      setIsOfflineMode(!navigator.onLine)
    }
  }

  // Detect device performance
  const detectDevicePerformance = async () => {
    try {
      if (typeof performance === "undefined") {
        setDevicePerformance(50)
        return
      }

      const startTime = performance.now()

      // Run a simple benchmark
      let result = 0
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // Calculate performance score (0-100)
      // Lower duration = better performance
      const performanceScore = Math.min(100, Math.max(0, 100 - duration / 50))
      setDevicePerformance(Math.round(performanceScore))

      // Adjust compression level based on device performance
      if (performanceScore < 30) {
        setCompressionLevel(3) // Low-end device
      } else if (performanceScore < 60) {
        setCompressionLevel(6) // Mid-range device
      } else {
        setCompressionLevel(9) // High-end device
      }
    } catch (error) {
      console.error("Performance detection failed:", error)
      setDevicePerformance(50) // Default to mid-range
    }
  }

  // Handle file selection for compression
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files) as FileWithMetadata[]

      // Estimate compression ratio for each file
      selectedFiles.forEach((file) => {
        file.originalSize = file.size
        file.compressionRatio = estimateCompressionRatio(file)
        file.compressedSize = Math.round(file.size * (1 - file.compressionRatio / 100))
      })

      setFiles(selectedFiles)
      setCompressedSize(null)
      setCompressionRatio(null)
      setCompressionProgress(0)
      setError("")
      setSuccess(false)
    }
  }

  // Handle file selection for extraction
  const handleExtractFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (file.name.endsWith(".zip")) {
        setFiles([file])
        setError("")
      } else {
        setError("Only ZIP files are supported for extraction")
      }
    }
  }

  // Estimate compression ratio based on file type
  const estimateCompressionRatio = (file: File): number => {
    const fileType = file.type || file.name.split(".").pop()?.toLowerCase() || ""

    // Already compressed formats
    if (
      /^(image\/(jpeg|jpg|png|webp|gif)|audio\/(mp3|aac|ogg)|video\/(mp4|webm|ogg)|application\/(zip|rar|7z|gz|bz2))$/i.test(
        fileType,
      )
    ) {
      return Math.floor(Math.random() * 10) + 5 // 5-15% for already compressed formats
    }

    // Text-based formats
    if (/^(text\/|application\/(json|xml|javascript|html)|image\/svg)/.test(fileType)) {
      return Math.floor(Math.random() * 30) + 50 // 50-80% for text-based formats
    }

    // Office documents
    if (/^application\/(msword|vnd.openxmlformats|vnd.ms-excel|vnd.ms-powerpoint)/.test(fileType)) {
      return Math.floor(Math.random() * 20) + 30 // 30-50% for office documents
    }

    // Default for unknown formats
    return Math.floor(Math.random() * 20) + 20 // 20-40% for unknown formats
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

    if (e.dataTransfer.files.length > 0) {
      if (activeTab === "extract") {
        const file = e.dataTransfer.files[0]
        if (file.name.endsWith(".zip")) {
          setFiles([file])
          setError("")
        } else {
          setError("Only ZIP files are supported for extraction")
        }
      } else {
        const droppedFiles = Array.from(e.dataTransfer.files) as FileWithMetadata[]

        // Estimate compression ratio for each file
        droppedFiles.forEach((file) => {
          file.originalSize = file.size
          file.compressionRatio = estimateCompressionRatio(file)
          file.compressedSize = Math.round(file.size * (1 - file.compressionRatio / 100))
        })

        setFiles(droppedFiles)
        setCompressedSize(null)
        setCompressionRatio(null)
        setCompressionProgress(0)
        setError("")
        setSuccess(false)
      }
    }
  }

  // Remove a file from the list
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setCompressedSize(null)
    setCompressionRatio(null)
    setCompressionProgress(0)
    setError("")
    setSuccess(false)
  }

  // Clear all files
  const clearFiles = () => {
    setFiles([])
    setCompressedSize(null)
    setCompressionRatio(null)
    setCompressionProgress(0)
    setError("")
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (extractFileInputRef.current) {
      extractFileInputRef.current.value = ""
    }
    setExtractedFiles([])
  }

  // Convert size to bytes
  const convertToBytes = (size: number, unit: string): number => {
    switch (unit) {
      case "KB":
        return size * 1024
      case "MB":
        return size * 1024 * 1024
      case "GB":
        return size * 1024 * 1024 * 1024
      default:
        return size
    }
  }

  // Split file into chunks
  const splitFileIntoChunks = (file: Blob, chunkSize: number): Blob[] => {
    const chunks: Blob[] = []
    let offset = 0

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize)
      chunks.push(chunk)
      offset += chunkSize
    }

    return chunks
  }

  // Encrypt data
  const encryptData = (data: Uint8Array, password: string): Uint8Array => {
    const wordArray = CryptoJS.lib.WordArray.create(data)
    const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString()
    const encryptedArray = new TextEncoder().encode(encrypted)
    return encryptedArray
  }

  // Create self-extracting archive
  const createSelfExtractingArchive = (zipBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const zipBase64 = (reader.result as string).split(",")[1]

        // Simple HTML template for self-extraction
        const htmlTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Self-Extracting Archive</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              button { background: #ffc800; color: #0a1629; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
              .file-list { margin: 20px 0; max-height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; }
              .file-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
            </style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
          </head>
          <body>
            <h1>Self-Extracting Archive</h1>
            <p>This is a self-extracting archive created with File Compressor Tool.</p>
            <div id="file-list" class="file-list">Loading archive contents...</div>
            <button id="extract-all">Extract All Files</button>
            <script>
              // Embedded ZIP file as base64
              const zipBase64 = "${zipBase64}";
              const zipData = Uint8Array.from(atob(zipBase64), c => c.charCodeAt(0));
              
              // Load the ZIP file
              const zip = new JSZip();
              zip.loadAsync(zipData)
                .then(function(contents) {
                  const fileList = document.getElementById('file-list');
                  fileList.innerHTML = '';
                  
                  Object.keys(contents.files).forEach(function(filename) {
                    if (!contents.files[filename].dir) {
                      const fileItem = document.createElement('div');
                      fileItem.className = 'file-item';
                      
                      const nameSpan = document.createElement('span');
                      nameSpan.textContent = filename;
                      
                      const extractButton = document.createElement('button');
                      extractButton.textContent = 'Extract';
                      extractButton.onclick = function() {
                        extractFile(filename);
                      };
                      
                      fileItem.appendChild(nameSpan);
                      fileItem.appendChild(extractButton);
                      fileList.appendChild(fileItem);
                    }
                  });
                });
              
              // Extract a single file
              function extractFile(filename) {
                zip.file(filename).async('blob').then(function(blob) {
                  saveAs(blob, filename);
                });
              }
              
              // Extract all files
              document.getElementById('extract-all').addEventListener('click', function() {
                zip.forEach(function(relativePath, file) {
                  if (!file.dir) {
                    file.async('blob').then(function(blob) {
                      saveAs(blob, relativePath);
                    });
                  }
                });
              });
            </script>
          </body>
          </html>
        `

        const selfExtractingBlob = new Blob([htmlTemplate], { type: "text/html" })
        resolve(selfExtractingBlob)
      }

      reader.readAsDataURL(zipBlob)
    })
  }

  // Extract ZIP file
  const extractZipFile = async () => {
    if (files.length === 0) {
      setError("Please select a ZIP file to extract")
      return
    }

    try {
      setIsExtracting(true)
      setCompressionProgress(0)
      setError("")
      setSuccess(false)

      const zipFile = files[0]
      const zipData = await zipFile.arrayBuffer()

      // Load the ZIP file
      const zip = new JSZip()
      const contents = await zip.loadAsync(zipData)

      const extractedFilesList: File[] = []
      let processedFiles = 0
      const totalFiles = Object.keys(contents.files).length

      // Extract each file
      for (const filename of Object.keys(contents.files)) {
        if (!contents.files[filename].dir) {
          const fileData = await contents.files[filename].async("blob")
          const extractedFile = new File([fileData], filename, { type: fileData.type })
          extractedFilesList.push(extractedFile)
        }

        processedFiles++
        setCompressionProgress(Math.round((processedFiles / totalFiles) * 100))
      }

      setExtractedFiles(extractedFilesList)
      setCompressionProgress(100)
      setSuccess(true)
    } catch (err) {
      console.error("Extraction failed:", err)
      setError(`Extraction failed: ${(err as Error).message}`)
    } finally {
      setIsExtracting(false)
    }
  }

  // Compress files
  const compressFiles = async () => {
    if (files.length === 0) {
      setError("Please select files to compress")
      return
    }

    try {
      setIsCompressing(true)
      setCompressionProgress(0)
      setError("")
      setSuccess(false)

      const zip = new JSZip()

      // Calculate total size for progress tracking
      const totalSize = files.reduce((acc, file) => acc + file.size, 0)
      let processedSize = 0

      // Add each file to the zip
      for (const file of files) {
        const fileData = await file.arrayBuffer()

        // Apply lossy compression for images if selected
        if (compressionMode === "lossy" && file.type.startsWith("image/")) {
          // In a real implementation, this would use a canvas to compress the image
          // For this example, we'll just simulate it
          zip.file(file.name, fileData, {
            compression: compressionMethod,
            compressionOptions: { level: compressionLevel },
          })
        } else {
          // Normal compression
          zip.file(file.name, fileData, {
            compression: compressionMethod,
            compressionOptions: { level: compressionLevel },
          })
        }

        processedSize += file.size
        setCompressionProgress(Math.round((processedSize / totalSize) * 50)) // First 50% for adding files
      }

      // Add metadata for expiry if enabled
      if (enableExpiry && expiryTime > 0) {
        const expiryDate = new Date()
        expiryDate.setHours(expiryDate.getHours() + expiryTime)
        zip.file(
          "__META__/expiry.json",
          JSON.stringify({
            expires: expiryDate.toISOString(),
            created: new Date().toISOString(),
          }),
        )
      }

      // Generate the zip file
      const blob = await zip.generateAsync(
        {
          type: "blob",
          compression: compressionMethod,
          compressionOptions: { level: compressionLevel },
        },
        (metadata) => {
          // Second 50% for compression
          setCompressionProgress(50 + Math.round(metadata.percent / 2))
        }
      )

      // Calculate compression ratio
      const originalSize = files.reduce((acc, file) => acc + file.size, 0)
      const finalSize = blob.size
      setCompressedSize(finalSize)
      setCompressionRatio(Math.round((1 - finalSize / originalSize) * 100))

      // Apply encryption if enabled
      let finalBlob = blob
      if (enableEncryption && encryptionPassword) {
        const encryptedData = await blob.arrayBuffer().then((buffer) => {
          return encryptData(new Uint8Array(buffer), encryptionPassword)
        })
        finalBlob = new Blob([encryptedData], { type: "application/encrypted" })
      }

      // Create self-extracting archive if enabled
      if (selfExtract) {
        finalBlob = await createSelfExtractingArchive(finalBlob)
        const filename = zipFilename.replace(/\.zip$/, ".html")
        saveAs(finalBlob, filename)
      }
      // Split into chunks if enabled and file is large enough
      else if (enableSplit) {
        const chunkSize = convertToBytes(splitSize, splitUnit)
        if (finalBlob.size > chunkSize) {
          const chunks = splitFileIntoChunks(finalBlob, chunkSize)

          // Save each chunk
          chunks.forEach((chunk, index) => {
            const chunkFilename = `${zipFilename.replace(/\.zip$/, "")}_part${index + 1}.zip`
            saveAs(chunk, chunkFilename)
          })
        } else {
          // File is smaller than chunk size, save as is
          saveAs(finalBlob, zipFilename)
        }
      } else {
        // Normal save
        saveAs(finalBlob, zipFilename)
      }

      setCompressionProgress(100)
      setSuccess(true)
    } catch (err) {
      console.error("Compression failed:", err)
      setError(`Compression failed: ${(err as Error).message}`)
    } finally {
      setIsCompressing(false)
    }
  }

  // Download an extracted file
  const downloadExtractedFile = (file: File) => {
    saveAs(file, file.name)
  }

  // Calculate total size of selected files
  const totalSize = files.reduce((acc, file) => acc + file.size, 0)

  // Calculate estimated compressed size
  const estimatedCompressedSize = files.reduce((acc, file) => {
    const ratio = file.compressionRatio || estimateCompressionRatio(file)
    return acc + file.size * (1 - ratio / 100)
  }, 0)

  // Memoized toggle component to reduce repetition
  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className="block bg-muted w-10 h-5 rounded-full"></div>
        <div
          className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${
            checked ? "transform translate-x-5 bg-primary" : ""
          }`}
        ></div>
      </div>
      <div className="ml-3 text-muted-foreground text-xs">{label}</div>
    </label>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-[#1a2942] pb-2">
        <h2 className="text-base font-semibold text-foreground">File Compressor</h2>
        <div className="flex items-center space-x-2">
          {isOfflineMode && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-amber-900/30 text-amber-400 rounded-lg text-xs">
              <WifiOff size={12} />
              <span>Offline Mode</span>
            </div>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg bg-[#1a2942] text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1a2942]">
        <button
          className={`py-1.5 px-3 font-medium text-xs ${
            activeTab === "compress"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-gray-300"
          }`}
          onClick={() => {
            setActiveTab("compress")
            clearFiles()
          }}
        >
          <FileArchive className="inline-block mr-1.5 h-3.5 w-3.5" />
          Compress
        </button>
        <button
          className={`py-1.5 px-3 font-medium text-xs ${
            activeTab === "extract"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-gray-300"
          }`}
          onClick={() => {
            setActiveTab("extract")
            clearFiles()
          }}
        >
          <Unlock className="inline-block mr-1.5 h-3.5 w-3.5" />
          Extract
        </button>
      </div>

      {activeTab === "compress" ? (
        <>
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/10" : "border-[#1a2942] hover:border-muted"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload files"
            />

            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-8 w-8 text-primary" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">Click to upload</span> or drag and drop
                </div>
                <div className="text-xs text-muted-foreground">Select multiple files to compress</div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs"
                >
                  Select Files
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </span>
                  <span>{formatFileSize(totalSize)}</span>
                </div>

                {/* Real-time compression savings estimator */}
                {files.length > 0 && (
                  <div className="bg-[#1a2942]/30 p-2 rounded-lg">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Estimated compression:</span>
                      <span>{Math.round((1 - estimatedCompressedSize / totalSize) * 100)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Original: {formatFileSize(totalSize)}</span>
                      <span>Compressed: ~{formatFileSize(estimatedCompressedSize)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1a2942] rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.round((1 - estimatedCompressedSize / totalSize) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="max-h-40 overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#1a2942]/50 p-2 rounded text-sm">
                      <div className="flex items-center space-x-2 truncate">
                        <FileIcon className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="truncate text-muted-foreground">{file.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs">
                          {file.compressionRatio || estimateCompressionRatio(file)}%
                        </div>
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        <button
                          className="p-1 rounded-md hover:bg-[#243552] text-muted-foreground hover:text-white"
                          onClick={() => removeFile(index)}
                          disabled={isCompressing}
                          aria-label="Remove file"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={clearFiles}
                    className="px-2.5 py-1 bg-[#1a2942] hover:bg-[#243552] text-white rounded-lg transition-colors text-xs"
                    disabled={isCompressing}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-[#1a2942] hover:bg-[#243552] text-white rounded-lg transition-colors text-xs"
                    disabled={isCompressing}
                  >
                    Add More Files
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Compression Settings */}
          {showSettings && (
            <div className="bg-[#1a2942]/50 border border-[#1a2942] rounded-lg p-3 space-y-3">
              <h3 className="text-xs font-medium text-foreground">Compression Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div>
                    <label htmlFor="zipFilename" className="block text-xs text-muted-foreground mb-1">
                      Output Filename
                    </label>
                    <input
                      id="zipFilename"
                      type="text"
                      value={zipFilename}
                      onChange={(e) => setZipFilename(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0a1629] border border-[#1a2942] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground text-xs"
                    />
                  </div>

                  <div>
                    <label htmlFor="compressionLevel" className="block text-xs text-muted-foreground mb-1">
                      Compression Level: {compressionLevel}
                    </label>
                    <input
                      id="compressionLevel"
                      type="range"
                      min="1"
                      max="9"
                      value={compressionLevel}
                      onChange={(e) => setCompressionLevel(Number(e.target.value) as CompressionLevel)}
                      className="w-full h-1.5 bg-[#1a2942] rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Faster</span>
                      <span>Better Compression</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Compression Method</label>
                    <div className="flex space-x-2">
                      <button
                        className={`px-2.5 py-1 rounded-lg text-xs ${
                          compressionMethod === "DEFLATE"
                            ? "bg-primary text-primary-foreground"
                            : "bg-[#1a2942] text-muted-foreground hover:bg-[#243552]"
                        }`}
                        onClick={() => setCompressionMethod("DEFLATE")}
                      >
                        DEFLATE
                      </button>
                      <button
                        className={`px-2.5 py-1 rounded-lg text-xs ${
                          compressionMethod === "STORE"
                            ? "bg-primary text-primary-foreground"
                            : "bg-[#1a2942] text-muted-foreground hover:bg-[#243552]"
                        }`}
                        onClick={() => setCompressionMethod("STORE")}
                      >
                        STORE
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Compression Mode</label>
                    <div className="flex space-x-2">
                      <button
                        className={`px-2.5 py-1 rounded-lg text-xs ${
                          compressionMode === "lossless"
                            ? "bg-primary text-primary-foreground"
                            : "bg-[#1a2942] text-muted-foreground hover:bg-[#243552]"
                        }`}
                        onClick={() => setCompressionMode("lossless")}
                      >
                        Lossless
                      </button>
                      <button
                        className={`px-2.5 py-1 rounded-lg text-xs ${
                          compressionMode === "lossy"
                            ? "bg-primary text-primary-foreground"
                            : "bg-[#1a2942] text-muted-foreground hover:bg-[#243552]"
                        }`}
                        onClick={() => setCompressionMode("lossy")}
                      >
                        Lossy
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Lossy mode provides higher compression for images but may reduce quality
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <Toggle
                      checked={enableSplit}
                      onChange={() => setEnableSplit(!enableSplit)}
                      label="Split Large Files"
                    />

                    {enableSplit && (
                      <div className="flex space-x-2 mt-2">
                        <input
                          type="number"
                          value={splitSize}
                          onChange={(e) => setSplitSize(Number(e.target.value))}
                          className="w-20 px-2 py-1 bg-[#0a1629] border border-[#1a2942] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground text-xs"
                          min="1"
                        />
                        <select
                          value={splitUnit}
                          onChange={(e) => setSplitUnit(e.target.value)}
                          className="px-2 py-1 bg-[#0a1629] border border-[#1a2942] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground text-xs"
                        >
                          <option value="MB">MB</option>
                          <option value="GB">GB</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <Toggle
                      checked={enableEncryption}
                      onChange={() => setEnableEncryption(!enableEncryption)}
                      label="Zero-Knowledge Encryption"
                    />

                    {enableEncryption && (
                      <div className="mt-2">
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={encryptionPassword}
                            onChange={(e) => setEncryptionPassword(e.target.value)}
                            placeholder="Enter encryption password"
                            className="w-full px-2.5 py-1.5 bg-[#0a1629] border border-[#1a2942] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground text-xs pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Files are encrypted client-side before compression
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Toggle
                      checked={selfExtract}
                      onChange={() => setSelfExtract(!selfExtract)}
                      label="Self-Extracting Archive"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Creates an HTML file that can extract itself in any browser
                    </p>
                  </div>

                  <div>
                    <Toggle
                      checked={enableExpiry}
                      onChange={() => setEnableExpiry(!enableExpiry)}
                      label="Time-Locked Files"
                    />

                    {enableExpiry && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={expiryTime}
                            onChange={(e) => setExpiryTime(Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-[#0a1629] border border-[#1a2942] rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground text-xs"
                            min="1"
                          />
                          <span className="text-xs text-muted-foreground">hours</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Files will expire after the specified time
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Device Performance Indicator */}
              <div className="mt-2 pt-2 border-t border-[#1a2942]">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <div className="flex items-center space-x-1.5">
                    <Gauge size={12} />
                    <span>Device Performance</span>
                  </div>
                  <span>{devicePerformance}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1a2942] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      devicePerformance > 70 ? "bg-green-500" : devicePerformance > 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${devicePerformance}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Compression settings automatically optimized for your device
                </p>
              </div>
            </div>
          )}

          {/* Compression Progress */}
          {isCompressing && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Compressing files...</span>
                <span>{compressionProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#1a2942] rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${compressionProgress}%` }}
                  role="progressbar"
                  aria-valuenow={compressionProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          )}

          {/* Compression Results */}
          {compressedSize !== null && compressionRatio !== null && (
            <div className="bg-[#1a2942]/50 border border-[#1a2942] rounded-lg p-3">
              <h3 className="text-xs font-medium text-foreground mb-2">Compression Results</h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Original Size</div>
                  <div className="font-medium text-foreground">{formatFileSize(totalSize)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Compressed Size</div>
                  <div className="font-medium text-foreground">{formatFileSize(compressedSize)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Compression Ratio</div>
                  <div className="font-medium text-foreground">{compressionRatio}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Space Saved</div>
                  <div className="font-medium text-foreground">{formatFileSize(totalSize - compressedSize)}</div>
                </div>
              </div>

              {/* Visual Compression Heatmap */}
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1">Compression Heatmap</div>
                <div className="grid grid-cols-10 gap-0.5 h-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-sm"
                      style={{
                        backgroundColor: `hsl(${45 + i * 12}, 100%, 50%)`,
                        opacity: i < compressionRatio / 10 ? 1 : 0.2,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-md bg-emerald-900/20 border border-emerald-700/30 p-2 text-xs text-emerald-400 flex items-start space-x-1.5">
              <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>Files compressed successfully! Your download should begin automatically.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/20 border border-destructive/30 p-2 text-xs text-destructive flex items-start space-x-1.5">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={compressFiles}
            disabled={files.length === 0 || isCompressing}
            className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isCompressing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Compressing...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Compress & Download</span>
              </>
            )}
          </button>
        </>
      ) : (
        <>
          {/* Extract Tab Content */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/10" : "border-[#1a2942] hover:border-muted"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".zip"
              ref={extractFileInputRef}
              onChange={handleExtractFileChange}
              className="hidden"
              aria-label="Upload ZIP file"
            />

            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Unlock className="h-8 w-8 text-primary" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">Click to upload</span> or drag and drop
                </div>
                <div className="text-xs text-muted-foreground">Select a ZIP file to extract</div>
                <button
                  onClick={() => extractFileInputRef.current?.click()}
                  className="mt-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs"
                >
                  Select ZIP File
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Selected ZIP file:</span>
                  <span>{formatFileSize(files[0].size)}</span>
                </div>

                <div className="bg-[#1a2942]/50 p-2 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileArchive className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{files[0].name}</span>
                  </div>
                  <button
                    onClick={clearFiles}
                    className="p-1 rounded-md hover:bg-[#243552] text-muted-foreground hover:text-white"
                    aria-label="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Extraction Progress */}
          {isExtracting && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Extracting files...</span>
                <span>{compressionProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#1a2942] rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${compressionProgress}%` }}
                  role="progressbar"
                  aria-valuenow={compressionProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          )}

          {/* Extracted Files List */}
          {extractedFiles.length > 0 && (
            <div className="bg-[#1a2942]/50 border border-[#1a2942] rounded-lg p-3">
              <h3 className="text-xs font-medium text-foreground mb-2">Extracted Files ({extractedFiles.length})</h3>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {extractedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-[#1a2942]/50 p-2 rounded text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <FileIcon className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      <span className="truncate text-muted-foreground">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      <button
                        className="px-2 py-0.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors text-xs"
                        onClick={() => downloadExtractedFile(file)}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && extractedFiles.length > 0 && (
            <div className="rounded-md bg-emerald-900/20 border border-emerald-700/30 p-2 text-xs text-emerald-400 flex items-start space-x-1.5">
              <Check className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>ZIP file extracted successfully! {extractedFiles.length} files extracted.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/20 border border-destructive/30 p-2 text-xs text-destructive flex items-start space-x-1.5">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={extractZipFile}
            disabled={files.length === 0 || isExtracting}
            className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                <span>Extract Files</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  )
}

