import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Label } from "./label"
import { Switch } from "./switch"
import { Slider } from "./slider"
import { cn } from "@/lib/utils"

const sidebarVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

const contentVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 }
}

interface ConfigSection {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
}

interface ConfigSectionProps extends ConfigSection {
  defaultExpanded?: boolean
}

export function ConfigSection({ 
  title, 
  icon: Icon, 
  children,
  defaultExpanded = true 
}: ConfigSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={sidebarVariants}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-primary/20">
        <CardHeader className="py-3">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-primary" />}
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CardHeader>
        
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0 pb-3">
                {children}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

interface ToggleOptionProps {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

export function ToggleOption({
  label,
  description,
  checked,
  onCheckedChange,
  disabled
}: ToggleOptionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={label} className="font-medium">
          {label}
        </Label>
        <Switch
          id={label}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}

interface SliderOptionProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showValue?: boolean
  valueFormatter?: (value: number) => string
  description?: string
}

export function SliderOption({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  showValue = true,
  valueFormatter = (v) => v.toString(),
  description
}: SliderOptionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{label}</Label>
        {showValue && (
          <span className="text-sm text-muted-foreground">
            {valueFormatter(value)}
          </span>
        )}
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        disabled={disabled}
        className="py-2"
      />
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}

interface VisualIndicatorProps {
  value: number
  className?: string
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  valueFormatter?: (value: number) => string
  colorClass?: string
}

export function CircularIndicator({
  value,
  className,
  size = "md",
  showValue = true,
  valueFormatter = (v) => `${v}%`,
  colorClass = "text-primary"
}: VisualIndicatorProps) {
  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-lg",
    lg: "w-20 h-20 text-xl"
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-secondary"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${value}, 100`}
          className={colorClass}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center font-semibold">
          {valueFormatter(value)}
        </div>
      )}
    </div>
  )
}

interface RadioOptionProps {
  label: string
  description?: string
  options: {
    label: string
    value: string
    description?: string
  }[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function RadioOption({
  label,
  description,
  options,
  value,
  onChange,
  disabled
}: RadioOptionProps) {
  return (
    <div className="space-y-2">
      <Label className="font-medium">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <div className="grid gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "default" : "outline"}
            size="sm"
            className={cn(
              "justify-start text-left font-normal",
              value === option.value && "bg-primary text-primary-foreground"
            )}
            onClick={() => onChange(option.value)}
            disabled={disabled}
          >
            <div>
              <div>{option.label}</div>
              {option.description && (
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}