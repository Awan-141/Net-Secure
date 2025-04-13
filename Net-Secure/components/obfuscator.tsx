"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Download, Upload, Code, FileCode } from "lucide-react"
import { obfuscateCode } from "@/app/actions/obfuscate"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

type FileType = "js" | "ts" | "jsx" | "tsx" | "html" | "css"

export function Obfuscator() {
  const [inputCode, setInputCode] = useState("")
  const [outputCode, setOutputCode] = useState("")
  const [fileType, setFileType] = useState<FileType>("js")
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Obfuscation options
  const [options, setOptions] = useState({
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    stringArrayEncoding: "base64",
    stringArrayThreshold: 0.75,
    renameProperties: false,
    selfDefending: true,
  })

  const handleOptionChange = (key: string, value: boolean | number | string) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }))
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
    }
    reader.readAsText(file)
  }

  const handleObfuscate = async () => {
    if (!inputCode.trim()) {
      setError("Please enter or upload code to obfuscate")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await obfuscateCode({
        code: inputCode,
        fileType,
        options,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setOutputCode(result.obfuscatedCode)
        toast({
          title: "Obfuscation complete",
          description: "Your code has been successfully obfuscated.",
        })
      }
    } catch (err) {
      setError("An error occurred during obfuscation. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!outputCode) return

    const blob = new Blob([outputCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url

    // Create download filename
    let downloadName = fileName || `obfuscated.${fileType}`
    if (fileName) {
      const nameParts = fileName.split(".")
      if (nameParts.length > 1) {
        nameParts[nameParts.length - 2] += "-obfuscated"
        downloadName = nameParts.join(".")
      } else {
        downloadName = `${fileName}-obfuscated.${fileType}`
      }
    }

    a.download = downloadName
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Input Code</TabsTrigger>
            <TabsTrigger value="output">Output Code</TabsTrigger>
          </TabsList>
          <TabsContent value="input" className="space-y-4">
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
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
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
              <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <FileCode className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>
                  Uploaded: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                </AlertDescription>
              </Alert>
            )}
            <Textarea
              placeholder={`Paste your ${fileType.toUpperCase()} code here...`}
              className="min-h-[400px] font-mono text-sm"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
            <div className="flex justify-center">
              <Button onClick={handleObfuscate} className="w-full md:w-auto" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Obfuscating...
                  </>
                ) : (
                  <>
                    <Code className="mr-2 h-4 w-4" />
                    Obfuscate Code
                  </>
                )}
              </Button>
            </div>
            {error && (
              <Alert className="mt-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertDescription className="text-red-600 dark:text-red-400">{error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
          <TabsContent value="output" className="space-y-4">
            <Textarea
              placeholder="Obfuscated code will appear here..."
              className="min-h-[400px] font-mono text-sm"
              value={outputCode}
              readOnly
            />
            <div className="flex justify-center">
              <Button onClick={handleDownload} className="w-full md:w-auto" disabled={!outputCode} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Obfuscated Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Obfuscation Options</h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="controlFlowFlattening">Control Flow Flattening</Label>
                  <Switch
                    id="controlFlowFlattening"
                    checked={options.controlFlowFlattening}
                    onCheckedChange={(checked) => handleOptionChange("controlFlowFlattening", checked)}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Makes code harder to follow by flattening control flow statements
                </p>
              </div>

              {options.controlFlowFlattening && (
                <div className="space-y-2">
                  <Label>Control Flow Flattening Threshold: {options.controlFlowFlatteningThreshold}</Label>
                  <Slider
                    value={[options.controlFlowFlatteningThreshold * 100]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleOptionChange("controlFlowFlatteningThreshold", value[0] / 100)}
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Adds random dead code to confuse reverse engineering
                </p>
              </div>

              {options.deadCodeInjection && (
                <div className="space-y-2">
                  <Label>Dead Code Injection Threshold: {options.deadCodeInjectionThreshold}</Label>
                  <Slider
                    value={[options.deadCodeInjectionThreshold * 100]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleOptionChange("deadCodeInjectionThreshold", value[0] / 100)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>String Array Encoding</Label>
                <Select
                  value={options.stringArrayEncoding}
                  onValueChange={(value) => handleOptionChange("stringArrayEncoding", value)}
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
                <Label>String Array Threshold: {options.stringArrayThreshold}</Label>
                <Slider
                  value={[options.stringArrayThreshold * 100]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => handleOptionChange("stringArrayThreshold", value[0] / 100)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="renameProperties">Rename Properties</Label>
                  <Switch
                    id="renameProperties"
                    checked={options.renameProperties}
                    onCheckedChange={(checked) => handleOptionChange("renameProperties", checked)}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Renames object properties (may break code)</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Makes the output resilient against formatting and variable renaming
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

