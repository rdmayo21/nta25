"use client"

import ChatInterface from "@/components/chat-interface"

interface ChatTabProps {
  userId: string
}

export default function ChatTab({ userId }: ChatTabProps) {
  return (
    <div className="h-[600px]">
      <ChatInterface userId={userId} />
    </div>
  )
} 