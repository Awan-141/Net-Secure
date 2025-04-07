"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Loader2,
  Download,
  Upload,
  Code,
  FileCode,
  Copy,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  RefreshCw,
  Zap,
  Shield,
  Info,
  FileUp,
  FileDown,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Wand2,
  BarChart,
} from "lucide-react"
import { obfuscateCode, deobfuscateCode } from "@/app/actions/code-processor"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type FileType = "js" | "ts" | "jsx" | "tsx" | "html" | "css"

type ObfuscationLevel = "low" | "medium" | "high" | "extreme" | "custom"

type ObfuscationOptions = {
  compact: boolean
  controlFlowFlattening: boolean
  controlFlowFlatteningThreshold: number
  deadCodeInjection: boolean
  deadCodeInjectionThreshold: number
  debugProtection: boolean
  disableConsoleOutput: boolean
  identifierNamesGenerator: string
  renameGlobals: boolean
  renameProperties: boolean
  rotateStringArray: boolean
  selfDefending: boolean
  shuffleStringArray: boolean
  splitStrings: boolean
  splitStringsChunkLength: number
  stringArray: boolean
  stringArrayEncoding: string[]
  stringArrayThreshold: number
  transformObjectKeys: boolean
  unicodeEscapeSequence: boolean
}

const presetLevels: Record<ObfuscationLevel, Partial<ObfuscationOptions>> = {
  low: {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    stringArray: true,
    stringArrayEncoding: ["none"],
    stringArrayThreshold: 0.25,
    renameProperties: false,
    selfDefending: false,
  },
  medium: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.4,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.2,
    stringArray: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.5,
    renameProperties: false,
    selfDefending: true,
  },
  high: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    stringArray: true,
    stringArrayEncoding: ["rc4"],
    stringArrayThreshold: 0.75,
    renameProperties: true,
    selfDefending: true,
  },
  extreme: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.7,
    debugProtection: true,
    disableConsoleOutput: true,
    identifierNamesGenerator: "hexadecimal",
    renameGlobals: true,
    renameProperties: true,
    rotateStringArray: true,
    selfDefending: true,
    shuffleStringArray: true,
    splitStrings: true,
    splitStringsChunkLength: 3,
    stringArray: true,
    stringArrayEncoding: ["rc4"],
    stringArrayThreshold: 1,
    transformObjectKeys: true,
    unicodeEscapeSequence: true,
  },
  custom: {},
}

const defaultOptions: ObfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  renameProperties: false,
  rotateStringArray: true,
  selfDefending: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayEncoding: ["base64"],
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
}

