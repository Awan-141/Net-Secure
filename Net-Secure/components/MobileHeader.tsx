import { Button } from "@/components/ui/button";
import { HelpCircle, Menu } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface MobileHeaderProps {
  activeTab: string;
  handleMobileMenuClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ activeTab, handleMobileMenuClick }) => (
  <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 px-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMobileMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
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
);
