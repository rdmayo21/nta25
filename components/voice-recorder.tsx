"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { createVoiceNoteAction } from "@/actions/db/voice-notes-actions"
import { transcribeAudioAction, generateTitleAction } from "@/actions/api-actions"
import { uploadFileStorageAction, deleteFileStorageAction } from "@/actions/storage/storage-actions"
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from 'uuid';

interface VoiceRecorderProps {
  userId: string
  onRecordingComplete?: () => void
  floating?: boolean
}

const MAX_RECORDING_DURATION_SECONDS = 3600; // 1 hour

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
        await processRecording(audioBlob, recordingTime)
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
  
  const processRecording = async (audioBlob: Blob, duration: number) => {
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_AUDIO_BUCKET;
    if (!bucketName) {
      toast.error("Bucket name not found in environment variables")
      return;
    }
    
    let audioPath: string | undefined = undefined; // Define here to use in cleanup
    
    try {
      // 1. Generate a unique filename and path
      const uniqueFilename = `${uuidv4()}.webm`;
      audioPath = `${userId}/temp-audio/${uniqueFilename}`; // Assign path here
      
      // Create a File object from the Blob
      const audioFile = new File([audioBlob], uniqueFilename, { type: audioBlob.type });
      
      // 2. Upload temporary audio file
      setProcessingStatus("Uploading audio...");
      // Pass the audioFile instead of audioBlob
      const uploadResult = await uploadFileStorageAction(bucketName, audioPath, audioFile);
      
      if (!uploadResult.isSuccess || !uploadResult.data?.path) {
        toast.error(`Audio upload failed: ${uploadResult.message}`);
        audioPath = undefined; // Prevent cleanup attempt if upload failed
        setIsProcessing(false);
        return;
      }
      
      // Use the confirmed path from the result for consistency, though it should match audioPath
      audioPath = uploadResult.data.path;
      console.log("Audio uploaded to temp path:", audioPath);
      
      // 3. Transcribe the audio
      setProcessingStatus("Transcribing...");
      // Pass the audioFile here as well if the action expects File, or keep Blob if it handles Blob
      // Assuming transcribeAudioAction can handle the Blob directly based on previous code
      const transcriptionResult = await transcribeAudioAction(audioBlob);
      
      if (!transcriptionResult.isSuccess) {
        toast.error(`Transcription failed: ${transcriptionResult.message}`);
        // Cleanup attempted using the confirmed audioPath
        if (audioPath) { // Check if upload was successful before trying delete
          deleteFileStorageAction(bucketName, audioPath).catch((err: Error) => console.error("Failed cleanup upload on transcription error:", err));
        }
        setIsProcessing(false);
        return;
      }
      
      const transcription = transcriptionResult.transcription || "No transcription generated.";
      
      // 4. Generate a title
      setProcessingStatus("Generating title...");
      const titleResult = await generateTitleAction(transcription);
      const title = titleResult.isSuccess ? (titleResult.title || "Untitled Note") : "Untitled Note";
      if (!titleResult.isSuccess) {
        console.warn(`Title generation failed: ${titleResult.message}, using default.`);
      }
      
      // 5. Save the voice note (Server action handles deletion of temp file using audioPath)
      setProcessingStatus("Saving note...");
      const result = await createVoiceNoteAction({
        userId,
        title,
        transcription,
        duration,
        audioPath: audioPath, // Pass the confirmed path
        bucketName: bucketName
      });
      
      if (result.isSuccess) {
        toast.success(`Voice note saved: ${result.data.title}`);
        if (onRecordingComplete) {
          onRecordingComplete();
        }
      } else {
        toast.error(`Failed to save note: ${result.message}`);
        // Log potential orphaned file
        console.error("Saving note failed. The temporary audio file might still exist:", audioPath);
      }
    } catch (error) {
      console.error("Error processing recording:", error);
      toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Attempt cleanup if path exists
      if (audioPath) { // Check if upload might have succeeded before the error
         deleteFileStorageAction(bucketName, audioPath).catch((err: Error) => console.error("Failed cleanup upload on general error:", err));
      }
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
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