export function CodeObfuscationTool() {
  const [activeTab, setActiveTab] = useState<"obfuscate" | "deobfuscate">("obfuscate")
  const [inputCode, setInputCode] = useState("")
  const [outputCode, setOutputCode] = useState("")
  const [fileType, setFileType] = useState<FileType>("js")
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [obfuscationLevel, setObfuscationLevel] = useState<ObfuscationLevel>("medium")
  const [options, setOptions] = useState<ObfuscationOptions>(defaultOptions)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [securityScore, setSecurityScore] = useState(0)
  const [codeSize, setCodeSize] = useState({ original: 0, processed: 0 })
  const [processingTime, setProcessingTime] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const [showOriginalCode, setShowOriginalCode] = useState(false)
  const [showProcessedCode, setShowProcessedCode] = useState(true)
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(true)
  const [isResultsExpanded, setIsResultsExpanded] = useState(true)
  const [isInputExpanded, setIsInputExpanded] = useState(true)
  const [isOutputExpanded, setIsOutputExpanded] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState("")
  const [processingSteps, setProcessingSteps] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const outputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Update options when obfuscation level changes
  useEffect(() => {
    if (obfuscationLevel !== "custom") {
      setOptions({
        ...defaultOptions,
        ...presetLevels[obfuscationLevel],
      })
    }
  }, [obfuscationLevel])

  // Calculate security score based on options
  useEffect(() => {
    let score = 0

    // Base score from obfuscation level
    if (obfuscationLevel === "low") score += 20
    else if (obfuscationLevel === "medium") score += 40
    else if (obfuscationLevel === "high") score += 70
    else if (obfuscationLevel === "extreme") score += 90

    // Additional points for specific options
    if (options.controlFlowFlattening) score += options.controlFlowFlatteningThreshold * 20
    if (options.deadCodeInjection) score += options.deadCodeInjectionThreshold * 15
    if (options.stringArray) score += options.stringArrayThreshold * 15
    if (options.selfDefending) score += 10
    if (options.debugProtection) score += 10
    if (options.renameProperties) score += 15

    // Cap at 100
    setSecurityScore(Math.min(Math.round(score), 100))
  }, [options, obfuscationLevel])

  const handleOptionChange = (key: keyof ObfuscationOptions, value: boolean | number | string | string[]) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }))

    // Switch to custom level when options are manually changed
    setObfuscationLevel("custom")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setFileName(file.name)

    // Determine file type from extension
    const extension = file.name.split(".").pop()?.toLowerCase() as FileType
    if (["js", "ts", "jsx", "tsx", "html", "css"].includes(extension)) {
      setFileType(extension)
    }

    // Read file content
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInputCode(content)
      setCodeSize({ ...codeSize, original: new Blob([content]).size })
    }
    reader.readAsText(file)
  }

  const simulateProcessing = () => {
    setIsProcessing(true)
    setProgress(0)

    const steps =
      activeTab === "obfuscate"
        ? [
            "Analyzing code structure...",
            "Preparing transformation patterns...",
            "Applying control flow flattening...",
            "Injecting dead code...",
            "Transforming string literals...",
            "Renaming identifiers...",
            "Applying self-defending mechanisms...",
            "Finalizing obfuscation...",
          ]
        : [
            "Analyzing obfuscated code...",
            "Identifying obfuscation patterns...",
            "Restoring control flow...",
            "Removing dead code...",
            "Decoding string literals...",
            "Restoring identifier names...",
            "Removing protection layers...",
            "Finalizing deobfuscation...",
          ]

    setProcessingSteps(steps)
    setCurrentStep(0)

    let step = 0
    const totalSteps = steps.length

    const interval = setInterval(() => {
      if (step < totalSteps) {
        setProcessingStage(steps[step])
        setCurrentStep(step)
        setProgress(Math.round(((step + 1) / totalSteps) * 100))
        step++
      } else {
        clearInterval(interval)
        setIsProcessing(false)
      }
    }, 400)

    return () => clearInterval(interval)
  }

  const handleProcess = async () => {
    if (!inputCode.trim()) {
      setError(
        activeTab === "obfuscate"
          ? "Please enter or upload code to obfuscate"
          : "Please enter or upload code to deobfuscate",
      )
      return
    }

    setIsLoading(true)
    setError(null)
    setProgress(0)

    const startTime = performance.now()

    // Start the processing animation
    const cleanupAnimation = simulateProcessing()

    try {
      const result =
        activeTab === "obfuscate"
          ? await obfuscateCode({
              code: inputCode,
              fileType,
              options,
            })
          : await deobfuscateCode({
              code: inputCode,
              fileType,
            })

      if (result.error) {
        setError(result.error)
      } else {
        const processedCode = result.processedCode
        setOutputCode(processedCode)

        // Calculate code size
        const originalSize = new Blob([inputCode]).size
        const processedSize = new Blob([processedCode]).size
        setCodeSize({
          original: originalSize,
          processed: processedSize,
        })

        // Calculate processing time
        const endTime = performance.now()
        setProcessingTime(Math.round(endTime - startTime))

        toast({
          title: activeTab === "obfuscate" ? "Obfuscation complete" : "Deobfuscation complete",
          description:
            activeTab === "obfuscate"
              ? "Your code has been successfully obfuscated."
              : "Your code has been successfully deobfuscated.",
        })
      }
    } catch (err) {
      setError(
        `An error occurred during ${activeTab === "obfuscate" ? "obfuscation" : "deobfuscation"}. Please try again.`,
      )
      console.error(err)
    } finally {
      setIsLoading(false)
      setProgress(100)
    }
  }

  const handleCopyToClipboard = () => {
    if (outputCode) {
      navigator.clipboard.writeText(outputCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)

      toast({
        title: "Copied to clipboard",
        description: "The processed code has been copied to your clipboard.",
      })
    }
  }

  const handleDownload = () => {
    if (!outputCode) return

    const blob = new Blob([outputCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url

    // Create download filename
    let downloadName = fileName || `processed.${fileType}`
    if (fileName) {
      const nameParts = fileName.split(".")
      if (nameParts.length > 1) {
        nameParts[nameParts.length - 2] += activeTab === "obfuscate" ? "-obfuscated" : "-deobfuscated"
        downloadName = nameParts.join(".")
      } else {
        downloadName = `${fileName}-${activeTab === "obfuscate" ? "obfuscated" : "deobfuscated"}.${fileType}`
      }
    }

    a.download = downloadName
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast({
      title: "Download started",
      description: `Your ${activeTab === "obfuscate" ? "obfuscated" : "deobfuscated"} code has been downloaded.`,
    })
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as "obfuscate" | "deobfuscate")
    setOutputCode("")
    setError(null)
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  const getCompressionRatio = () => {
    if (codeSize.original === 0 || codeSize.processed === 0) return 0

    if (activeTab === "obfuscate") {
      // For obfuscation, we typically get larger code
      const ratio = (codeSize.processed / codeSize.original) * 100
      return ratio > 100 ? ratio - 100 : 0 // Show as percentage increase
    } else {
      // For deobfuscation, we typically get smaller code
      const ratio = ((codeSize.original - codeSize.processed) / codeSize.original) * 100
      return Math.max(0, ratio) // Show as percentage decrease
    }
  }

  const getScoreColor = () => {
    if (securityScore < 30) return "text-red-500"
    if (securityScore < 60) return "text-yellow-500"
    if (securityScore < 80) return "text-green-500"
    return "text-primary"
  }

  const getScoreLabel = () => {
    if (securityScore < 30) return "Low"
    if (securityScore < 60) return "Medium"
    if (securityScore < 80) return "High"
    return "Extreme"
  }

  const containerClasses = cn("transition-all duration-300", isFullscreen ? "fixed inset-0 z-50 p-4 bg-background" : "")

  return (
    <div className={containerClasses}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              <span>Code {activeTab === "obfuscate" ? "Obfuscator" : "Deobfuscator"}</span>
            </h2>
            <p className="text-muted-foreground">
              {activeTab === "obfuscate"
                ? "Transform your code to make it difficult to understand while preserving functionality"
                : "Restore obfuscated code to a more readable format"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggleFullscreen} className="h-9 w-9">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input and Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Tabs defaultValue="obfuscate" value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="obfuscate" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Obfuscate</span>
                </TabsTrigger>
                <TabsTrigger value="deobfuscate" className="flex items-center gap-2">
                  <Unlock className="h-4 w-4" />
                  <span>Deobfuscate</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Input Section */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileUp className="h-4 w-4 text-primary" />
                    Input Code
                  </CardTitle>
                  <CardDescription>
                    Paste or upload your {activeTab === "obfuscate" ? "original" : "obfuscated"} code
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsInputExpanded(!isInputExpanded)}
                  className="h-8 w-8"
                >
                  {isInputExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </CardHeader>

              {isInputExpanded && (
                <>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Label>File Type:</Label>
                        <Select value={fileType} onValueChange={(value) => setFileType(value as FileType)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select file type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="js">JavaScript (.js)</SelectItem>
                            <SelectItem value="ts">TypeScript (.ts)</SelectItem>
                            <SelectItem value="jsx">React JSX (.jsx)</SelectItem>
                            <SelectItem value="tsx">React TSX (.tsx)</SelectItem>
                            <SelectItem value="html">HTML (.html)</SelectItem>
                            <SelectItem value="css">CSS (.css)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor="file-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 bg-secondary border border-border rounded-md shadow-sm text-sm font-medium text-foreground hover:bg-secondary/80 focus:outline-none"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".js,.ts,.jsx,.tsx,.html,.css"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                    {uploadedFile && (
                      <Alert className="mb-4 bg-green-950/20 border-green-800/30">
                        <FileCode className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-400">
                          Uploaded: {uploadedFile.name} ({formatBytes(uploadedFile.size)})
                        </AlertDescription>
                      </Alert>
                    )}
                    <Textarea
                      ref={inputRef}
                      placeholder={`Paste your ${fileType.toUpperCase()} code here...`}
                      className="min-h-[300px] font-mono text-sm bg-secondary/50 border-secondary"
                      value={inputCode}
                      onChange={(e) => {
                        setInputCode(e.target.value)
                        setCodeSize({ ...codeSize, original: new Blob([e.target.value]).size })
                      }}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <div className="text-sm text-muted-foreground">
                      {inputCode ? `${formatBytes(new Blob([inputCode]).size)}` : "No code entered"}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setInputCode("")
                        setCodeSize({ ...codeSize, original: 0 })
                      }}
                      className="text-sm"
                      disabled={!inputCode}
                    >
                      Clear
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>

            {/* Process Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleProcess}
                className="w-full md:w-auto px-8 py-6 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading || !inputCode}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {activeTab === "obfuscate" ? "Obfuscating..." : "Deobfuscating..."}
                  </>
                ) : (
                  <>
                    {activeTab === "obfuscate" ? (
                      <>
                        <Lock className="mr-2 h-5 w-5" />
                        Obfuscate Code
                      </>
                    ) : (
                      <>
                        <Unlock className="mr-2 h-5 w-5" />
                        Deobfuscate Code
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <Card className="border-primary/20 overflow-hidden">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                        <span className="font-medium">{processingStage}</span>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {progress}%
                      </Badge>
                    </div>

                    <Progress value={progress} className="h-2" />

                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {processingSteps.map((step, index) => (
                        <div
                          key={index}
                          className={cn(
                            "text-xs p-2 rounded border text-center transition-all",
                            index === currentStep
                              ? "border-primary/50 bg-primary/10 text-primary"
                              : index < currentStep
                                ? "border-green-500/20 bg-green-500/5 text-green-400"
                                : "border-border bg-secondary/30 text-muted-foreground",
                          )}
                        >
                          {index < currentStep && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                          {index === currentStep && <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />}
                          Step {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Output Section */}
            {outputCode && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileDown className="h-4 w-4 text-primary" />
                      Output Code
                    </CardTitle>
                    <CardDescription>
                      {activeTab === "obfuscate" ? "Obfuscated" : "Deobfuscated"} result
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={handleCopyToClipboard} className="h-8 w-8">
                            {isCopied ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy to clipboard</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={handleDownload} className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOutputExpanded(!isOutputExpanded)}
                      className="h-8 w-8"
                    >
                      {isOutputExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>

                {isOutputExpanded && (
                  <>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {activeTab === "obfuscate" ? "Obfuscated" : "Deobfuscated"}
                          </Badge>

                          {processingTime > 0 && (
                            <Badge variant="outline" className="bg-secondary text-foreground">
                              <Zap className="h-3 w-3 mr-1 text-primary" />
                              {processingTime}ms
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setShowOriginalCode(!showOriginalCode)}
                          >
                            {showOriginalCode ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                            {showOriginalCode ? "Hide" : "Show"} Original
                          </Button>
                        </div>
                      </div>

                      {/* Side by side comparison when showing original */}
                      {showOriginalCode ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Original Code</Label>
                            <Textarea
                              readOnly
                              value={inputCode}
                              className="min-h-[300px] font-mono text-sm bg-secondary/50 border-secondary"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Processed Code</Label>
                            <Textarea
                              ref={outputRef}
                              readOnly
                              value={outputCode}
                              className="min-h-[300px] font-mono text-sm bg-secondary/50 border-secondary"
                            />
                          </div>
                        </div>
                      ) : (
                        <Textarea
                          ref={outputRef}
                          readOnly
                          value={outputCode}
                          className="min-h-[300px] font-mono text-sm bg-secondary/50 border-secondary"
                        />
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <div className="text-sm text-muted-foreground">{formatBytes(new Blob([outputCode]).size)}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {activeTab === "obfuscate" ? "Size increase:" : "Size reduction:"}
                          <span className={activeTab === "obfuscate" ? "text-yellow-500" : "text-green-500"}>
                            {" "}
                            {getCompressionRatio().toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </CardFooter>
                  </>
                )}
              </Card>
            )}

            {error && (
              <Alert className="mt-4 bg-red-950/20 border-red-800/30">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column - Options */}
          <div className="space-y-6">
            {/* Obfuscation Options */}
            {activeTab === "obfuscate" && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-primary" />
                      Obfuscation Options
                    </CardTitle>
                    <CardDescription>Configure how your code will be obfuscated</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
                    className="h-8 w-8"
                  >
                    {isOptionsExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </CardHeader>

                {isOptionsExpanded && (
                  <CardContent className="space-y-6">
                    {/* Security Score */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium mb-1">Security Level</h4>
                        <p className="text-sm text-muted-foreground">How secure your obfuscated code will be</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getScoreColor()}`}>{securityScore}%</div>
                          <div className="text-xs text-muted-foreground">{getScoreLabel()}</div>
                        </div>
                        <div className="relative w-12 h-12">
                          <svg className="w-12 h-12" viewBox="0 0 36 36">
                            <path
                              className="stroke-muted-foreground/20"
                              fill="none"
                              strokeWidth="3"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={`stroke-primary`}
                              fill="none"
                              strokeWidth="3"
                              strokeDasharray={`${securityScore}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preset Levels */}
                    <div className="space-y-2">
                      <Label>Obfuscation Level</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {(["low", "medium", "high", "extreme"] as const).map((level) => (
                          <Button
                            key={level}
                            variant={obfuscationLevel === level ? "default" : "outline"}
                            className={cn(
                              "h-9 px-2",
                              obfuscationLevel === level && "bg-primary text-primary-foreground",
                            )}
                            onClick={() => setObfuscationLevel(level)}
                          >
                            <span className="capitalize">{level}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Options Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="showAdvanced">Advanced Options</Label>
                        <p className="text-sm text-muted-foreground">Fine-tune obfuscation settings</p>
                      </div>
                      <Switch
                        id="showAdvanced"
                        checked={showAdvancedOptions}
                        onCheckedChange={setShowAdvancedOptions}
                      />
                    </div>

                    {/* Advanced Options */}
                    {showAdvancedOptions && (
                      <div className="space-y-6 pt-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="controlFlowFlattening">Control Flow Flattening</Label>
                            <Switch
                              id="controlFlowFlattening"
                              checked={options.controlFlowFlattening}
                              onCheckedChange={(checked) => handleOptionChange("controlFlowFlattening", checked)}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Makes code harder to follow by flattening control flow statements
                          </p>
                        </div>

                        {options.controlFlowFlattening && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Control Flow Threshold: {options.controlFlowFlatteningThreshold.toFixed(2)}</Label>
                              <span className="text-xs text-muted-foreground">
                                {options.controlFlowFlatteningThreshold < 0.3
                                  ? "Low"
                                  : options.controlFlowFlatteningThreshold < 0.6
                                    ? "Medium"
                                    : options.controlFlowFlatteningThreshold < 0.8
                                      ? "High"
                                      : "Extreme"}
                              </span>
                            </div>
                            <Slider
                              value={[options.controlFlowFlatteningThreshold * 100]}
                              min={0}
                              max={100}
                              step={5}
                              onValueChange={(value) =>
                                handleOptionChange("controlFlowFlatteningThreshold", value[0] / 100)
                              }
                              className="py-2"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="deadCodeInjection">Dead Code Injection</Label>
                            <Switch
                              id="deadCodeInjection"
                              checked={options.deadCodeInjection}
                              onCheckedChange={(checked) => handleOptionChange("deadCodeInjection", checked)}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Adds random dead code to confuse reverse engineering
                          </p>
                        </div>

                        {options.deadCodeInjection && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Dead Code Threshold: {options.deadCodeInjectionThreshold.toFixed(2)}</Label>
                              <span className="text-xs text-muted-foreground">
                                {options.deadCodeInjectionThreshold < 0.3
                                  ? "Low"
                                  : options.deadCodeInjectionThreshold < 0.6
                                    ? "Medium"
                                    : options.deadCodeInjectionThreshold < 0.8
                                      ? "High"
                                      : "Extreme"}
                              </span>
                            </div>
                            <Slider
                              value={[options.deadCodeInjectionThreshold * 100]}
                              min={0}
                              max={100}
                              step={5}
                              onValueChange={(value) =>
                                handleOptionChange("deadCodeInjectionThreshold", value[0] / 100)
                              }
                              className="py-2"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="stringArray">String Array</Label>
                            <Switch
                              id="stringArray"
                              checked={options.stringArray}
                              onCheckedChange={(checked) => handleOptionChange("stringArray", checked)}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Moves string literals to a separate array and replaces with references
                          </p>
                        </div>

                        {options.stringArray && (
                          <>
                            <div className="space-y-2">
                              <Label>String Array Encoding</Label>
                              <Select
                                value={options.stringArrayEncoding[0]}
                                onValueChange={(value) => handleOptionChange("stringArrayEncoding", [value])}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select encoding" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="base64">Base64</SelectItem>
                                  <SelectItem value="rc4">RC4</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>String Array Threshold: {options.stringArrayThreshold.toFixed(2)}</Label>
                                <span className="text-xs text-muted-foreground">
                                  {options.stringArrayThreshold < 0.3
                                    ? "Low"
                                    : options.stringArrayThreshold < 0.6
                                      ? "Medium"
                                      : options.stringArrayThreshold < 0.8
                                        ? "High"
                                        : "Extreme"}
                                </span>
                              </div>
                              <Slider
                                value={[options.stringArrayThreshold * 100]}
                                min={0}
                                max={100}
                                step={5}
                                onValueChange={(value) => handleOptionChange("stringArrayThreshold", value[0] / 100)}
                                className="py-2"
                              />
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="renameProperties">Rename Properties</Label>
                            <Switch
                              id="renameProperties"
                              checked={options.renameProperties}
                              onCheckedChange={(checked) => handleOptionChange("renameProperties", checked)}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">Renames object properties (may break code)</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="selfDefending">Self Defending</Label>
                            <Switch
                              id="selfDefending"
                              checked={options.selfDefending}
                              onCheckedChange={(checked) => handleOptionChange("selfDefending", checked)}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Makes the output resilient against formatting and variable renaming
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="debugProtection">Debug Protection</Label>
                            <Switch
                              id="debugProtection"
                              checked={options.debugProtection}
                              onCheckedChange={(checked) => handleOptionChange("debugProtection", checked)}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Makes it difficult to use browser debugging tools
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Deobfuscation Options */}
            {activeTab === "deobfuscate" && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-primary" />
                    Deobfuscation Options
                  </CardTitle>
                  <CardDescription>Configure how your code will be deobfuscated</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-primary/5 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm">
                      Deobfuscation attempts to restore obfuscated code to a more readable format, but complete
                      restoration may not be possible for heavily obfuscated code.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="beautify">Beautify Code</Label>
                      <Switch id="beautify" checked={true} disabled />
                    </div>
                    <p className="text-sm text-muted-foreground">Format the code with proper indentation and spacing</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="renameVariables">Rename Variables</Label>
                      <Switch id="renameVariables" checked={true} disabled />
                    </div>
                    <p className="text-sm text-muted-foreground">Attempt to give meaningful names to variables</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results and Statistics */}
            {outputCode && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-primary" />
                      Results & Statistics
                    </CardTitle>
                    <CardDescription>Analysis of the processed code</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsResultsExpanded(!isResultsExpanded)}
                    className="h-8 w-8"
                  >
                    {isResultsExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </CardHeader>

                {isResultsExpanded && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Original Size</Label>
                        <div className="text-xl font-semibold">{formatBytes(codeSize.original)}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Processed Size</Label>
                        <div className="text-xl font-semibold">{formatBytes(codeSize.processed)}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs text-muted-foreground">
                          {activeTab === "obfuscate" ? "Size Increase" : "Size Reduction"}
                        </Label>
                        <span className={activeTab === "obfuscate" ? "text-yellow-500" : "text-green-500"}>
                          {getCompressionRatio().toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(getCompressionRatio(), 100)}
                        className="h-2"
                        indicatorClassName={activeTab === "obfuscate" ? "bg-yellow-500" : "bg-green-500"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Processing Time</Label>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-lg font-semibold">{processingTime}ms</span>
                      </div>
                    </div>

                    {activeTab === "obfuscate" && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Security Score</Label>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12" viewBox="0 0 36 36">
                              <path
                                className="stroke-muted-foreground/20"
                                fill="none"
                                strokeWidth="3"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className={`stroke-primary`}
                                fill="none"
                                strokeWidth="3"
                                strokeDasharray={`${securityScore}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <div className={`text-xl font-bold ${getScoreColor()}`}>{securityScore}%</div>
                            <div className="text-xs text-muted-foreground">{getScoreLabel()} Protection</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Information Card */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  About {activeTab === "obfuscate" ? "Obfuscation" : "Deobfuscation"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-muted-foreground">
                  {activeTab === "obfuscate" ? (
                    <>
                      <p>
                        Code obfuscation transforms your code to make it difficult to understand while preserving its
                        functionality. This helps protect your intellectual property and prevent reverse engineering.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Key Features:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Control flow flattening makes code logic harder to follow</li>
                          <li>String encryption hides text content in your code</li>
                          <li>Dead code injection adds misleading code</li>
                          <li>Self-defending code prevents easy formatting</li>
                          <li>Debug protection prevents browser debugging</li>
                        </ul>
                      </div>
                      <p>
                        <span className="text-yellow-500 font-medium">Note:</span> While obfuscation makes your code
                        harder to understand, it is not a complete security solution. Critical security logic should be
                        implemented server-side.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Code deobfuscation attempts to restore obfuscated code to a more readable format. This can be
                        useful for analyzing suspicious code or recovering your own obfuscated code.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Limitations:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Complete restoration may not be possible for heavily obfuscated code</li>
                          <li>Variable names may not match the original code</li>
                          <li>Code structure may differ from the original</li>
                          <li>Some obfuscation techniques are designed to resist deobfuscation</li>
                        </ul>
                      </div>
                      <p>
                        <span className="text-yellow-500 font-medium">Note:</span> Deobfuscation works best on code that
                        has been obfuscated with standard techniques. Custom obfuscation may require manual analysis.
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

