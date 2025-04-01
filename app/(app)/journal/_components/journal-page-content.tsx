"use server"

import { TabsContent } from "@/components/ui/tabs"
import NotesTab from "./notes-tab"
import ChatTab from "./chat-tab"

interface JournalPageContentProps {
  userId: string
}

export default async function JournalPageContent({ userId }: JournalPageContentProps) {
  return (
    <>
      <TabsContent value="notes">
        <NotesTab userId={userId} />
      </TabsContent>
      
      <TabsContent value="chat" className="flex flex-col flex-1 overflow-hidden">
        <ChatTab userId={userId} />
      </TabsContent>
    </>
  )
} 