/*
<ai_context>
This client component provides a theme switcher for the app.
</ai_context>
*/

"use client"

import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { HTMLAttributes, ReactNode, useEffect, useState } from "react"

interface ThemeSwitcherProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const ThemeSwitcher = ({ children, ...props }: ThemeSwitcherProps) => {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Use resolvedTheme which is more reliable than theme
  const currentTheme = resolvedTheme || theme
  
  const handleChange = (newTheme: "dark" | "light") => {
    console.log("Switching theme to:", newTheme)
    localStorage.setItem("theme", newTheme)
    setTheme(newTheme)
  }

  // Log current theme for debugging
  useEffect(() => {
    if (mounted) {
      console.log("Current theme:", currentTheme)
    }
  }, [currentTheme, mounted])

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) return null

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full p-1 hover:cursor-pointer hover:opacity-80 transition-colors duration-200",
        currentTheme === "dark" ? "bg-zinc-800" : "bg-zinc-200",
        props.className
      )}
      onClick={() => handleChange(currentTheme === "light" ? "dark" : "light")}
      title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {currentTheme === "dark" ? (
        <Sun className="size-5 text-yellow-300" />
      ) : (
        <Moon className="size-5 text-zinc-700" />
      )}
    </div>
  )
}
