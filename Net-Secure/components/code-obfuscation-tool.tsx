"use client"

import { useState, useRef, useEffect } from "react"
import { ToolContainer } from "@/components/ui/tool-container"
import { ToolInput } from "@/components/ui/tool-input"
import { ConfigSection, ToggleOption, SliderOption, CircularIndicator } from "@/components/ui/tool-config-panel"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Lock,
  Unlock,
  Shield,
  Wand2,
  BarChart,
  RefreshCw,
  Loader2,
  AlertCircle,
  AlertTriangle
} from "lucide-react"
import { obfuscateCode, deobfuscateCode } from "@/app/actions/code-processor"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "react-error-boundary"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, KeyboardShortcut } from "@/components/ui/tooltip"
import { LoadingAnimation } from "./ui/loading-animation"

// Add error boundary component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
      <h2 className="text-lg font-semibold mb-2">Something went wrong:</h2>
      <pre className="text-sm overflow-auto p-2 bg-background/50 rounded">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// Add validation utilities
function validateOutput(code: string, processed: string): string | null {
  if (!processed || processed.trim().length === 0) {
    return "Output code is empty. Obfuscation may have failed.";
  }
  
  // Check if output size is suspiciously small compared to input
  if (processed.length < code.length * 0.1) {
    return "Warning: Output code is significantly smaller than input. The result may be incomplete.";
  }
  
  return null;
}

type FileType = "js" | "ts" | "jsx" | "tsx" | "py" | "html" | "css"
type ObfuscationLevel = "low" | "medium" | "high" | "extreme" | "custom"

