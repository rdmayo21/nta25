"use client"

import { useEffect, useState } from "react"
import { SelectVoiceNote } from "@/db/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getVoiceNotesAction, deleteVoiceNoteAction } from "@/actions/db/voice-notes-actions"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceNotesListProps {
  userId: string
  onSelect?: (note: SelectVoiceNote) => void
}

export default function VoiceNotesList({ userId, onSelect }: VoiceNotesListProps) {
  const [notes, setNotes] = useState<SelectVoiceNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [playingNote, setPlayingNote] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    loadNotes()
  }, [userId])

  useEffect(() => {
    // Clean up audio on unmount
    return () => {
      if (audioElement) {
        audioElement.pause()
      }
    }
  }, [audioElement])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const result = await getVoiceNotesAction(userId)
      if (result.isSuccess) {
        setNotes(result.data)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error loading notes:", error)
      toast.error("Failed to load notes")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      const result = await deleteVoiceNoteAction(id)
      if (result.isSuccess) {
        setNotes(notes.filter(note => note.id !== id))
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("Failed to delete note")
    } finally {
      setIsDeleting(null)
    }
  }

  const handlePlayPause = (note: SelectVoiceNote) => {
    if (playingNote === note.id) {
      // Pause currently playing note
      if (audioElement) {
        audioElement.pause()
        setPlayingNote(null)
      }
    } else {
      // Stop any currently playing audio
      if (audioElement) {
        audioElement.pause()
      }
      
      // Play selected note
      const audio = new Audio(note.audioUrl)
      audio.onended = () => setPlayingNote(null)
      audio.play().catch(err => {
        console.error("Error playing audio:", err)
        toast.error("Could not play audio")
      })
      
      setAudioElement(audio)
      setPlayingNote(note.id)
    }
  }
  
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  if (notes.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No voice notes yet. Create your first one!
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-4">
      {notes.map(note => (
        <Card key={note.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{note.title}</CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => handlePlayPause(note)}
                  title={playingNote === note.id ? "Pause" : "Play"}
                >
                  {playingNote === note.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(note.id)}
                  disabled={isDeleting === note.id}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div
              className="line-clamp-3 text-sm text-muted-foreground cursor-pointer"
              onClick={() => onSelect?.(note)}
            >
              {truncateText(note.transcription)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 