"use client"

import { useState } from "react"
import VoiceRecorder from "@/components/voice-recorder"
import VoiceNotesList from "@/components/voice-notes-list"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SelectVoiceNote } from "@/db/schema"
import { Card, CardContent } from "@/components/ui/card"

interface NotesTabProps {
  userId: string
}

export default function NotesTab({ userId }: NotesTabProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedNote, setSelectedNote] = useState<SelectVoiceNote | null>(null)
  
  const handleRecordingComplete = () => {
    setRefreshKey(prev => prev + 1)
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <VoiceRecorder 
            userId={userId} 
            onRecordingComplete={handleRecordingComplete} 
          />
        </CardContent>
      </Card>
      
      <div key={refreshKey}>
        <VoiceNotesList 
          userId={userId} 
          onSelect={setSelectedNote}
        />
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