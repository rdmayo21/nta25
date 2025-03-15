/*
<ai_context>
The root server layout for the app.
</ai_context>
*/

import {
  createProfileAction,
  getProfileByUserIdAction
} from "@/actions/db/profiles-actions"
import { Toaster } from "@/components/ui/toaster"
import { PostHogPageview } from "@/components/utilities/posthog/posthog-pageview"
import { PostHogUserIdentify } from "@/components/utilities/posthog/posthog-user-identity"
import { Providers } from "@/components/utilities/providers"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { cn } from "@/lib/utils"
import { ClerkProvider } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import FloatingThemeButton from "@/components/utilities/floating-theme-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Voice Journal",
  description: "A full-stack web app template.",
  manifest: "/manifest.json",
  icons: {
    apple: [
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Voice Journal"
  },
  applicationName: "Voice Journal",
  formatDetection: {
    telephone: false
  }
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (userId) {
    const profileRes = await getProfileByUserIdAction(userId)
    if (!profileRes.isSuccess) {
      await createProfileAction({ userId })
    }
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "bg-background antialiased mx-auto min-h-screen w-full scroll-smooth",
            inter.className
          )}
        >
          <Providers
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="voice-journal-theme"
          >
            <PostHogUserIdentify />
            <PostHogPageview />

            {children}

            <TailwindIndicator />
            <FloatingThemeButton />

            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
