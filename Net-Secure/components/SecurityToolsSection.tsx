import { motion } from "framer-motion"
import { Shield, ArrowRight, Code, Scan, ShieldCheck, ShieldAlert } from "lucide-react"
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SecurityToolsSectionProps {
  setActiveTab: (tab: string) => void;
}

export const SecurityToolsSection: React.FC<SecurityToolsSectionProps> = ({ setActiveTab }) => (
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
                <ShieldAlert className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Password Analyzer</CardTitle>
                <CardDescription>Analyze password strength and patterns</CardDescription>
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
