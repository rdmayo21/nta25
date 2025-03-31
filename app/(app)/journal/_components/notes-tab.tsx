"use client"

import { useState } from "react"
import VoiceRecorder from "@/components/voice-recorder"
import VoiceNotesList from "@/components/voice-notes-list"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SelectVoiceNote } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { 
  // Comment out until database is updated
  // generateLocationsForExistingNotesAction 
} from "@/actions/db/voice-notes-actions"
import { toast } from "sonner"

interface NotesTabProps {
  userId: string
}

export default function NotesTab({ userId }: NotesTabProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedNote, setSelectedNote] = useState<SelectVoiceNote | null>(null)
  // Comment out until database is updated
  // const [isGeneratingLocations, setIsGeneratingLocations] = useState(false)
  
  /* Comment out until database is updated
  // Handle generating locations for existing notes
  const handleGenerateLocations = async () => {
    setIsGeneratingLocations(true)
    
    try {
      const result = await generateLocationsForExistingNotesAction(userId)
      
      if (result.isSuccess) {
        toast.success(result.message)
        setRefreshKey(prev => prev + 1) // Force refresh
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error generating locations:", error)
      toast.error("An error occurred while extracting location information")
    } finally {
      setIsGeneratingLocations(false)
    }
  }
  */
  
  // Handle when recording is completed
  const handleRecordingComplete = () => {
    setRefreshKey(prev => prev + 1) // Force refresh
  }
  
  return (
    <div className="relative flex flex-col">
      <div className="flex justify-end mb-2 flex-none gap-2">
        {/* Comment out until database is updated
        <Button
          size="sm"
          onClick={handleGenerateLocations}
          disabled={isGeneratingLocations}
          className="gap-1"
        >
          <MapPin className="h-4 w-4" />
          {isGeneratingLocations ? "Processing..." : "Find Locations"}
        </Button>
        */}
      </div>
      
      <div key={refreshKey}>
        <VoiceNotesList 
          userId={userId} 
          onSelect={setSelectedNote}
        />
      </div>
      
      {/* Floating microphone button */}
      <div className="fixed bottom-6 inset-x-0 flex justify-center z-10">
        <div className="shadow-lg rounded-full">
          <VoiceRecorder 
            userId={userId} 
            onRecordingComplete={handleRecordingComplete}
            floating={true}
          />
        </div>
      </div>
      
      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedNote && new Date(selectedNote.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2 space-y-4">
            {selectedNote && (
              <>
                <audio src={selectedNote.audioUrl} controls className="w-full" />
                {selectedNote.overview ? (
                  <div className="rounded-md bg-primary/10 p-4 text-sm">
                    <p className="font-medium">Overview</p>
                    <p>{selectedNote.overview}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Overview not available.</p>
                )}
                <div className="max-h-60 overflow-y-auto rounded-md border p-4 text-sm">
                  <p>{selectedNote.transcription}</p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 