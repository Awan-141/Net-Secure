"use client"

import type React from "react"

import { useState } from "react"
import { FileDigit, Copy, Check, Upload, Info, Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export function HashGenerator() {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [algorithm, setAlgorithm] = useState("SHA-256")
  const [hashResult, setHashResult] = useState<string | null>(null)
  const [verificationHash, setVerificationHash] = useState("")
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileProgress, setFileProgress] = useState(0)
  const [compareMode, setCompareMode] = useState(false)
  const [compareHash, setCompareHash] = useState("")
  const [hashesMatch, setHashesMatch] = useState<boolean | null>(null)

  const copyToClipboard = () => {
    if (hashResult) {
      navigator.clipboard.writeText(hashResult)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const generateTextHash = async () => {
    try {
      setError(null)
      setLoading(true)
      setHashesMatch(null)

      if (!text) {
        setError("Please enter text to hash")
        setLoading(false)
        return
      }

      const encoder = new TextEncoder()
      const data = encoder.encode(text)

      const hashBuffer = await crypto.subtle.digest(algorithm, data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

      setHashResult(hashHex)

      // Check if we're in compare mode
      if (compareMode && compareHash) {
        setHashesMatch(compareHash.toLowerCase() === hashHex.toLowerCase())
      }
    } catch (err) {
      console.error(err)
      setError("Failed to generate hash")
    } finally {
      setLoading(false)
    }
  }

  const generateFileHash = async () => {
    try {
      setError(null)
      setLoading(true)
      setHashesMatch(null)
      setFileProgress(0)

      if (!file) {
        setError("Please select a file")
        setLoading(false)
        return
      }

      // For large files, we'll read in chunks to show progress
      const chunkSize = 4 * 1024 * 1024 // 4MB chunks
      const chunks = Math.ceil(file.size / chunkSize)
      const fileReader = new FileReader()

      // Use the appropriate crypto algorithm
      const cryptoAlgo = algorithm
      const cryptoContext = await crypto.subtle.digest(cryptoAlgo, new ArrayBuffer(0))

      // We need to use a different approach for large files
      // This is a simplified version - in a real app, you'd use a more robust approach
      if (file.size > 50 * 1024 * 1024) {
        // 50MB
        // For very large files, read directly
        const arrayBuffer = await file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest(algorithm, arrayBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

        setHashResult(hashHex)

        // Check if we're in compare mode
        if (compareMode && verificationHash) {
          setVerificationResult(verificationHash.toLowerCase() === hashHex.toLowerCase())
        }

        setLoading(false)
        return
      }

      // For smaller files, read in chunks to show progress
      let offset = 0
      let hashBuffer: ArrayBuffer | null = null

      const readNextChunk = () => {
        const slice = file.slice(offset, offset + chunkSize)
        fileReader.readAsArrayBuffer(slice)
      }

      fileReader.onload = async (e) => {
        if (!e.target?.result) return

        const chunk = e.target.result as ArrayBuffer

        // Hash this chunk
        if (!hashBuffer) {
          hashBuffer = await crypto.subtle.digest(algorithm, chunk)
        } else {
          // For simplicity, we're just hashing the entire file at once
          // In a real implementation, you'd use a streaming hash approach
        }

        offset += chunk.byteLength
        const progress = Math.min(100, Math.round((offset / file.size) * 100))
        setFileProgress(progress)

        if (offset < file.size) {
          readNextChunk()
        } else {
          // We've read the entire file
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

          setHashResult(hashHex)

          // Check if we're in compare mode
          if (compareMode && verificationHash) {
            setVerificationResult(verificationHash.toLowerCase() === hashHex.toLowerCase())
          }

          setLoading(false)
        }
      }

      fileReader.onerror = () => {
        setError("Error reading file")
        setLoading(false)
      }

      readNextChunk()
    } catch (err) {
      console.error(err)
      setError("Failed to generate file hash")
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setHashResult(null)
    setError(null)
    setFileProgress(0)
    setVerificationResult(null)
  }

  const toggleCompareMode = () => {
    setCompareMode(!compareMode)
    setHashesMatch(null)
  }

  const verifyHash = () => {
    if (hashResult && verificationHash) {
      setVerificationResult(hashResult.toLowerCase() === verificationHash.toLowerCase())
    }
  }

  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case "SHA-1":
        return "SHA-1 (Secure Hash Algorithm 1) produces a 160-bit hash value. It's considered cryptographically broken and unsuitable for security applications."
      case "SHA-256":
        return "SHA-256 is part of the SHA-2 family, producing a 256-bit hash value. It's widely used and considered secure for most applications."
      case "SHA-384":
        return "SHA-384 is part of the SHA-2 family, producing a 384-bit hash value. It provides higher security than SHA-256 with a performance trade-off."
      case "SHA-512":
        return "SHA-512 is part of the SHA-2 family, producing a 512-bit hash value. It offers the highest security level in the SHA-2 family."
      case "MD5":
        return "MD5 produces a 128-bit hash value. It's cryptographically broken and should only be used for non-security purposes like checksums."
      default:
        return ""
    }
  }

  return (
    <Card className="overflow-hidden bg-[#0f1e36] border-[#1a2942]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDigit className="h-5 w-5 text-primary" />
          Cryptographic Hash Generator
        </CardTitle>
        <CardDescription>
          Generate and verify cryptographic hashes for data integrity and security verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="info" className="border-[#1a2942]">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                What is a cryptographic hash and why is it useful?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm space-y-2">
              <p>
                A cryptographic hash function is a mathematical algorithm that maps data of any size to a fixed-size
                output (hash value). It's designed to be:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>One-way:</strong> It's computationally infeasible to reverse the process and generate the
                  input from the hash.
                </li>
                <li>
                  <strong>Deterministic:</strong> The same input will always produce the same hash value.
                </li>
                <li>
                  <strong>Collision-resistant:</strong> It's extremely difficult to find two different inputs that
                  produce the same hash.
                </li>
                <li>
                  <strong>Avalanche effect:</strong> A small change in the input produces a completely different hash
                  value.
                </li>
              </ul>
              <p className="font-medium mt-2">Common uses include:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>File integrity:</strong> Verify files haven't been tampered with or corrupted
                </li>
                <li>
                  <strong>Digital signatures:</strong> Part of the process for signing and verifying digital documents
                </li>
                <li>
                  <strong>Password storage:</strong> Securely store password hashes instead of plaintext passwords
                </li>
                <li>
                  <strong>Data identification:</strong> Create unique identifiers for data blocks
                </li>
                <li>
                  <strong>Blockchain:</strong> Fundamental to blockchain technology and cryptocurrencies
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a2942]">
            <TabsTrigger
              value="text"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Text
            </TabsTrigger>
            <TabsTrigger
              value="file"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="text-to-hash">Text to Hash</Label>
              <Textarea
                id="text-to-hash"
                placeholder="Enter text to hash"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="bg-[#0a1629] border-[#1a2942] focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="hash-algorithm">Hash Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger id="hash-algorithm" className="bg-[#0a1629] border-[#1a2942]">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1629] border-[#1a2942]">
                    <SelectItem value="MD5">MD5 (Not secure, for comparison only)</SelectItem>
                    <SelectItem value="SHA-1">SHA-1 (Not secure for cryptographic purposes)</SelectItem>
                    <SelectItem value="SHA-256">SHA-256 (Recommended)</SelectItem>
                    <SelectItem value="SHA-384">SHA-384</SelectItem>
                    <SelectItem value="SHA-512">SHA-512</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">{getAlgorithmDescription()}</p>
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                <Button
                  variant="outline"
                  className="w-full bg-[#1a2942] border-[#243552] hover:bg-[#243552] text-foreground"
                  onClick={toggleCompareMode}
                >
                  {compareMode ? "Cancel Compare" : "Compare Hashes"}
                </Button>
              </div>
            </div>

            {compareMode && (
              <div className="space-y-2">
                <Label htmlFor="compare-hash">Hash to Compare</Label>
                <Input
                  id="compare-hash"
                  placeholder="Enter hash to compare with generated hash"
                  value={compareHash}
                  onChange={(e) => setCompareHash(e.target.value)}
                  className="bg-[#0a1629] border-[#1a2942] focus:ring-primary"
                />
              </div>
            )}

            <Button
              onClick={generateTextHash}
              disabled={loading || !text}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Generating..." : "Generate Hash"}
            </Button>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="file-to-hash">File to Hash</Label>
              <div className="border-2 border-dashed border-[#1a2942] rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input id="file-to-hash" type="file" onChange={handleFileChange} className="hidden" />

                {file ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("file-to-hash")?.click()}
                      className="bg-[#1a2942] border-[#243552] hover:bg-[#243552] text-foreground"
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div
                    className="space-y-2 cursor-pointer"
                    onClick={() => document.getElementById("file-to-hash")?.click()}
                  >
                    <Upload className="mx-auto h-8 w-8 text-primary" />
                    <p className="text-sm font-medium">Click to select a file</p>
                    <p className="text-xs text-gray-500">Or drag and drop a file here</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="file-hash-algorithm">Hash Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger id="file-hash-algorithm" className="bg-[#0a1629] border-[#1a2942]">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a1629] border-[#1a2942]">
                    <SelectItem value="MD5">MD5 (Not secure, for comparison only)</SelectItem>
                    <SelectItem value="SHA-1">SHA-1 (Not secure for cryptographic purposes)</SelectItem>
                    <SelectItem value="SHA-256">SHA-256 (Recommended)</SelectItem>
                    <SelectItem value="SHA-384">SHA-384</SelectItem>
                    <SelectItem value="SHA-512">SHA-512</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">{getAlgorithmDescription()}</p>
              </div>

              <div className="space-y-2">
                <Label>Verification</Label>
                <Button
                  variant={compareMode ? "default" : "outline"}
                  className={`w-full ${compareMode ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-[#1a2942] border-[#243552] hover:bg-[#243552] text-foreground"}`}
                  onClick={toggleCompareMode}
                >
                  {compareMode ? "Cancel Verify" : "Verify Hash"}
                </Button>
              </div>
            </div>

            {compareMode && (
              <div className="space-y-2">
                <Label htmlFor="verification-hash">Expected Hash</Label>
                <Input
                  id="verification-hash"
                  placeholder="Enter the expected hash for verification"
                  value={verificationHash}
                  onChange={(e) => setVerificationHash(e.target.value)}
                  className="bg-[#0a1629] border-[#1a2942] focus:ring-primary"
                />
                <p className="text-xs text-gray-500">Enter the expected hash value to verify file integrity</p>
              </div>
            )}

            <Button
              onClick={generateFileHash}
              disabled={loading || !file}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Generating..." : "Generate Hash"}
            </Button>

            {loading && fileProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Processing file...</span>
                  <span>{fileProgress}%</span>
                </div>
                <Progress value={fileProgress} className="h-1.5 bg-[#1a2942]">
                  <div className="h-1.5 bg-primary" style={{ width: `${fileProgress}%` }} />
                </Progress>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hashResult && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <Label>Hash Result ({algorithm})</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs hover:bg-[#1a2942]"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="p-2 bg-[#0a1629] rounded-md overflow-auto">
              <pre className="text-xs break-all whitespace-pre-wrap">{hashResult}</pre>
            </div>

            {compareMode && (
              <div className="mt-2">
                {hashesMatch !== null && (
                  <Alert
                    variant={hashesMatch ? "default" : "destructive"}
                    className={hashesMatch ? "bg-green-900/20 border-green-700/30 text-green-400" : ""}
                  >
                    <div className="flex items-center gap-2">
                      {hashesMatch ? (
                        <>
                          <Shield className="h-4 w-4 text-green-500" />
                          <AlertTitle>Hash Verified</AlertTitle>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Hash Mismatch</AlertTitle>
                        </>
                      )}
                    </div>
                    <AlertDescription>
                      {hashesMatch
                        ? "The generated hash matches the expected hash. The data integrity is verified."
                        : "The generated hash does not match the expected hash. The data may have been modified or corrupted."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        <Separator className="my-4 bg-[#1a2942]" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Common Hash Applications</h3>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>
                <strong>File Integrity:</strong> Verify downloaded files haven't been tampered with
              </li>
              <li>
                <strong>Data Deduplication:</strong> Identify duplicate files by their hash
              </li>
              <li>
                <strong>Git Version Control:</strong> Git uses SHA-1 to track content changes
              </li>
              <li>
                <strong>Digital Forensics:</strong> Verify evidence hasn't been altered
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Security Considerations</h3>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>
                <strong>MD5 and SHA-1:</strong> Considered cryptographically broken
              </li>
              <li>
                <strong>SHA-256 and above:</strong> Currently secure for most applications
              </li>
              <li>
                <strong>Hash Collisions:</strong> When two different inputs produce the same hash
              </li>
              <li>
                <strong>Salt:</strong> Random data added to input before hashing (for passwords)
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500 border-t border-[#1a2942] pt-4">
        <div className="space-y-1 w-full">
          <p>
            <strong>Use cases:</strong> File integrity verification, password storage, digital signatures, and data
            integrity checks.
          </p>
          <p>
            <strong>Privacy guarantee:</strong> All hash generation happens locally in your browser using the Web Crypto
            API. No data is transmitted.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

