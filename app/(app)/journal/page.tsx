"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, MessageSquare } from "lucide-react"
import JournalPageContent from "./_components/journal-page-content"
import PageSkeleton from "./_components/page-skeleton"

export default async function JournalPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/login")
  }
  
  return (
    <div className="container max-w-4xl py-6">
      <h1 className="mb-6 text-3xl font-bold">Voice Journal</h1>
      
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span>Notes</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
        </TabsList>
        
        <Suspense fallback={<PageSkeleton />}>
          <JournalPageContent userId={userId} />
        </Suspense>
      </Tabs>
    </div>
  )
} 