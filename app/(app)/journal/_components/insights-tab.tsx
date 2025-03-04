"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { analyzeVoiceNoteThemesAction } from "@/actions/db/voice-notes-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface InsightsTabProps {
  userId: string
}

interface Theme {
  theme: string
  description: string
  noteCount: number
  keywords?: string[]
}

export default function InsightsTab({ userId }: InsightsTabProps) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load themes on initial render
  useEffect(() => {
    analyzeThemes()
  }, [userId])

  const analyzeThemes = async () => {
    try {
      setIsLoading(true)
      
      const result = await analyzeVoiceNoteThemesAction(userId)
      
      if (result.isSuccess && result.data) {
        // Add some sample keywords for each theme
        const themesWithKeywords = result.data.map(theme => ({
          ...theme,
          keywords: generateSampleKeywords(theme.theme)
        }))
        setThemes(themesWithKeywords)
        if (isRefreshing) {
          toast.success(result.message || "Analysis refreshed")
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error analyzing themes:", error)
      toast.error("Failed to analyze themes")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefreshAnalysis = () => {
    setIsRefreshing(true)
    analyzeThemes()
  }

  // Generate sample keywords based on theme name for demo purposes
  const generateSampleKeywords = (theme: string): string[] => {
    const keywordSets: Record<string, string[]> = {
      'Work Productivity': ['meetings', 'deadlines', 'focus', 'projects'],
      'App Testing Feedback': ['transcription', 'accuracy', 'features', 'bugs'],
      'Health & Wellness': ['energy', 'congestion', 'recovery', 'sleep'],
      'Future Plans': ['goals', 'aspirations', 'events', 'planning'],
      'Personal Growth': ['learning', 'progress', 'challenges', 'reflection'],
      'Creative Ideas': ['inspiration', 'concepts', 'design', 'innovation']
    }

    // Return keywords if they exist for the theme, or generate generic ones
    return keywordSets[theme] || 
      ['important', 'frequent', 'recurring', 'notable'].slice(0, 2 + Math.floor(Math.random() * 3))
  }

  if (isLoading && !isRefreshing) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 md:px-6 mb-4 flex-none">
          <h2 className="text-xl font-semibold">Themes & Patterns</h2>
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 md:px-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="w-full overflow-hidden mb-6">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-40 mb-1" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-6 w-20" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 md:px-6 mb-4 flex-none">
        <h2 className="text-xl font-semibold">Themes & Patterns</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefreshAnalysis}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Analysis
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
        {themes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p className="mb-4">No themes detected in your voice notes yet.</p>
              <Button 
                onClick={handleRefreshAnalysis}
                disabled={isRefreshing}
              >
                Analyze Notes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {themes.map((theme, index) => (
              <Card key={index} className="w-full overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{theme.theme}</CardTitle>
                  <CardDescription>
                    Detected in {theme.noteCount} {theme.noteCount === 1 ? 'entry' : 'entries'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {theme.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {theme.keywords?.map((keyword, keyIndex) => (
                      <Badge key={keyIndex} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 