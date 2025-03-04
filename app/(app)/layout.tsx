"use server"

import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Mic } from "lucide-react"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

export default async function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/login")
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link
            href="/journal"
            className="text-xl font-bold"
          >
            Voice Journal
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              href="/journal"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Mic className="h-4 w-4" />
              Journal
            </Link>
            
            <UserButton afterSignOutUrl="/login" />
          </div>
        </div>
      </nav>
      
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
} 