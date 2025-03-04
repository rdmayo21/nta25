"use client"

import { useEffect } from "react"

export function RegisterSW() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox
      
      // Add event listeners to handle PWA lifecycle events
      wb.addEventListener("installed", (event: any) => {
        console.log(`PWA service worker installed: ${event.type}`)
      })

      wb.addEventListener("controlling", (event: any) => {
        console.log(`PWA service worker controlling: ${event.type}`)
      })

      wb.addEventListener("activated", (event: any) => {
        console.log(`PWA service worker activated: ${event.type}`)
      })

      // Send message to service worker to skip waiting for update to take effect immediately
      const promptNewVersionAvailable = (event: any) => {
        if (
          confirm(
            "A new version of this app is available. Would you like to update now?"
          )
        ) {
          wb.messageSkipWaiting()
          wb.addEventListener("controlling", (event: any) => {
            window.location.reload()
          })
        }
      }

      wb.addEventListener("waiting", promptNewVersionAvailable)
      wb.addEventListener("externalwaiting", promptNewVersionAvailable)

      // Register the service worker
      wb.register()
    }
  }, [])

  return null
}

// Add this to TypeScript global
declare global {
  interface Window {
    workbox: any
  }
} 