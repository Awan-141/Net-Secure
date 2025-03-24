import { Shield, Lock, Server, AlertTriangle } from "lucide-react"

interface SecurityScansProps {
  results: {
    [key: string]: string | number
  }
}

export function SecurityScans({ results }: SecurityScansProps) {
  return (
    <>
      {/* Security Scan Cards */}
      <div className="col-span-1 bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-card-foreground">Nmap Scan</h3>
            <div className="p-1 bg-primary/20 rounded-lg">
              <Server className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{results.nmap || "—"}</p>
        </div>
      </div>

      <div className="col-span-1 bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-card-foreground">Open Ports</h3>
            <div className="p-1 bg-primary/20 rounded-lg">
              <Server className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{results.ports || "—"}</p>
        </div>
      </div>

      <div className="col-span-1 bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-card-foreground">Services</h3>
            <div className="p-1 bg-primary/20 rounded-lg">
              <Server className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{results.services || "—"}</p>
        </div>
      </div>

      <div className="col-span-1 bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-card-foreground">Vulnerability Scan</h3>
            <div className="p-1 bg-primary/20 rounded-lg">
              <AlertTriangle className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{results.vuln || "—"}</p>
        </div>
      </div>

      <div className="col-span-1 bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-card-foreground">SSL Check</h3>
            <div className="p-1 bg-primary/20 rounded-lg">
              <Lock className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{results.ssl || "—"}</p>
        </div>
      </div>

      <div className="col-span-1 bg-card rounded-xl shadow-lg overflow-hidden border border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-card-foreground">Firewall Check</h3>
            <div className="p-1 bg-primary/20 rounded-lg">
              <Shield className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{results.firewall || "—"}</p>
        </div>
      </div>
    </>
  )
}

