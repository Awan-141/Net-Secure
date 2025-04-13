import { Clock } from "lucide-react"

export function HistoricalData() {
  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-card-foreground">Historical Performance</h3>
          <div className="p-1 bg-primary/20 rounded-lg">
            <Clock className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>

        <div className="w-full h-[180px]">
          <canvas id="historyChart"></canvas>
        </div>
      </div>
    </div>
  )
}

