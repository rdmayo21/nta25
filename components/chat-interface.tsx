"use client"

import { useState, useRef, useEffect } from "react"
import { SendHorizontal, User, Bot, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { chatWithNotesAction } from "@/actions/api-actions"
import { createChatMessageAction, getChatMessagesAction, deleteChatMessagesAction } from "@/actions/db/chat-messages-actions"
import { SelectChatMessage } from "@/db/schema"

interface ChatInterfaceProps {
  userId: string
}

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<SelectChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    loadMessages()
  }, [userId])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const loadMessages = async () => {
    try {
      setInitialLoading(true)
      const result = await getChatMessagesAction(userId)
      if (result.isSuccess) {
        setMessages(result.data)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      toast.error("Failed to load chat history")
    } finally {
      setInitialLoading(false)
    }
  }
  
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }
  
  const handleSendMessage = async () => {
    if (!input.trim()) return
    
    // Add user message to UI immediately
    const userMessage: SelectChatMessage = {
      id: Date.now().toString(), // Temporary ID
      userId,
      content: input.trim(),
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput("")
    
    try {
      setIsLoading(true)
      
      // Save user message to database
      const userMessageResult = await createChatMessageAction({
        userId,
        content: userMessage.content,
        role: "user"
      })
      
      if (!userMessageResult.isSuccess) {
        toast.error("Failed to save your message")
        return
      }
      
      // Get AI response
      const aiResponseResult = await chatWithNotesAction(userMessage.content)
      
      if (!aiResponseResult.isSuccess || !aiResponseResult.response) {
        toast.error(aiResponseResult.message || "Failed to get response")
        return
      }
      
      // Save AI message to database
      const aiMessageResult = await createChatMessageAction({
        userId,
        content: aiResponseResult.response,
        role: "assistant"
      })
      
      if (aiMessageResult.isSuccess) {
        // Get all messages again to ensure we have correct IDs
        loadMessages()
      } else {
        // Just add the message to the UI without reloading
        const aiMessage: SelectChatMessage = {
          id: (Date.now() + 1).toString(), // Temporary ID
          userId,
          content: aiResponseResult.response,
          role: "assistant",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error("Error in chat:", error)
      toast.error("An error occurred during chat")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleClearChat = async () => {
    try {
      setIsLoading(true)
      const result = await deleteChatMessagesAction(userId)
      
      if (result.isSuccess) {
        setMessages([])
        toast.success("Chat history cleared")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error clearing chat:", error)
      toast.error("Failed to clear chat history")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  if (initialLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  return (
    <div className="flex h-full flex-col rounded-md border">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Chat with Your Notes</h2>
        <Button variant="outline" size="sm" onClick={handleClearChat} disabled={isLoading || messages.length === 0}>
          Clear History
        </Button>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
              <p>No messages yet. Start by asking something about your voice notes!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] items-start gap-2 rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="mt-0.5">
                    {message.role === "user" ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-sm">{message.content}</div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[80%] items-center gap-2 rounded-lg bg-muted p-3">
                <Bot className="h-5 w-5" />
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your voice notes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
} 