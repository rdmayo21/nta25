"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { getVoiceNotesAction } from "@/actions/db/voice-notes-actions"
import { chatWithNotesAction } from "@/actions/api-actions"
import { toast } from "sonner"

interface ChatTabProps {
  userId: string
}

export default function ChatTab({ userId }: ChatTabProps) {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Ask questions about your voice journal entries. Try asking where you were on a specific date!"
    }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question.trim() || isLoading) return
    
    // Add user message to chat
    const userMessage = { role: "user" as const, content: question }
    setMessages(prev => [...prev, userMessage])
    
    // Clear input and set loading state
    setQuestion("")
    setIsLoading(true)
    
    try {
      // Call the actual API action
      const response = await chatWithNotesAction(question)
      
      if (response.isSuccess && response.response) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: response.response || "Sorry, I couldn't process your request." 
        }])
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error("Error in chat:", error)
      toast.error("An error occurred while processing your question")
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, an error occurred. Please try again later."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="pt-4 px-4 md:px-6">
        <h2 className="text-xl font-semibold mb-4">Chat with Your Notes</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Ask questions about your journal entries, including where you were on specific dates.
        </p>
      </div>
      
      {/* Scrollable message area with padding at bottom to ensure content isn't hidden behind input bar */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-75" />
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed input bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t py-4 px-4 md:px-6">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            placeholder="Ask about your voice notes (e.g., 'Where was I on Friday?')"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
} 