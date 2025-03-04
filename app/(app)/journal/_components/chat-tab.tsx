"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { getVoiceNotesAction } from "@/actions/db/voice-notes-actions"
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
      content: "Ask questions about your voice journal entries"
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
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: generateDemoResponse(question) 
        }])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error in chat:", error)
      toast.error("An error occurred while processing your question")
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, an error occurred. Please try again later."
      }])
      setIsLoading(false)
    }
  }
  
  // Demo function to generate responses
  const generateDemoResponse = (question: string): string => {
    const responses = [
      "Based on your voice notes, you've been focusing on testing the app and providing feedback on transcription accuracy.",
      "Your last voice note was about testing the voice recording feature. You mentioned that the transcription accuracy was impressive.",
      "I noticed that you've been documenting your experience with this journaling app. You mentioned it helps you organize your thoughts better.",
      "You seem to be tracking health-related topics in your notes, including symptoms and recovery progress.",
      "Your voice notes indicate you've been planning future events and setting goals for both personal and professional development."
    ]
    
    // Return a response based on keywords in the question
    if (question.toLowerCase().includes("last note")) {
      return "Your last voice note, recorded on March 3, 2025, was about testing the recording capability of an app. You also mentioned that you were feeling sick but getting better.";
    } else if (question.toLowerCase().includes("health")) {
      return "You've mentioned health-related topics in 7 entries, including symptoms like congestion, recovery periods, and energy levels.";
    } else if (question.toLowerCase().includes("transcription") || question.toLowerCase().includes("accuracy")) {
      return "You've provided feedback about transcription accuracy in several notes. In your most recent note, you mentioned that the voice recognition seems to be working better after the update.";
    } else {
      // Return a random response if no keywords match
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="pt-4 px-4 md:px-6">
        <h2 className="text-xl font-semibold mb-4">Chat with Your Notes</h2>
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
            placeholder="Ask about your voice notes..."
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