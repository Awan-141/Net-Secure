"use client"

import type React from "react"

import { Info } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ToolExplanationProps {
  title: string
  description: React.ReactNode
  initiallyExpanded?: boolean
}

export function ToolExplanation({ title, description, initiallyExpanded = true }: ToolExplanationProps) {
  const [isOpen, setIsOpen] = useState(initiallyExpanded)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="tool-explanation mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Info className="h-5 w-5" />
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
            <span className="sr-only">{isOpen ? "Close" : "Open"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2">{description}</CollapsibleContent>
    </Collapsible>
  )
}

