import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface SidebarToggleButtonProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({ sidebarOpen, setSidebarOpen }) => (
  <motion.div 
    className="fixed top-4 left-4 z-30 hidden lg:block"
    initial={false}
    animate={sidebarOpen ? "open" : "closed"}
  >
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full bg-background/95 backdrop-blur-sm hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      <motion.div
        className="flex items-center justify-center"
        variants={{
          open: { rotate: 0, scale: 1 },
          closed: { rotate: 180, scale: 1 }
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.23, 1, 0.32, 1],
          scale: { duration: 0.15 }
        }}
      >
        <ChevronLeft className="h-5 w-5 text-foreground/80" />
      </motion.div>
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/5"
        variants={{
          open: { scale: 1, opacity: 0 },
          closed: { scale: 1.2, opacity: 0.1 }
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </Button>
  </motion.div>
);
