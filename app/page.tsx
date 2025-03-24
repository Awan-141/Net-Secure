"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Chart } from "chart.js/auto"
import { FileEncryptionTool } from "@/components/file-encryption-tool"
import { FileTransferEstimator } from "@/components/file-transfer-estimator"
import { NetworkStats } from "@/components/network-stats"
import { SecurityScans } from "@/components/security-scans"
import { HistoricalData } from "@/components/historical-data"
import { SimpleEncryption } from "@/components/simple-encryption"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Icons
import { RefreshCw, Lock, X, Zap, Activity, Menu, User } from "lucide-react"

type Result = {
  [key: string]: string | number
}

type HistoryEntry = {
  timestamp: string
  ping: number
  download: number
  upload: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http:35.169.254.242:3001/"

const NetworkTestApp: React.FC = () => {
  const router = useRouter()
  const [results, setResults] = useState<Result>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [progress, setProgress] = useState<number>(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [chart, setChart] = useState<Chart | null>(null)
  const [isEstimatorOpen, setIsEstimatorOpen] = useState(false)
  const [isEncryptionToolOpen, setIsEncryptionToolOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [username, setUsername] = useState<string>("")

  const openEstimator = () => setIsEstimatorOpen(true)
  const closeEstimator = () => setIsEstimatorOpen(false)
  const openEncryptionTool = () => setIsEncryptionToolOpen(true)
  const closeEncryptionTool = () => setIsEncryptionToolOpen(false)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const logout = () => {
    localStorage.removeItem("username")
    router.push("/login")
  }

  useEffect(() => {
    // Check if user is logged in
    const storedUsername = localStorage.getItem("username")
    if (!storedUsername) {
      router.push("/login")
    } else {
      setUsername(storedUsername)
    }
  }, [router])

  const fetchData = async () => {
    setLoading(true)
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

    const fetchTest = async (endpoint: string, key: string, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(API_URL + endpoint)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()
          setResults((prev) => ({ ...prev, [key]: data[key] || `Error: ${data.error}` }))
          return
        } catch (error) {
          if (i === retries - 1) {
            setResults((prev) => ({ ...prev, [key]: `Request failed: ${(error as Error).message}` }))
          }
        }
      }
    }

    await fetchTest("ip", "ip")
    const startTime = typeof window !== "undefined" ? Date.now() : 0
    await fetchTest("ping", "ping")
    setResults((prev) => ({ ...prev, ping: `${Date.now() - startTime}ms` }))

    const downloadStart = Date.now()
    const downloadResponse = await fetch(API_URL + "download")
    const reader = downloadResponse.body?.getReader()
    if (!reader) throw new Error("Failed to read download stream")
    let receivedLength = 0
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      receivedLength += value.length
      setProgress((receivedLength / Number(downloadResponse.headers.get("content-length"))) * 100)
    }
    const blob = new Blob(chunks)
    const downloadSpeed = blob.size / ((Date.now() - downloadStart) / 1000) / 1024 / 1024
    setResults((prev) => ({ ...prev, download: `Download Speed: ${downloadSpeed.toFixed(2)} MB/s` }))

    let uploadSpeed = 0
    const formData = new FormData()
    formData.append("file", new File([blob], "downloaded_test_file", { type: blob.type }))

    try {
      const uploadStart = Date.now()

      const uploadResponse = await fetch(API_URL + "upload", {
        method: "POST",
        body: formData,
        headers: {
          "x-start-time": uploadStart.toString(),
        },
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      }

      const uploadData = await uploadResponse.json()

      const uploadTime = uploadData.uploadTime || Date.now() - uploadStart
      uploadSpeed = blob.size / (uploadTime / 1000) / 1024 / 1024

      setResults((prev) => ({ ...prev, upload: `Upload Speed: ${uploadSpeed.toFixed(2)} MB/s` }))
    } catch (error) {
      console.error("Upload error:", error)
      setResults((prev) => ({ ...prev, upload: `Upload failed: ${(error as Error).message}` }))
    }

    await Promise.all([
      fetchTest("nmap", "nmap"),
      fetchTest("open-ports", "ports"),
      fetchTest("services", "services"),
      fetchTest("vuln-scan", "vuln"),
      fetchTest("ssl-check", "ssl"),
      fetchTest("firewall-check", "firewall"),
    ])

    setHistory((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString("en-US"),
        ping: Number.parseFloat(results.ping as string),
        download: Number.parseFloat(downloadSpeed.toFixed(2)),
        upload: Number.parseFloat(uploadSpeed.toFixed(2)),
      },
    ])

    setLoading(false)
  }

  useEffect(() => {
    if (typeof window !== "undefined" && history.length > 0) {
      const ctx = document.getElementById("historyChart") as HTMLCanvasElement | null
      if (!ctx) return

      if (chart) chart.destroy()

      const newChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: history.map((entry) => entry.timestamp),
          datasets: [
            {
              label: "Ping (ms)",
              data: history.map((entry) => entry.ping),
              borderColor: "hsl(var(--chart-3))",
              backgroundColor: "hsla(var(--chart-3), 0.1)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Download Speed (MB/s)",
              data: history.map((entry) => entry.download),
              borderColor: "hsl(var(--chart-1))",
              backgroundColor: "hsla(var(--chart-1), 0.1)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Upload Speed (MB/s)",
              data: history.map((entry) => entry.upload),
              borderColor: "hsl(var(--chart-2))",
              backgroundColor: "hsla(var(--chart-2), 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: "hsl(var(--foreground))",
                font: {
                  family: "var(--font-inter), sans-serif",
                  size: 10,
                },
                boxWidth: 12,
                padding: 8,
              },
            },
            tooltip: {
              backgroundColor: "hsl(var(--card))",
              titleColor: "hsl(var(--card-foreground))",
              bodyColor: "hsl(var(--card-foreground))",
              borderColor: "hsl(var(--border))",
              borderWidth: 1,
              padding: 8,
              displayColors: true,
              boxPadding: 4,
              usePointStyle: true,
              titleFont: {
                family: "var(--font-inter), sans-serif",
                size: 12,
                weight: "bold",
              },
              bodyFont: {
                family: "var(--font-inter), sans-serif",
                size: 11,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "hsl(var(--border))",
              },
              ticks: {
                color: "hsl(var(--foreground))",
                font: {
                  family: "var(--font-inter), sans-serif",
                  size: 10,
                },
                padding: 4,
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "hsl(var(--foreground))",
                font: {
                  family: "var(--font-inter), sans-serif",
                  size: 10,
                },
                maxRotation: 45,
                minRotation: 45,
                padding: 4,
              },
            },
          },
          elements: {
            point: {
              radius: 2,
              hoverRadius: 4,
            },
            line: {
              borderWidth: 1.5,
            },
          },
          interaction: {
            mode: "index",
            intersect: false,
          },
          animation: {
            duration: 800,
            easing: "easeOutQuart",
          },
        },
      })

      setChart(newChart)
    }
  }, [history, chart])

  useEffect(() => {
    fetchData()
  }, [])

  const NavItem = ({
    icon,
    label,
    value,
    active,
  }: {
    icon: React.ReactNode
    label: string
    value: string
    active: boolean
  }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "flex items-center space-x-2 px-2.5 py-2 rounded-lg transition-all duration-200",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
          : "text-sidebar-foreground hover:bg-sidebar-accent",
      )}
    >
      <div
        className={cn(
          "w-6 h-6 flex items-center justify-center rounded-md",
          active ? "bg-sidebar-primary-foreground/10" : "bg-sidebar-accent",
        )}
      >
        {icon}
      </div>
      <span className="font-medium text-xs">{label}</span>
    </button>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <NetworkStats results={results} progress={progress} openEstimator={openEstimator} />
              <SecurityScans results={results} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
              <div className="col-span-1">
                <SimpleEncryption openEncryptionTool={openEncryptionTool} />
              </div>
              <div className="col-span-1">
                <HistoricalData />
              </div>
            </div>
          </>
        )
      case "encryption":
        return <FileEncryptionTool />
      case "estimator":
        return <FileTransferEstimator />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1629] text-foreground dark">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-3 border-b border-[#1a2942]">
        <h1 className="text-lg font-bold">NetSecure</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <User size={14} />
            <span>{username}</span>
          </div>
          <button onClick={toggleMobileMenu} className="p-1.5 rounded-lg bg-muted text-muted-foreground">
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#0a1629] p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Menu</h2>
            <button onClick={toggleMobileMenu} className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-1.5">
            <NavItem
              icon={<Activity size={16} />}
              label="Dashboard"
              value="dashboard"
              active={activeTab === "dashboard"}
            />
            <NavItem
              icon={<Lock size={16} />}
              label="File Encryption"
              value="encryption"
              active={activeTab === "encryption"}
            />
            <NavItem
              icon={<Zap size={16} />}
              label="Transfer Estimator"
              value="estimator"
              active={activeTab === "estimator"}
            />

            <div className="pt-3 mt-3 border-t border-[#1a2942]">
              <button
                onClick={logout}
                className="w-full text-left px-2.5 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-48 h-screen sticky top-0 border-r border-[#1a2942] p-3 bg-[#0f1e36] text-sidebar-foreground">
          <div className="mb-4">
            <h1 className="text-lg font-bold text-primary">NetSecure</h1>
            <p className="text-muted-foreground text-[10px] mt-0.5">Network Security Suite</p>
          </div>

          <nav className="space-y-1 flex-1">
            <NavItem
              icon={<Activity size={16} />}
              label="Dashboard"
              value="dashboard"
              active={activeTab === "dashboard"}
            />
            <NavItem
              icon={<Lock size={16} />}
              label="File Encryption"
              value="encryption"
              active={activeTab === "encryption"}
            />
            <NavItem
              icon={<Zap size={16} />}
              label="Transfer Estimator"
              value="estimator"
              active={activeTab === "estimator"}
            />
          </nav>

          <div className="mt-auto space-y-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1a2942] rounded-lg">
              <User size={14} className="text-primary" />
              <span className="font-medium text-xs">{username}</span>
            </div>

            <button
              onClick={fetchData}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center py-1.5 px-2.5 bg-[#1a2942] hover:bg-[#243552] text-white rounded-lg transition-colors text-xs"
            >
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 lg:p-4">
          {/* Mobile Action Button */}
          <div className="lg:hidden flex justify-end mb-3">
            <button
              onClick={fetchData}
              className="flex items-center space-x-1.5 py-1.5 px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Page Title */}
          <div className="mb-3">
            <h1 className="text-base font-bold">
              {activeTab === "dashboard" && "Network Dashboard"}
              {activeTab === "encryption" && "File Encryption"}
              {activeTab === "estimator" && "Transfer Estimator"}
            </h1>
            <p className="text-muted-foreground text-xs">
              {activeTab === "dashboard" && "Monitor your network performance and security"}
              {activeTab === "encryption" && "Secure your files with strong encryption"}
              {activeTab === "estimator" && "Calculate file transfer times based on network speed"}
            </p>
          </div>

          {/* Content */}
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      {isEstimatorOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-[#0f1e36] rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-3">
            <div className="sticky top-0 z-10 bg-[#0f1e36] p-3 border-b border-[#1a2942] flex justify-between items-center">
              <h2 className="text-base font-bold">File Transfer Estimator</h2>
              <button
                onClick={closeEstimator}
                className="p-1.5 rounded-lg hover:bg-[#1a2942] text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3">
              <FileTransferEstimator />
            </div>
          </div>
        </div>
      )}

      {/* Encryption Tool Modal */}
      {isEncryptionToolOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-[#0f1e36] rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-3">
            <div className="sticky top-0 z-10 bg-[#0f1e36] p-3 border-b border-[#1a2942] flex justify-between items-center">
              <h2 className="text-base font-bold">File Encryption Tool</h2>
              <button
                onClick={closeEncryptionTool}
                className="p-1.5 rounded-lg hover:bg-[#1a2942] text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3">
              <FileEncryptionTool />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <NetworkTestApp />
}

