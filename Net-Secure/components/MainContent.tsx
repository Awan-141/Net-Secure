import { ReactNode } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Shield, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SecurityToolsSection } from "./SecurityToolsSection";
import { FileToolsSection } from "./FileToolsSection";
import { FileEncryptionTool } from "@/components/file-encryption-tool";
import { FileTransferEstimator } from "@/components/file-transfer-estimator";
import { FileCompressor } from "@/components/file-compressor";
import { HashGenerator } from "@/components/hash-generator";
import { SiteSecurityInspector } from "@/components/site-security-inspector";
import { PasswordGenerator } from "@/components/password-generator";
import { PasswordPatternAnalyzer } from "@/components/password-pattern-analyzer";
import { NetworkAnalyzer } from "@/components/network-analyzer";
import { NetworkTestTool } from "@/components/network-test-app";
import { CodeObfuscationTool } from "@/components/code-obfuscation-tool";

interface MainContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  animateHero: boolean;
  fetchData: () => void;
  loading: boolean;
}

export const MainContent: React.FC<MainContentProps> = ({ activeTab, setActiveTab, animateHero, fetchData, loading }) => {
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
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Tools */}
          <SecurityToolsSection setActiveTab={setActiveTab} />
          <FileToolsSection setActiveTab={setActiveTab} />
        </>
      );
    case "code-obfuscator":
      return <CodeObfuscationTool />;
    case "network-analyzer":
      return <NetworkAnalyzer />;
    case "network-test":
      return <NetworkTestTool />;
    case "encryption":
      return <FileEncryptionTool />;
    case "estimator":
      return <FileTransferEstimator />;
    case "compressor":
      return <FileCompressor />;
    case "hash-generator":
      return <HashGenerator />;
    case "site-inspector":
      return <SiteSecurityInspector />;
    case "password-generator":
      return <PasswordGenerator />;
    case "password-analyzer":
      return <PasswordPatternAnalyzer />;
    default:
      return null;
  }
};