// Extended ObfuscationOptions type
type ObfuscationOptions = {
  compact: boolean
  controlFlowFlattening: boolean
  controlFlowFlatteningThreshold: number
  deadCodeInjection: boolean
  deadCodeInjectionThreshold: number
  debugProtection: boolean
  disableConsoleOutput: boolean
  identifierNamesGenerator: "dictionary" | "hexadecimal" | "mangled" | "mangled-shuffled"
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
  // Language specific options
  preserveDunder?: boolean
  preserveEvents?: boolean
  importObfuscation?: boolean
  minify?: boolean
  attributeScrambling?: boolean
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

const defaultOptions: Required<ObfuscationOptions> = {
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
  // Initialize language-specific options with defaults
  importObfuscation: false,
  minify: true,
  preserveDunder: true,
  preserveEvents: true,
  attributeScrambling: true,
}

export function CodeObfuscationTool() {
  const [activeTab, setActiveTab] = useState<"obfuscate" | "deobfuscate">("obfuscate")
  const [inputCode, setInputCode] = useState("")
  const [outputCode, setOutputCode] = useState("")
  const [fileType, setFileType] = useState<FileType>("js")
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [securityScore, setSecurityScore] = useState(0)
  const [codeSize, setCodeSize] = useState({ original: 0, processed: 0 })
  const [processingTime, setProcessingTime] = useState(0)
  const [obfuscationLevel, setObfuscationLevel] = useState<ObfuscationLevel>("medium")
  const [options, setOptions] = useState(defaultOptions)
  const [preservePythonDunder, setPreservePythonDunder] = useState(true)
  const [preserveHtmlEvents, setPreserveHtmlEvents] = useState(true)
  const [outputWarning, setOutputWarning] = useState<string | null>(null);

  const { toast } = useToast()

  const fadeAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  }

  const slideAnimation = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3 }
  }

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

  const getLanguageSpecificOptions = () => {
    switch (fileType) {
      case "py":
        return {
          preserveDunder: preservePythonDunder,
          variableMangling: true,
          importObfuscation: true,
        }
      case "html":
        return {
          preserveEvents: preserveHtmlEvents,
          minify: true,
          attributeScrambling: true,
        }
      default:
        return {}
    }
  }

  const handleProcess = async () => {
    if (!inputCode.trim()) {
      setError(activeTab === "obfuscate" ? "Please enter code to obfuscate" : "Please enter code to deobfuscate")
      return
    }

    setIsLoading(true)
    setError(null)
    setOutputWarning(null);
    const startTime = performance.now()

    try {
      const languageOptions = getLanguageSpecificOptions()
      const result = activeTab === "obfuscate"
        ? await obfuscateCode({ 
            code: inputCode, 
            fileType, 
            options: {
              ...options,
              ...languageOptions
            }
          })
        : await deobfuscateCode({ code: inputCode, fileType })

      if (result.error) {
        setError(result.error)
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
      } else {
        const processedCode = result.processedCode;
        
        // Validate output
        const warning = validateOutput(inputCode, processedCode);
        if (warning) {
          setOutputWarning(warning);
          toast({
            title: "Warning",
            description: warning,
            variant: "warning"
          });
        }
        
        setOutputCode(processedCode);
        setCodeSize({
          original: new Blob([inputCode]).size,
          processed: new Blob([processedCode]).size
        });
        setProcessingTime(Math.round(performance.now() - startTime));
        
        if (!warning) {
          toast({
            title: "Success",
            description: activeTab === "obfuscate" ? "Code obfuscated successfully" : "Code deobfuscated successfully"
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  // Add language-specific options section to ConfigSection
  const renderLanguageSpecificOptions = () => {
    switch (fileType) {
      case "py":
        return (
          <div className="space-y-4">
            <ToggleOption
              label="Preserve Dunder Methods"
              description="Keep Python's special double underscore methods unchanged"
              checked={options.preserveDunder ?? true}
              onCheckedChange={(checked) => 
                handleOptionChange("preserveDunder", checked)
              }
            />
            <ToggleOption
              label="Import Obfuscation"
              description="Obfuscate imported module names"
              checked={options.importObfuscation ?? false}
              onCheckedChange={(checked) => 
                handleOptionChange("importObfuscation", checked)
              }
            />
          </div>
        );

      case "html":
        return (
          <div className="space-y-4">
            <ToggleOption
              label="Preserve Event Handlers"
              description="Keep HTML event attributes (onclick, etc.) unchanged"
              checked={options.preserveEvents ?? true}
              onCheckedChange={(checked) => 
                handleOptionChange("preserveEvents", checked)
              }
            />
            <ToggleOption
              label="Minify Code"
              description="Remove unnecessary whitespace and comments"
              checked={options.minify ?? true}
              onCheckedChange={(checked) => 
                handleOptionChange("minify", checked)
              }
            />
            <ToggleOption
              label="Scramble Attributes"
              description="Randomize class and ID names"
              checked={options.attributeScrambling ?? true}
              onCheckedChange={(checked) => 
                handleOptionChange("attributeScrambling", checked)
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading && inputCode) {
          handleProcess();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputCode, isLoading, handleProcess]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        setError(null);
        setOutputWarning(null);
        setOutputCode("");
      }}
    >
      <TooltipProvider>
        <ToolContainer
          title={activeTab === "obfuscate" ? "Code Obfuscator" : "Code Deobfuscator"}
          description={
            activeTab === "obfuscate"
              ? "Transform your code to make it difficult to understand while preserving functionality"
              : "Restore obfuscated code to a more readable format"
          }
          icon={activeTab === "obfuscate" ? Lock : Unlock}
          primaryAction={{
            label: activeTab === "obfuscate" ? "Obfuscate Code" : "Deobfuscate Code",
            icon: isLoading ? Loader2 : activeTab === "obfuscate" ? Lock : Unlock,
            onClick: handleProcess,
            loading: isLoading,
            disabled: !inputCode || isLoading,
            tooltip: "Process the code",
            shortcut: [process.platform === 'darwin' ? '⌘' : 'Ctrl', 'Enter']
          }}
          rightSidebar={activeTab === "obfuscate" ? (
            <div className="space-y-6">
              <ConfigSection
                title="Security Level"
                icon={Shield}
                defaultExpanded={true}
              >
                <div className="space-y-4">
                  <CircularIndicator
                    value={securityScore}
                    size="lg"
                    colorClass={cn(
                      securityScore < 30 && "text-destructive",
                      securityScore >= 30 && securityScore < 60 && "text-yellow-500",
                      securityScore >= 60 && securityScore < 80 && "text-green-500",
                      securityScore >= 80 && "text-primary"
                    )}
                  />
                  
                  <SliderOption
                    label="Obfuscation Level"
                    value={["low", "medium", "high", "extreme"].indexOf(obfuscationLevel)}
                    onChange={(value) => 
                      setObfuscationLevel(["low", "medium", "high", "extreme"][value] as ObfuscationLevel)
                    }
                    min={0}
                    max={3}
                    step={1}
                    valueFormatter={(v) => ["Low", "Medium", "High", "Extreme"][v]}
                  />
                </div>
              </ConfigSection>

              <ConfigSection
                title="Obfuscation Options"
                icon={Wand2}
                defaultExpanded={true}
              >
                <div className="space-y-4">
                  {/* Common options */}
                  <ToggleOption
                    label="Control Flow Flattening"
                    description="Makes code harder to follow by flattening control flow statements"
                    checked={options.controlFlowFlattening}
                    onCheckedChange={(checked) => 
                      handleOptionChange("controlFlowFlattening", checked)
                    }
                  />

                  {options.controlFlowFlattening && (
                    <SliderOption
                      label="Control Flow Threshold"
                      value={options.controlFlowFlatteningThreshold * 100}
                      onChange={(value) => 
                        handleOptionChange("controlFlowFlatteningThreshold", value / 100)
                      }
                      valueFormatter={(v) => `${v}%`}
                    />
                  )}

                  <ToggleOption
                    label="Dead Code Injection"
                    description="Adds random dead code to confuse reverse engineering"
                    checked={options.deadCodeInjection}
                    onCheckedChange={(checked) => 
                      handleOptionChange("deadCodeInjection", checked)
                    }
                  />

                  {options.deadCodeInjection && (
                    <SliderOption
                      label="Dead Code Threshold"
                      value={options.deadCodeInjectionThreshold * 100}
                      onChange={(value) => 
                        handleOptionChange("deadCodeInjectionThreshold", value / 100)
                      }
                      valueFormatter={(v) => `${v}%`}
                    />
                  )}

                  {/* Language specific options */}
                  {fileType === "py" && (
                    <>
                      <ToggleOption
                        label="Preserve Dunder Methods"
                        description="Keep Python's special double underscore methods unchanged"
                        checked={preservePythonDunder}
                        onCheckedChange={setPreservePythonDunder}
                      />
                      <ToggleOption
                        label="Import Obfuscation"
                        description="Obfuscate imported module names"
                        checked={options.importObfuscation}
                        onCheckedChange={(checked) => 
                          handleOptionChange("importObfuscation", checked)
                        }
                      />
                    </>
                  )}

                  {fileType === "html" && (
                    <>
                      <ToggleOption
                        label="Preserve Event Handlers"
                        description="Keep HTML event attributes (onclick, etc.) unchanged"
                        checked={preserveHtmlEvents}
                        onCheckedChange={setPreserveHtmlEvents}
                      />
                      <ToggleOption
                        label="Minify Code"
                        description="Remove unnecessary whitespace and comments"
                        checked={options.minify}
                        onCheckedChange={(checked) => 
                          handleOptionChange("minify", checked)
                        }
                      />
                      <ToggleOption
                        label="Scramble Attributes"
                        description="Randomize class and ID names"
                        checked={options.attributeScrambling}
                        onCheckedChange={(checked) => 
                          handleOptionChange("attributeScrambling", checked)
                        }
                      />
                    </>
                  )}

                  {/* Add common string array options */}
                  <ToggleOption
                    label="String Array"
                    description="Move strings to a separate array to make them harder to find"
                    checked={options.stringArray}
                    onCheckedChange={(checked) => 
                      handleOptionChange("stringArray", checked)
                    }
                  />

                  {options.stringArray && (
                    <>
                      <SliderOption
                        label="String Array Threshold"
                        value={options.stringArrayThreshold * 100}
                        onChange={(value) => 
                          handleOptionChange("stringArrayThreshold", value / 100)
                        }
                        valueFormatter={(v) => `${v}%`}
                      />
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
                    </>
                  )}

                  <ToggleOption
                    label="Self Defending"
                    description="Add code to prevent tampering and formatting"
                    checked={options.selfDefending}
                    onCheckedChange={(checked) => 
                      handleOptionChange("selfDefending", checked)
                    }
                  />
                </div>
              </ConfigSection>

              {/* Language-specific options */}
              {(fileType === "py" || fileType === "html") && (
                <ConfigSection
                  title={`${fileType.toUpperCase()} Options`}
                  icon={Wand2}
                  defaultExpanded={true}
                >
                  {renderLanguageSpecificOptions()}
                </ConfigSection>
              )}

              <ConfigSection
                title="Statistics"
                icon={BarChart}
                defaultExpanded={true}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Original Size</div>
                      <div className="text-2xl font-bold">{formatBytes(codeSize.original)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Processed Size</div>
                      <div className="text-2xl font-bold">{formatBytes(codeSize.processed)}</div>
                    </div>
                  </div>
                  
                  {processingTime > 0 && (
                    <div>
                      <div className="text-sm font-medium">Processing Time</div>
                      <div className="text-2xl font-bold">{processingTime}ms</div>
                    </div>
                  )}
                </div>
              </ConfigSection>
            </div>
          ) : (
            <div className="space-y-6">
              <ConfigSection
                title="Deobfuscation Options"
                icon={Wand2}
                defaultExpanded={true}
              >
                <div className="text-sm text-muted-foreground">
                  <p>Deobfuscation attempts to restore code to a more readable format.</p>
                  <p className="mt-2">Note: Complete restoration may not be possible for heavily obfuscated code.</p>
                </div>
              </ConfigSection>
            </div>
          )}
        >
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading && (
              <motion.div
                className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingAnimation 
                  variant="pulse"
                  size="lg"
                  message={`${activeTab === "obfuscate" ? "Obfuscating" : "Deobfuscating"} ${fileType.toUpperCase()} code...`}
                />
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div 
                className="space-y-4"
                {...fadeAnimation}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label>Language:</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Select value={fileType} onValueChange={(value: FileType) => setFileType(value)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>JavaScript/TypeScript</SelectLabel>
                              <SelectItem value="js">JavaScript (.js)</SelectItem>
                              <SelectItem value="ts">TypeScript (.ts)</SelectItem>
                              <SelectItem value="jsx">React JSX (.jsx)</SelectItem>
                              <SelectItem value="tsx">React TSX (.tsx)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Web</SelectLabel>
                              <SelectItem value="html">HTML (.html)</SelectItem>
                              <SelectItem value="css">CSS (.css)</SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Other</SelectLabel>
                              <SelectItem value="py">Python (.py)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Choose the programming language of your code</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-sm text-muted-foreground">
                        Security Score: {securityScore}%
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Higher scores indicate stronger obfuscation</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <ToolInput
                  title="Input Code"
                  value={inputCode}
                  onChange={setInputCode}
                  placeholder={`Paste your ${fileType.toUpperCase()} code here...`}
                  className="h-[70vh] min-h-[200px] transition-all duration-200"
                  fileTypes={["js", "ts", "jsx", "tsx", "py", "html", "css"]}
                  onFileUpload={(file) => {
                    const content = new FileReader()
                    content.onload = (e) => setInputCode(e.target?.result as string)
                    content.readAsText(file)
                    setFileName(file.name)
                    
                    // Set file type based on extension
                    const extension = file.name.split('.').pop()?.toLowerCase() as FileType
                    if (["js", "ts", "jsx", "tsx", "py", "html", "css"].includes(extension)) {
                      setFileType(extension)
                    }
                  }}
                  supportedFileTypes={["js", "ts", "jsx", "tsx", "py", "html", "css"]}
                  statusText={inputCode ? `${new Blob([inputCode]).size} bytes` : "No code entered"}
                />
              </motion.div>

              <motion.div 
                className="space-y-4"
                {...fadeAnimation}
              >
                {outputCode && (
                  <motion.div {...slideAnimation}>
                    <ToolInput
                      title="Output Code"
                      value={outputCode}
                      onChange={() => {}}
                      placeholder="Processed code will appear here..."
                      className="h-[70vh] min-h-[200px] transition-all duration-200"
                      showMaximize={true}
                      statusText={`${new Blob([outputCode]).size} bytes`}
                    />
                    {outputWarning && (
                      <motion.div 
                        className="mt-3 p-3 rounded-md bg-warning/10 border border-warning/20 text-warning text-sm flex items-start space-x-2"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{outputWarning}</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.div 
                className="col-span-full"
                {...slideAnimation}
              >
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </div>
        </ToolContainer>
      </TooltipProvider>
    </ErrorBoundary>
  )
}

