"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { createVoiceNoteAction } from "@/actions/db/voice-notes-actions"
import { transcribeAudioAction, generateTitleAction } from "@/actions/api-actions"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  userId: string
  onRecordingComplete?: () => void
  floating?: boolean
}

export default function VoiceRecorder({ userId, onRecordingComplete, floating = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [processingStatus, setProcessingStatus] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = async () => {
        // Automatically process the recording when it stops
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        audioChunksRef.current = []
        await processRecording(audioBlob)
      }
      
      audioChunksRef.current = []
      mediaRecorderRef.current.start()
      setIsRecording(true)
      
      // Set timer to track recording time
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error("Error starting recording:", error)
      toast.error("Failed to access microphone")
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsProcessing(true)
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }
  
  const processRecording = async (audioBlob: Blob) => {
    try {
      setProcessingStatus("Transcribing...")
      
      // Step 1: Transcribe the audio
      const transcriptionResult = await transcribeAudioAction(audioBlob)
      
      if (!transcriptionResult.isSuccess) {
        toast.error(transcriptionResult.message)
        setIsProcessing(false)
        return
      }
      
      const transcription = transcriptionResult.transcription || "No transcription available"
      
      // Step 2: Generate a title using GPT-4o mini
      setProcessingStatus("Generating title...")
      const titleResult = await generateTitleAction(transcription)
      
      if (!titleResult.isSuccess) {
        toast.error(titleResult.message)
        setIsProcessing(false)
        return
      }
      
      const title = titleResult.title || "Untitled Voice Note"
      
      // Step 3: Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Step 4: Save the voice note
      setProcessingStatus("Saving...")
      
      // Do not include duration field until database is updated
      const result = await createVoiceNoteAction({
        userId,
        title,
        audioUrl, // In a real app, you'd upload to storage first and save the URL
        transcription
        // duration: recordingTime // Uncomment once database is updated
      })
      
      if (result.isSuccess) {
        toast.success("Voice note saved: " + title)
        
        // Clean up the URL
        URL.revokeObjectURL(audioUrl)
        
        if (onRecordingComplete) {
          onRecordingComplete()
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error processing recording:", error)
      toast.error("Failed to process recording")
    } finally {
      setIsProcessing(false)
      setProcessingStatus("")
    }
  }
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }
  
  if (floating) {
    return (
      <div className="flex items-center justify-center">
        {isRecording ? (
          <div className="flex items-center gap-2 bg-background py-2 px-4 rounded-full shadow-lg">
            <div className="text-sm font-medium">{formatTime(recordingTime)}</div>
            <Button 
              variant="destructive" 
              size="icon" 
              className="rounded-full h-12 w-12 shadow-lg"
              onClick={stopRecording}
              disabled={isProcessing}
            >
              <Square className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <>
            {isProcessing ? (
              <div className="flex items-center gap-2 bg-background py-2 px-4 rounded-full shadow-lg">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">{processingStatus}</span>
              </div>
            ) : (
              <Button 
                variant="default" 
                size="icon"
                className={cn(
                  "rounded-full h-14 w-14 shadow-lg",
                  floating ? "bg-primary hover:bg-primary/90" : ""
                )}
                onClick={startRecording}
              >
                <Mic className="h-6 w-6" />
              </Button>
            )}
          </>
        )}
      </div>
    )
  }
  
  return (
    <Card className="w-full border border-border shadow-md">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-4">
            {isRecording ? (
              <>
                <div className="text-sm font-medium">{formatTime(recordingTime)}</div>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={stopRecording}
                  disabled={isProcessing}
                >
                  <Square className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{processingStatus}</span>
                  </div>
                ) : (
                  <Button 
                    variant="default" 
                    size="icon" 
                    onClick={startRecording}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 

//might add something later