/*
<ai_context>
This client component provides the providers for the app.
</ai_context>
*/

"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"
import { CSPostHogProvider } from "./posthog/posthog-provider"
import { RegisterSW } from "./pwa/register-sw"
import { useEffect, useState } from "react"

export const Providers = ({ children, ...props }: ThemeProviderProps) => {
  // Add this to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NextThemesProvider {...props}>
      <TooltipProvider>
        <CSPostHogProvider>
          {/* Prevent hydration mismatch by ensuring client-side rendering */}
          {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
          <RegisterSW />
        </CSPostHogProvider>
      </TooltipProvider>
    </NextThemesProvider>
  )
}
