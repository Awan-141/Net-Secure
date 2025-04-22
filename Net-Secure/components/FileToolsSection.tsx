import { motion } from "framer-motion"
import { FileArchive, Lock, Zap, ArrowRight } from "lucide-react"
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FileToolsSectionProps {
  setActiveTab: (tab: string) => void;
}

export const FileToolsSection: React.FC<FileToolsSectionProps> = ({ setActiveTab }) => (
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
                <FileArchive className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Hash Generator</CardTitle>
                <CardDescription>Generate file hashes</CardDescription>
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
    </div>
  </div>
)
