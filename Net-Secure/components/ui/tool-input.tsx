import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check, Maximize2, Minimize2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { KeyboardShortcut } from "./tooltip"

interface ToolInputProps {
  title?: string
  value: string
  onChange?: (value: string) => void
  onFileUpload?: (file: File) => void
  supportedFileTypes?: string[]
  statusText?: string
  showMaximize?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean
  fileTypes?: string[] // Add this prop definition
}

export function ToolInput({
  title,
  value,
  onChange,
  className,
  onFileUpload,
  supportedFileTypes,
  statusText,
  showMaximize = false,
  placeholder,
  disabled,
  fileTypes,
  ...props
}: ToolInputProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [copySuccess, setCopySuccess] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const copyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle fullscreen toggle (Cmd/Ctrl + Shift + F)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        if (showMaximize) {
          setIsFullscreen(prev => !prev)
        }
      }

      // Handle file upload (Cmd/Ctrl + O)
      if ((e.metaKey || e.ctrlKey) && e.key === 'o' && onFileUpload) {
        e.preventDefault()
        fileInputRef.current?.click()
      }

      // Handle copy (Cmd/Ctrl + C) with visual feedback
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && window.getSelection()?.toString() === '') {
        e.preventDefault()
        handleCopy()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [value, showMaximize, onFileUpload])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopySuccess(true)
      
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
      
      copyTimeoutRef.current = setTimeout(() => {
        setCopySuccess(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file)
    }
  }

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const renderInput = () => (
    <div className={cn(
      "relative rounded-lg border bg-background",
      isFullscreen && "fixed inset-4 z-50",
      className
    )}>
      <div className="absolute right-2 top-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            copySuccess
              ? "text-success bg-success/10 hover:bg-success/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
          title={`Copy to clipboard (${process.platform === 'darwin' ? '⌘' : 'Ctrl'}+C)`}
        >
          {copySuccess ? (
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Check className="h-4 w-4" />
            </motion.div>
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>

        {onFileUpload && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept={supportedFileTypes?.map(type => `.${type}`).join(',')}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
              title={`Upload file (${process.platform === 'darwin' ? '⌘' : 'Ctrl'}+O)`}
            >
              <Upload className="h-4 w-4" />
            </button>
          </>
        )}
        {showMaximize && (
          <button
            type="button"
            onClick={() => setIsFullscreen(prev => !prev)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
            title={`Toggle fullscreen (${process.platform === 'darwin' ? '⌘' : 'Ctrl'}+Shift+F)`}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className={cn(
          "min-h-[100px] w-full resize-none rounded-lg border-0 bg-transparent p-4 pr-12 font-mono text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          isFullscreen && "h-full"
        )}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />

      {statusText && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {statusText}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">{title}</div>
          {onFileUpload && (
            <KeyboardShortcut
              combo={[process.platform === 'darwin' ? '⌘' : 'Ctrl', 'O']}
              className="text-xs text-muted-foreground"
            />
          )}
        </div>
      )}
      {isFullscreen ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          >
            {renderInput()}
          </motion.div>
        </AnimatePresence>
      ) : (
        renderInput()
      )}
    </div>
  )
}