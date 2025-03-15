"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"

// Higher contrast card for important content or when more visual separation is needed
const HighContrastCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-card text-card-foreground rounded-lg border-2 border-primary/20 shadow-lg dark:bg-zinc-900 dark:border-zinc-700",
      className
    )}
    {...props}
  />
))
HighContrastCard.displayName = "HighContrastCard"

// Extend other card components for convenience
const HighContrastCardHeader = CardHeader
const HighContrastCardFooter = CardFooter
const HighContrastCardTitle = CardTitle
const HighContrastCardDescription = CardDescription
const HighContrastCardContent = CardContent

export { 
  HighContrastCard, 
  HighContrastCardHeader, 
  HighContrastCardFooter, 
  HighContrastCardTitle, 
  HighContrastCardDescription, 
  HighContrastCardContent 
} 