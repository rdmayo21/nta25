"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Trash2 } from "lucide-react"
import { chatWithNotesAction } from "@/actions/api-actions"
import { toast } from "sonner"
import { getChatMessagesAction, deleteUserChatMessagesAction } from "@/actions/db/chat-messages-actions"
import { SelectChatMessage } from "@/db/schema"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ChatTabProps {
  userId: string
}

export default function ChatTab({ userId }: ChatTabProps) {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<SelectChatMessage[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true)
      try {
        const result = await getChatMessagesAction(userId)
        if (result.isSuccess) {
          setMessages(result.data)
        } else {
          toast.error("Failed to load chat history: " + result.message)
          setMessages([])
        }
      } catch (error) {
        console.error("Error fetching chat history:", error)
        toast.error("An error occurred while loading chat history.")
        setMessages([])
      } finally {
        setIsHistoryLoading(false)
      }
    }
    
    fetchHistory()
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isLoading) return
    
    const tempUserMessage: SelectChatMessage = {
      id: `temp-${Date.now()}`,
      userId: userId,
      content: trimmedQuestion,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setMessages(prev => [...prev, tempUserMessage])
    
    setQuestion("")
    setIsLoading(true)
    
    try {
      const response = await chatWithNotesAction(trimmedQuestion)
      
      if (response.isSuccess && response.data) {
        const assistantMessage: SelectChatMessage = {
          id: `temp-ai-${Date.now()}`,
          userId: userId,
          content: response.data,
          role: "assistant",
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setMessages(prev => [...prev.filter(m => m.id !== tempUserMessage.id), tempUserMessage, assistantMessage])

      } else {
        toast.error(response.message || "Failed to get response from assistant.")
        setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
      }
    } catch (error) {
      console.error("Error in chat submission:", error)
      toast.error("An error occurred while processing your question.")
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for clearing chat history
  const handleClearChat = async () => {
    setIsLoading(true) // Reuse isLoading to disable input during clearing
    try {
      const result = await deleteUserChatMessagesAction(userId)
      if (result.isSuccess) {
        setMessages([]) // Clear local state
        toast.success("Chat history cleared.")
      } else {
        toast.error(result.message || "Failed to clear chat history.")
      }
    } catch (error) {
      console.error("Error clearing chat history:", error)
      toast.error("An error occurred while clearing chat history.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6"> 
        <div className="space-y-4">
          {isHistoryLoading ? (
            <div className="text-center text-muted-foreground p-8">Loading history...</div>
          ) : messages.length === 0 && !isLoading ? (
             <div className="text-center text-muted-foreground p-8">
               Ask anything about your notes...
             </div>
           ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[80%] rounded-lg p-3 break-words ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted prose dark:prose-invert"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))
          )}
          
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
          <div ref={messagesEndRef} /> 
        </div>
      </div>
      
      <div className="flex-shrink-0 bg-background border-t py-4 px-4 md:px-6">
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isLoading || isHistoryLoading} 
              onClick={handleClearChat}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Chat
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            placeholder="Ask about your notes..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading || isHistoryLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || isHistoryLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
} 