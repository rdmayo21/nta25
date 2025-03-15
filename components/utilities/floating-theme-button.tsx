"use client"

import { ThemeSwitcher } from "./theme-switcher"

export default function FloatingThemeButton() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <ThemeSwitcher 
        className="rounded-full bg-secondary p-3 shadow-lg hover:shadow-xl transition-all duration-200"
      />
    </div>
  )
} 