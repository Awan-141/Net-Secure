"use client"

// React and Next.js imports
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

// Component imports
import AppSidebar from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { FileEncryptionTool } from "@/components/file-encryption-tool"
import { FileTransferEstimator } from "@/components/file-transfer-estimator"
import { FileCompressor } from "@/components/file-compressor"
import { HashGenerator } from "@/components/hash-generator"
import { SiteSecurityInspector } from "@/components/site-security-inspector"
import { PasswordGenerator } from "@/components/password-generator"
import { PasswordPatternAnalyzer } from "@/components/password-pattern-analyzer"
import { NetworkAnalyzer } from "@/components/network-analyzer"
import { NetworkTestTool } from "@/components/network-test-app"
import { CodeObfuscationTool } from "@/components/code-obfuscation-tool"

// Icons
import {
  RefreshCw,
  Lock,
  Zap,
  FileArchive,
  FileDigit,
  Shield,
  KeyRound,
  ArrowRight,
  HelpCircle,
  Menu,
  Wifi,
  Code,
  ShieldAlert,
  ShieldCheck,
  Scan,
} from "lucide-react"

// UI component imports
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

type Result = {
  [key: string]: string | number
}

type HistoryEntry = {
  timestamp: string
  ping: number
  download: number
  upload: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://52.4.69.90:3001/"

const SecureApp = () => {
  const router = useRouter()
  const [results, setResults] = useState<Result>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [username, setUsername] = useState<string>("")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [animateHero, setAnimateHero] = useState(false)

  const logout = () => {
    localStorage.removeItem("username")
    router.push("/login")
  }

  useEffect(() => {
    // Check if user is logged in
    const storedUsername = localStorage.getItem("username") || "Demo User"
    setUsername(storedUsername)

    // Trigger hero animation after a short delay
    setTimeout(() => {
      setAnimateHero(true)
    }, 300)
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    // Simulated data loading
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }

  // Dashboard Security Tools Section
  const SecurityToolsSection = () => (
    <div className="space-y-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 mb-2"
      >
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold tracking-tight">Security Tools</h3>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Code Obfuscation Tool Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="tool-card overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
            <CardHeader className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Code Obfuscator</CardTitle>
                  <CardDescription>Protect your code from reverse engineering</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="p-5 pt-0">
              <Button
                variant="outline"
                className="w-full justify-between text-sm bg-secondary/70 hover:bg-secondary group-hover:border-primary/30"
                onClick={() => setActiveTab("code-obfuscator")}
              >
                Open Tool
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Network Test Tool Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="tool-card overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
            <CardHeader className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Scan className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Network Test</CardTitle>
                  <CardDescription>Advanced network testing and diagnostics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="p-5 pt-0">
              <Button
                variant="outline"
                className="w-full justify-between text-sm bg-secondary/70 hover:bg-secondary group-hover:border-primary/30"
                onClick={() => setActiveTab("network-test")}
              >
                Open Tool
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Site Security Inspector Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="tool-card overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
            <CardHeader className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Site Inspector</CardTitle>
                  <CardDescription>Analyze website security and detect vulnerabilities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="p-5 pt-0">
              <Button
                variant="outline"
                className="w-full justify-between text-sm bg-secondary/70 hover:bg-secondary group-hover:border-primary/30"
                onClick={() => setActiveTab("site-inspector")}
              >
                Open Tool
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Password Analyzer Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="tool-card overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
            <CardHeader className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <KeyRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Password Analyzer</CardTitle>
                  <CardDescription>Analyze password patterns and strength</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="p-5 pt-0">
              <Button
                variant="outline"
                className="w-full justify-between text-sm bg-secondary/70 hover:bg-secondary group-hover:border-primary/30"
                onClick={() => setActiveTab("password-analyzer")}
              >
                Open Tool
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )

  const FileToolsSection = () => (
    <div className="space-y-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex items-center gap-2 mb-2"
      >
        <FileArchive className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold tracking-tight">File Tools</h3>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* File Encryption Tool Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <Card className="tool-card overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
            <CardHeader className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">File Encryption</CardTitle>
                  <CardDescription>Encrypt and decrypt files securely</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="p-5 pt-0">
              <Button
                variant="outline"
                className="w-full justify-between text-sm bg-secondary/70 hover:bg-secondary group-hover:border-primary/30"
                onClick={() => setActiveTab("encryption")}
              >
                Open Tool
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* File Transfer Estimator Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <Card className="tool-card overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
            <CardHeader className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Transfer Estimator</CardTitle>
                  <CardDescription>Estimate file transfer times</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="p-5 pt-0">
              <Button
                variant="outline"
                className="w-full justify-between text-sm bg-secondary/70 hover:bg-secondary group-hover:border-primary/30"
                onClick={() => setActiveTab("estimator")}
              >
                Open Tool
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* File Compressor Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <Card className="tool-card overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
            <CardHeader className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileArchive className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">File Compressor</CardTitle>
                  <CardDescription>Compress files to reduce size</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="p-5 pt-0">
              <Button
                variant="outline"
                className="w-full justify-between text-sm bg-secondary/70 hover:bg-secondary group-hover:border-primary/30"
                onClick={() => setActiveTab("compressor")}
              >
                Open Tool
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Hash Generator Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
          <Card className="tool-card overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
            <CardHeader className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileDigit className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Hash Generator</CardTitle>
                  <CardDescription>Generate file hashes for integrity checks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="p-5 pt-0">
              <Button
                variant="outline"
                className="w-full justify-between text-sm bg-secondary/70 hover:bg-secondary group-hover:border-primary/30"
                onClick={() => setActiveTab("hash-generator")}
              >
                Open Tool
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Password Generator Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
          <Card className="tool-card overflow-hidden border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
            <CardHeader className="p-5 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <KeyRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Password Generator</CardTitle>
                  <CardDescription>Generate strong, secure passwords</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="p-5 pt-0">
              <Button
                variant="outline"
                className="w-full justify-between text-sm bg-secondary/70 hover:bg-secondary group-hover:border-primary/30"
                onClick={() => setActiveTab("password-generator")}
              >
                Open Tool
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-background border border-primary/20 p-8">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: animateHero ? 1 : 0, y: animateHero ? 0 : 20 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-2">
                        Security Dashboard
                      </Badge>
                      <h1 className="text-3xl md:text-4xl font-bold">Advanced Security Tools for Digital Protection</h1>
                      <p className="text-muted-foreground text-lg">
                        Comprehensive suite of security tools to protect your data, analyze vulnerabilities, and enhance
                        your digital security posture.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: animateHero ? 1 : 0, y: animateHero ? 0 : 20 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="flex flex-wrap gap-3 pt-2"
                    >
                      <Button className="gap-2" onClick={fetchData}>
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh Dashboard
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={() => setActiveTab("network-test")}>
                        <ShieldAlert className="h-4 w-4" />
                        Run Security Scan
                      </Button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: animateHero ? 1 : 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="flex flex-wrap gap-4 pt-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">File Encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">Password Analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">Network Security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">Code Protection</span>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: animateHero ? 1 : 0, scale: animateHero ? 1 : 0.9 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative flex-shrink-0 w-[280px] h-[280px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full animate-pulse"></div>
                    <div className="absolute inset-4 bg-gradient-to-br from-background to-background/80 rounded-full flex items-center justify-center">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Shield className="h-24 w-24 text-primary/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            animate={{
                              rotate: 360,
                            }}
                            transition={{
                              duration: 20,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "linear",
                            }}
                            className="w-full h-full"
                          >
                            <div className="absolute top-12 right-12 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Lock className="h-4 w-4 text-primary" />
                            </div>
                            <div className="absolute bottom-12 right-12 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Wifi className="h-4 w-4 text-primary" />
                            </div>
                            <div className="absolute bottom-12 left-12 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <FileDigit className="h-4 w-4 text-primary" />
                            </div>
                            <div className="absolute top-12 left-12 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <KeyRound className="h-4 w-4 text-primary" />
                            </div>
                            <div className="absolute top-[50%] right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center transform -translate-y-1/2">
                              <Code className="h-4 w-4 text-primary" />
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Security Tools Section */}
            <SecurityToolsSection />

            {/* File Tools Section */}
            <FileToolsSection />
          </>
        )

      case "code-obfuscator":
        return <CodeObfuscationTool />
      case "network-analyzer":
        return <NetworkAnalyzer />
      case "network-test":
        return <NetworkTestTool />
      case "encryption":
        return <FileEncryptionTool />
      case "estimator":
        return <FileTransferEstimator />
      case "compressor":
        return <FileCompressor />
      case "hash-generator":
        return <HashGenerator />
      case "site-inspector":
        return <SiteSecurityInspector />
      case "password-generator":
        return <PasswordGenerator />
      case "password-analyzer":
        return <PasswordPatternAnalyzer />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} username={username} onLogout={logout} />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 max-w-[280px] sm:max-w-[320px]">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    NetSecure
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <AppSidebar
                  activeTab={activeTab}
                  setActiveTab={(tab: string) => {
                    setActiveTab(tab)
                    setMobileSidebarOpen(false)
                  }}
                  username={username}
                  onLogout={logout}
                />
              </div>
            </SheetContent>
          </Sheet>
          <div className="font-semibold text-lg">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "code-obfuscator" && "Code Obfuscator"}
            {activeTab === "encryption" && "File Encryption"}
            {activeTab === "estimator" && "Transfer Estimator"}
            {activeTab === "compressor" && "File Compressor"}
            {activeTab === "hash-generator" && "Hash Generator"}
            {activeTab === "site-inspector" && "Site Inspector"}
            {activeTab === "password-generator" && "Password Generator"}
            {activeTab === "password-analyzer" && "Password Analyzer"}
            {activeTab === "network-analyzer" && "Network Analyzer"}
            {activeTab === "network-test" && "Network Test"}
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Help</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Get help with this tool</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="bg-card rounded-xl border shadow-sm p-4 md:p-6">{renderContent()}</div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default function Page() {
  return <SecureApp />
}
