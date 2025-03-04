"use client"

import { useState } from "react"
import VoiceRecorder from "@/components/voice-recorder"
import VoiceNotesList from "@/components/voice-notes-list"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SelectVoiceNote } from "@/db/schema"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { generateInsightsForExistingNotesAction, updateVoiceNoteAction } from "@/actions/db/voice-notes-actions"
import { extractKeyInsightAction } from "@/actions/api-actions"
import { toast } from "sonner"

interface NotesTabProps {
  userId: string
}

export default function NotesTab({ userId }: NotesTabProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedNote, setSelectedNote] = useState<SelectVoiceNote | null>(null)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  
  const handleRecordingComplete = () => {
    setRefreshKey(prev => prev + 1)
  }
  
  const handleGenerateInsights = async () => {
    try {
      setIsGeneratingInsights(true)
      
      const result = await generateInsightsForExistingNotesAction(userId)
      
      if (result.isSuccess) {
        toast.success(result.message)
        // Refresh the list to show new insights
        setRefreshKey(prev => prev + 1)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error generating insights:", error)
      toast.error("Failed to generate insights")
    } finally {
      setIsGeneratingInsights(false)
    }
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
      
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleGenerateInsights}
          disabled={isGeneratingInsights}
          className="gap-1"
        >
          <Sparkles className="h-4 w-4" />
          {isGeneratingInsights ? "Processing..." : "Generate Keys"}
        </Button>
      </div>
      
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
                {selectedNote.keyInsight ? (
                  <div className="rounded-md bg-primary/10 p-4 text-sm">
                    <p className="font-medium">Key Insight</p>
                    <p>{selectedNote.keyInsight}</p>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={async () => {
                        try {
                          if (!selectedNote.id) return;
                          
                          toast.info("Generating insight...");
                          
                          // Extract key insight
                          const insightResult = await extractKeyInsightAction(selectedNote.transcription);
                          
                          if (insightResult.isSuccess && insightResult.insight) {
                            // Update the note with the new insight
                            const updateResult = await updateVoiceNoteAction(
                              selectedNote.id,
                              { keyInsight: insightResult.insight }
                            );
                            
                            if (updateResult.isSuccess) {
                              // Update the selected note to show the insight
                              setSelectedNote({
                                ...selectedNote,
                                keyInsight: insightResult.insight
                              });
                              
                              toast.success("Insight generated successfully");
                              
                              // Refresh the list
                              setRefreshKey(prev => prev + 1);
                            } else {
                              toast.error(updateResult.message);
                            }
                          } else {
                            toast.error(insightResult.message);
                          }
                        } catch (error) {
                          console.error("Error generating insight:", error);
                          toast.error("Failed to generate insight");
                        }
                      }}
                    >
                      Generate Insight
                    </Button>
                  </div>
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