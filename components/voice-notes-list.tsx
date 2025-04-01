"use client"

import { useEffect, useState, useRef } from "react"
import { SelectVoiceNote } from "@/db/schema"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getVoiceNotesAction, deleteVoiceNoteAction, updateVoiceNoteTranscriptionAction } from "@/actions/db/voice-notes-actions"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Star, Edit, Save, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface VoiceNotesListProps {
  userId: string
  onSelect?: (note: SelectVoiceNote) => void
}

export default function VoiceNotesList({ userId, onSelect }: VoiceNotesListProps) {
  const [notes, setNotes] = useState<SelectVoiceNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadNotes()
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteNotes')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [userId])

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
  
  const handleEditClick = (note: SelectVoiceNote) => {
    setEditingNoteId(note.id)
    setEditingText(note.transcription)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditingText("")
  }

  const handleSaveEdit = async () => {
    if (!editingNoteId || !editingText) return

    setIsSavingEdit(true)
    try {
      const result = await updateVoiceNoteTranscriptionAction(editingNoteId, editingText)
      if (result.isSuccess) {
        toast.success("Transcription updated")
        setNotes(notes.map(n => n.id === editingNoteId ? { ...n, transcription: editingText, updatedAt: new Date() } : n))
        handleCancelEdit()
      } else {
        toast.error(`Failed to update: ${result.message}`)
      }
    } catch (error) {
      console.error("Error saving transcription edit:", error)
      toast.error("An error occurred while saving")
    } finally {
      setIsSavingEdit(false)
    }
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
      <Card className="border border-border shadow-md">
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
                {editingNoteId !== note.id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditClick(note)}
                    title="Edit Transcription"
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleFavorite(note.id)}
                  title={favorites.includes(note.id) ? "Remove from favorites" : "Add to favorites"}
                  className="h-8 w-8"
                  disabled={editingNoteId === note.id}
                >
                  <Star className={`h-4 w-4 ${favorites.includes(note.id) ? "fill-primary text-primary" : ""}`} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(note.id)}
                  disabled={isDeleting === note.id || editingNoteId === note.id}
                  title="Delete"
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs">
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              {note.updatedAt && new Date(note.updatedAt).getTime() !== new Date(note.createdAt).getTime() && (
                <span className="italic">(edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })})</span>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 pb-4 pt-0">
            {editingNoteId === note.id ? (
              <div className="space-y-2 mt-2">
                <Textarea
                  ref={textareaRef}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={5}
                  className="text-sm"
                  disabled={isSavingEdit}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isSavingEdit}
                  >
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit || editingText === note.transcription}
                  >
                    {isSavingEdit ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="line-clamp-3 text-sm text-muted-foreground cursor-pointer"
                onClick={() => onSelect?.(note)}
                title="Click to view full note (if applicable)"
              >
                {note.overview ? (
                  <>
                    <span className="font-medium text-xs text-primary block mb-1">
                      Overview:
                    </span>
                    {truncateText(note.overview, 150)}
                  </>
                ) : (
                  <>
                    <span className="font-medium text-xs text-primary block mb-1">
                      Transcription:
                    </span>
                    {truncateText(note.transcription, 150)}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 