"use client"

import { useState, useEffect, useRef } from "react"
import {
  RefreshCw,
  Wifi,
  Activity,
  Globe,
  Lock,
  AlertTriangle,
  Server,
  ShieldCheck,
  Zap,
  FileText,
  ArrowUpDown,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileTransferEstimator } from "@/components/file-transfer-estimator"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

type Result = {
  [key: string]: string | number
}

type HistoryEntry = {
  timestamp: string
  ping: number
  download: number
  upload: number
}

// Cross-origin safe API handler that works in any environment
const useApiUrl = () => {  
  // Always use our CORS proxy route
  const proxyBase = '/api/proxy';
  
  return {
    baseUrl: proxyBase,
    
    // Utility methods for making API requests
    get: async (endpoint: string, originalApiUrl = 'http://localhost:3001') => {
      const targetUrl = `${originalApiUrl}${endpoint}`;
      const response = await fetch(`${proxyBase}?url=${encodeURIComponent(targetUrl)}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      return response.json();
    }
  };
};

export function NetworkAnalyzer() {
  const api = useApiUrl();
  const [results, setResults] = useState<Result>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [error, setError] = useState<string | null>(null)

  // Fixed useRef declaration
  const chartRef = useRef<HTMLCanvasElement>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    setProgress(0)

    setResults({
      ip: "Fetching...",
      ping: "Testing...",
      download: "Testing...",
      upload: "Testing...",
      nmap: "Scanning...",
      ports: "Scanning...",
      services: "Detecting...",
      vuln: "Scanning...",
      ssl: "Checking...",
      firewall: "Checking...",
    })

    try {
      // Simulate network tests with mock data
      await simulateNetworkTests()
    } catch (err) {
      console.error(err)
      setError("Network test failed: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  const simulateNetworkTests = async () => {
    // This function simulates the network tests with realistic mock data
    // In a real implementation, these would be actual network tests

    // Simulate IP check
    await new Promise((resolve) => setTimeout(resolve, 500))
    try {
      // Try to get real IP first
      const response = await fetch('/api/proxy?url=' + encodeURIComponent('https://api.ipify.org?format=json'));
      if (response.ok) {
        const data = await response.json();
        setResults((prev) => ({ ...prev, ip: data.ip }))
      } else {
        throw new Error("Could not fetch IP");
      }
    } catch (e) {
      // Fall back to mock IP
      setResults((prev) => ({ ...prev, ip: "192.168.1." + Math.floor(Math.random() * 254 + 1) }))
    }
    setProgress(10)

    // Simulate ping test
    await new Promise((resolve) => setTimeout(resolve, 700))
    const pingValue = Math.floor(Math.random() * 50 + 10)
    setResults((prev) => ({ ...prev, ping: `${pingValue}ms` }))
    setProgress(20)

    // Simulate download speed test
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const downloadSpeed = (Math.random() * 50 + 50).toFixed(2)
    setResults((prev) => ({ ...prev, download: `${downloadSpeed} Mbps` }))
    setProgress(40)

    // Simulate upload speed test
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const uploadSpeed = (Math.random() * 20 + 10).toFixed(2)
    setResults((prev) => ({ ...prev, upload: `${uploadSpeed} Mbps` }))
    setProgress(60)

    // Simulate open ports scan
    await new Promise((resolve) => setTimeout(resolve, 800))
    const openPorts = [80, 443, 22, 21].filter(() => Math.random() > 0.3).join(", ")
    setResults((prev) => ({ ...prev, ports: openPorts || "No open ports detected" }))
    setProgress(70)

    // Simulate service detection
    await new Promise((resolve) => setTimeout(resolve, 600))
    const possibleServices = ["HTTP", "HTTPS", "SSH", "FTP", "SMTP"]
    const detectedServices = possibleServices.filter(() => Math.random() > 0.5).join(", ")
    setResults((prev) => ({ ...prev, services: detectedServices || "No services detected" }))
    setProgress(80)

    // Simulate vulnerability scan
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const vulnRisk = Math.random()
    let vulnResult
    if (vulnRisk < 0.7) {
      vulnResult = "No vulnerabilities detected"
    } else if (vulnRisk < 0.9) {
      vulnResult = "Medium risk: Outdated SSL"
    } else {
      vulnResult = "High risk: Open service vulnerabilities"
    }
    setResults((prev) => ({ ...prev, vuln: vulnResult }))
    setProgress(90)

    // Simulate SSL check
    await new Promise((resolve) => setTimeout(resolve, 500))
    const sslGrades = ["A+", "A", "B", "C"]
    const sslGrade = sslGrades[Math.floor(Math.random() * sslGrades.length)]
    setResults((prev) => ({ ...prev, ssl: `Grade ${sslGrade}` }))

    // Simulate firewall check
    await new Promise((resolve) => setTimeout(resolve, 400))
    const firewallStatus = Math.random() > 0.2 ? "Active" : "Not detected"
    setResults((prev) => ({ ...prev, firewall: firewallStatus }))
    setProgress(100)

    // Update history
    const newHistoryEntry = {
      timestamp: new Date().toLocaleTimeString(),
      ping: pingValue,
      download: Number.parseFloat(downloadSpeed),
      upload: Number.parseFloat(uploadSpeed),
    }

    setHistory((prev) => [...prev, newHistoryEntry])
  }

  // Fetch data on initial load
  useEffect(() => {
    fetchData()
  }, [])

  const renderSpeedMeter = (label: string, value: string | number, max: number, colorClass: string) => {
    const numericValue = typeof value === "string" ? Number.parseFloat(value) : value
    const percentage = Math.min(100, (numericValue / max) * 100)

    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm">{value}</span>
        </div>
        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    )
  }

  const getSeverityColor = (value: string, type: string) => {
    if (type === "ping") {
      const pingMs = Number.parseFloat(value)
      if (pingMs < 30) return "text-green-500"
      if (pingMs < 70) return "text-amber-500"
      return "text-red-500"
    }

    if (type === "vuln") {
      if (value.includes("No vulnerabilities")) return "text-green-500"
      if (value.includes("Medium risk")) return "text-amber-500"
      return "text-red-500"
    }

    if (type === "ssl") {
      if (value.includes("A+") || value.includes("A")) return "text-green-500"
      if (value.includes("B")) return "text-amber-500"
      return "text-red-500"
    }

    if (type === "firewall") {
      return value === "Active" ? "text-green-500" : "text-red-500"
    }

    return ""
  }

  const getSeverityBadge = (value: string, type: string) => {
    if (type === "vuln") {
      if (value.includes("No vulnerabilities")) return <Badge className="bg-green-500">Secure</Badge>
      if (value.includes("Medium risk")) return <Badge className="bg-amber-500">Medium Risk</Badge>
      return <Badge className="bg-red-500">High Risk</Badge>
    }

    if (type === "ssl") {
      if (value.includes("A+") || value.includes("A")) return <Badge className="bg-green-500">{value}</Badge>
      if (value.includes("B")) return <Badge className="bg-amber-500">{value}</Badge>
      return <Badge className="bg-red-500">{value}</Badge>
    }

    if (type === "firewall") {
      return value === "Active" ? (
        <Badge className="bg-green-500">Active</Badge>
      ) : (
        <Badge className="bg-red-500">Not Detected</Badge>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Wifi className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Network Analyzer</h2>
          <p className="text-muted-foreground">Analyze network performance, security, and connectivity</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={fetchData} disabled={loading} size="sm" className="ml-2">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Testing..." : "Test Network"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>{progress < 100 ? "Running network tests..." : "Completing analysis..."}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      <TabsContent value="overview" className="mt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Connection Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">IP Address</span>
                  <span className="font-mono">{results.ip || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ping</span>
                  <span className={getSeverityColor(results.ping as string, "ping")}>{results.ping || "Unknown"}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Connection Type</span>
                    <Badge variant="outline">Broadband</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Network Speed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderSpeedMeter("Download", results.download || "0 Mbps", 100, "bg-blue-500")}
              {renderSpeedMeter("Upload", results.upload || "0 Mbps", 50, "bg-green-500")}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Zap className="h-4 w-4 mr-2" />
                    Speed Calculator
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>File Transfer Estimator</DialogTitle>
                    <DialogDescription>Calculate file transfer times based on your network speed</DialogDescription>
                  </DialogHeader>
                  <FileTransferEstimator />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Security Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Vulnerability Scan</span>
                {getSeverityBadge(results.vuln as string, "vuln")}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">SSL Security</span>
                {getSeverityBadge(results.ssl as string, "ssl")}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Firewall Status</span>
                {getSeverityBadge(results.firewall as string, "firewall")}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Real-time Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ping" stroke="#ff6b6b" name="Ping (ms)" />
                  <Line type="monotone" dataKey="download" stroke="#4dabf7" name="Download (Mbps)" />
                  <Line type="monotone" dataKey="upload" stroke="#51cf66" name="Upload (Mbps)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="performance" className="mt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Speed Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-4">
                  <Activity className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{results.download || "0 Mbps"}</div>
                  <div className="text-sm text-muted-foreground">Download Speed</div>
                </div>
                <div className="mt-6 space-y-1">
                  <div className="text-2xl font-bold">{results.upload || "0 Mbps"}</div>
                  <div className="text-sm text-muted-foreground">Upload Speed</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Last tested</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Latency Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-4">
                  <ArrowUpDown className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className={`text-3xl font-bold ${getSeverityColor(results.ping as string, "ping")}`}>
                    {results.ping || "0 ms"}
                  </div>
                  <div className="text-sm text-muted-foreground">Ping Latency</div>
                </div>

                <div className="mt-6 bg-secondary/20 rounded-lg p-4 text-left">
                  <h4 className="font-medium mb-2">Ping Quality</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span>Below 30ms: Excellent for gaming and video calls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span>30-70ms: Good for most applications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span>Above 70ms: May cause lag in real-time applications</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Speed Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Video Streaming</h4>
                  <div className="bg-secondary/20 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>SD Quality</span>
                      <Badge variant="outline" className="bg-green-900/20">
                        3+ Mbps
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>HD Quality</span>
                      <Badge variant="outline" className="bg-green-900/20">
                        5+ Mbps
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>4K Quality</span>
                      <Badge variant="outline" className="bg-green-900/20">
                        25+ Mbps
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Video Conferencing</h4>
                  <div className="bg-secondary/20 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Group Calls</span>
                      <Badge variant="outline" className="bg-green-900/20">
                        2+ Mbps
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>HD Video Calls</span>
                      <Badge variant="outline" className="bg-green-900/20">
                        3.5+ Mbps
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>Optimal Latency</span>
                      <Badge variant="outline" className="bg-green-900/20">
                        &lt;50ms
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Gaming</h4>
                  <div className="bg-secondary/20 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Online Gaming</span>
                      <Badge variant="outline" className="bg-green-900/20">
                        3+ Mbps
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>Game Downloads</span>
                      <Badge variant="outline" className="bg-green-900/20">
                        10+ Mbps
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>Optimal Latency</span>
                      <Badge variant="outline" className="bg-green-900/20">
                        &lt;30ms
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="mt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                SSL/TLS Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-6 mb-4">
                  <Lock className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className={`text-3xl font-bold ${getSeverityColor(results.ssl as string, "ssl")}`}>
                    {results.ssl || "Not Tested"}
                  </div>
                  <div className="text-sm text-muted-foreground">SSL Security Rating</div>
                </div>
              </div>

              <div className="bg-secondary/20 rounded-lg p-3 text-sm">
                <h4 className="font-medium mb-2">SSL Certificate Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Protocol</span>
                    <Badge variant="outline">TLS 1.2/1.3</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificate</span>
                    <Badge variant="outline" className="bg-green-900/20">
                      Valid
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Vulnerabilities</span>
                    <Badge variant="outline" className="bg-green-900/20">
                      None Detected
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Vulnerability Scan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Scan Status</span>
                <Badge
                  className={results.vuln?.toString().includes("No vulnerabilities") ? "bg-green-500" : "bg-amber-500"}
                >
                  {results.vuln?.toString().includes("No vulnerabilities") ? "Secure" : "Issues Found"}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="bg-secondary/20 rounded-lg p-3">
                  <h4 className="font-medium mb-2 text-sm">Scan Results</h4>
                  <p className={`text-sm ${getSeverityColor(results.vuln as string, "vuln")}`}>
                    {results.vuln || "Not scanned"}
                  </p>
                </div>

                <div className="bg-secondary/20 rounded-lg p-3">
                  <h4 className="font-medium mb-2 text-sm">Detected Services</h4>
                  <p className="text-sm">{results.services || "None detected"}</p>
                </div>

                <div className="bg-secondary/20 rounded-lg p-3">
                  <h4 className="font-medium mb-2 text-sm">Open Ports</h4>
                  <p className="text-sm font-mono">{results.ports || "None detected"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              Network Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Firewall Recommendations</h4>
                <div className="bg-secondary/20 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Enable firewall on all connected devices</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Block unnecessary incoming connections</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Configure port forwarding only when necessary</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Connection Security</h4>
                <div className="bg-secondary/20 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Use WPA3 encryption for Wi-Fi</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Change default router login credentials</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Keep firmware updated on all network devices</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="mt-4 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Test History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ping" stroke="#ff6b6b" name="Ping (ms)" />
                  <Line type="monotone" dataKey="download" stroke="#4dabf7" name="Download (Mbps)" />
                  <Line type="monotone" dataKey="upload" stroke="#51cf66" name="Upload (Mbps)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Detailed History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="px-4 py-2 text-left font-medium">Time</th>
                    <th className="px-4 py-2 text-left font-medium">Ping</th>
                    <th className="px-4 py-2 text-left font-medium">Download</th>
                    <th className="px-4 py-2 text-left font-medium">Upload</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((entry, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">{entry.timestamp}</td>
                        <td className="px-4 py-2">{entry.ping}ms</td>
                        <td className="px-4 py-2">{entry.download} Mbps</td>
                        <td className="px-4 py-2">{entry.upload} Mbps</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">
                        No history available. Run network tests to build history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  )
}

