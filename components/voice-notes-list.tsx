"use client"

import { useEffect, useState } from "react"
import { SelectVoiceNote } from "@/db/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getVoiceNotesAction, deleteVoiceNoteAction } from "@/actions/db/voice-notes-actions"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Play, Pause, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    loadNotes()
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteNotes')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
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
        
        // Remove from favorites if it was favorited
        if (favorites.includes(id)) {
          const newFavorites = favorites.filter(noteId => noteId !== id)
          setFavorites(newFavorites)
          localStorage.setItem('favoriteNotes', JSON.stringify(newFavorites))
        }
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
  
  const toggleFavorite = (id: string) => {
    let newFavorites: string[]
    
    if (favorites.includes(id)) {
      newFavorites = favorites.filter(noteId => noteId !== id)
    } else {
      newFavorites = [...favorites, id]
    }
    
    setFavorites(newFavorites)
    localStorage.setItem('favoriteNotes', JSON.stringify(newFavorites))
  }
  
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border border-border/40">
            <CardHeader className="pb-2">
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
      <Card className="border border-border/40">
        <CardContent className="p-6 text-center text-muted-foreground">
          No voice notes yet. Create your first one!
        </CardContent>
      </Card>
    )
  }
  
  // Sort notes: favorites first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    const aIsFavorite = favorites.includes(a.id)
    const bIsFavorite = favorites.includes(b.id)
    
    if (aIsFavorite && !bIsFavorite) return -1
    if (!aIsFavorite && bIsFavorite) return 1
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  
  return (
    <div className="space-y-4">
      {sortedNotes.map(note => (
        <Card key={note.id} className="overflow-hidden border-border/40 hover:border-border transition-colors">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base md:text-lg font-medium">
                  {note.title}
                </CardTitle>
                {favorites.includes(note.id) && (
                  <Badge variant="secondary" className="h-5 px-1.5">
                    <Star className="h-3 w-3 fill-primary text-primary mr-1" />
                    <span className="text-xs">Favorite</span>
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => handlePlayPause(note)}
                  title={playingNote === note.id ? "Pause" : "Play"}
                  className="h-8 w-8"
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
                  onClick={() => toggleFavorite(note.id)}
                  title={favorites.includes(note.id) ? "Remove from favorites" : "Add to favorites"}
                  className="h-8 w-8"
                >
                  <Star className={`h-4 w-4 ${favorites.includes(note.id) ? "fill-primary text-primary" : ""}`} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(note.id)}
                  disabled={isDeleting === note.id}
                  title="Delete"
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs">
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 pb-4 pt-0">
            <div
              className="line-clamp-3 text-sm text-muted-foreground cursor-pointer"
              onClick={() => onSelect?.(note)}
            >
              {note.keyInsight ? (
                <>
                  <span className="font-medium text-xs text-primary">
                    Key:
                  </span>{" "}
                  {truncateText(note.keyInsight, 120)}
                </>
              ) : (
                truncateText(note.transcription)
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 