"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, MessageSquare, Lightbulb } from "lucide-react"
import JournalPageContent from "./_components/journal-page-content"
import PageSkeleton from "./_components/page-skeleton"

export default async function JournalPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/login")
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <Tabs defaultValue="notes" className="flex flex-col h-full flex-1">
        {/* Tabs header with sticky positioning */}
        <div className="sticky top-0 z-30 bg-background pt-4 px-4 md:px-6 border-b">
          <TabsList className="grid w-full grid-cols-3 flex-none">
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Notes</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Removed the intermediate wrapper div. Suspense/JournalPageContent is now direct child */}
        {/* TabsContent rendered inside JournalPageContent will inherit flex context */}
         <Suspense fallback={<PageSkeleton />}>
           <JournalPageContent userId={userId} />
         </Suspense>

      </Tabs>
    </div>
  )
} 