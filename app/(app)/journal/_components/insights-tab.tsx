"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import { analyzeVoiceNoteThemesAction } from "@/actions/db/voice-notes-actions"
import { Skeleton } from "@/components/ui/skeleton"

interface InsightsTabProps {
  userId: string
}

interface Theme {
  theme: string
  description: string
  noteCount: number
}

export default function InsightsTab({ userId }: InsightsTabProps) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const analyzeThemes = async () => {
    try {
      setIsLoading(true)
      
      const result = await analyzeVoiceNoteThemesAction(userId)
      
      if (result.isSuccess && result.data) {
        setThemes(result.data)
        setHasAnalyzed(true)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error analyzing themes:", error)
      toast.error("Failed to analyze themes")
    } finally {
      setIsLoading(false)
    }
  }

  // Load themes on initial render
  useEffect(() => {
    analyzeThemes()
  }, [userId])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Themes & Patterns</h2>
        <Button
          size="sm"
          onClick={analyzeThemes}
          disabled={isLoading}
          className="gap-1"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? "Analyzing..." : "Refresh Analysis"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : themes.length > 0 ? (
        <div className="space-y-4">
          {themes.map((theme, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">{theme.theme}</CardTitle>
                </div>
                <CardDescription>
                  Found in approximately {theme.noteCount} {theme.noteCount === 1 ? 'note' : 'notes'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{theme.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {hasAnalyzed 
                ? "No recurring themes detected in your notes yet. Try adding more voice notes!" 
                : "Please click 'Analyze Themes' to analyze your voice notes."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 