"use client"
import { Zap, Activity, ArrowUp, ArrowDown } from "lucide-react"

interface NetworkStatsProps {
  results: {
    [key: string]: string | number
  }
  progress: number
  openEstimator: () => void
}

export function NetworkStats({ results, progress, openEstimator }: NetworkStatsProps) {
  // Extract ping value as a number for styling
  const pingValue =
    typeof results.ping === "string" ? Number.parseInt(results.ping.toString().replace(/[^0-9]/g, "")) : 0

  // Determine ping quality for styling
  const getPingQuality = (ping: number) => {
    if (ping < 30) return { color: "bg-[hsl(var(--chart-1))]", text: "Excellent" }
    if (ping < 60) return { color: "bg-[hsl(var(--chart-2))]", text: "Good" }
    if (ping < 100) return { color: "bg-yellow-500", text: "Average" }
    if (ping < 150) return { color: "bg-orange-500", text: "Poor" }
    return { color: "bg-red-500", text: "Bad" }
  }

  const pingQuality = getPingQuality(pingValue)

  return (
    <>
      {/* IP Address Card */}
      <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-card-foreground">IP Address</h3>
            <div className="p-1 bg-primary/20 rounded-lg">
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="text-center py-2">
            <p className="text-xl font-bold text-white tracking-wider font-mono">
              {results?.ip ? results.ip.toString().replace(/^::ffff:/, "") : "—"}
            </p>
            <p className="text-muted-foreground text-xs mt-1">Your Public IP Address</p>
          </div>
        </div>
      </div>

      {/* Ping Card */}
      <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-card-foreground">Ping</h3>
            <div className="p-1 bg-primary/20 rounded-lg">
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-2">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-700"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={`text-${pingQuality.color.replace("bg-", "")}`}
                  strokeWidth="10"
                  strokeDasharray={`${Math.min(pingValue / 2, 250)} 250`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white">{results.ping}</span>
                <span className="text-[10px] text-muted-foreground">Latency</span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className={`w-2 h-2 rounded-full ${pingQuality.color}`}></div>
              <span className="text-xs text-muted-foreground">{pingQuality.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Speed Card */}
      <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-card-foreground">Network Speed</h3>
            <div className="p-1 bg-primary/20 rounded-lg">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <ArrowDown className="h-3.5 w-3.5 text-chart-1" />
                <span className="text-muted-foreground text-xs">Download</span>
              </div>
              <span className="font-medium text-xs text-white">{results.download}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <ArrowUp className="h-3.5 w-3.5 text-chart-2" />
                <span className="text-muted-foreground text-xs">Upload</span>
              </div>
              <span className="font-medium text-xs text-white">{results.upload}</span>
            </div>

            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[hsl(var(--chart-1))] to-[hsl(var(--chart-2))] rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <button
              onClick={openEstimator}
              className="w-full mt-1 py-1.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-xs font-medium"
            >
              Calculate Transfer Times
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

