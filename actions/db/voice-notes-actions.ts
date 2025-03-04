"use server"

import { db } from "@/db/db"
import { InsertVoiceNote, SelectVoiceNote, voiceNotesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { extractKeyInsightAction } from "@/actions/api-actions"

export async function createVoiceNoteAction(
  voiceNote: InsertVoiceNote
): Promise<ActionState<SelectVoiceNote>> {
  try {
    // Extract key insight if transcription is available
    let keyInsight = undefined;
    
    if (voiceNote.transcription) {
      try {
        const insightResult = await extractKeyInsightAction(voiceNote.transcription);
        if (insightResult.isSuccess && insightResult.insight) {
          keyInsight = insightResult.insight;
        } else {
          console.log(`Could not generate insight: ${insightResult.message}`);
        }
      } catch (insightError) {
        console.error("Error generating insight (continuing anyway):", insightError);
      }
    }
    
    const [newVoiceNote] = await db
      .insert(voiceNotesTable)
      .values({
        ...voiceNote,
        keyInsight
      })
      .returning()
    
    return {
      isSuccess: true,
      message: "Voice note created successfully",
      data: newVoiceNote
    }
  } catch (error) {
    console.error("Error creating voice note:", error)
    return { 
      isSuccess: false, 
      message: `Failed to create voice note: ${error instanceof Error ? error.message : String(error)}` 
    }
  }
}

export async function getVoiceNotesAction(
  userId: string
): Promise<ActionState<SelectVoiceNote[]>> {
  try {
    const voiceNotes = await db.query.voiceNotes.findMany({
      where: eq(voiceNotesTable.userId, userId),
      orderBy: [desc(voiceNotesTable.createdAt)]
    })
    
    return {
      isSuccess: true,
      message: "Voice notes retrieved successfully",
      data: voiceNotes
    }
  } catch (error) {
    console.error("Error getting voice notes:", error)
    return { isSuccess: false, message: "Failed to get voice notes" }
  }
}

export async function getVoiceNoteAction(
  id: string
): Promise<ActionState<SelectVoiceNote>> {
  try {
    const voiceNote = await db.query.voiceNotes.findFirst({
      where: eq(voiceNotesTable.id, id)
    })
    
    if (!voiceNote) {
      return { isSuccess: false, message: "Voice note not found" }
    }
    
    return {
      isSuccess: true,
      message: "Voice note retrieved successfully",
      data: voiceNote
    }
  } catch (error) {
    console.error("Error getting voice note:", error)
    return { isSuccess: false, message: "Failed to get voice note" }
  }
}

export async function updateVoiceNoteAction(
  id: string,
  data: Partial<InsertVoiceNote>
): Promise<ActionState<SelectVoiceNote>> {
  try {
    const [updatedVoiceNote] = await db
      .update(voiceNotesTable)
      .set(data)
      .where(eq(voiceNotesTable.id, id))
      .returning()
    
    return {
      isSuccess: true,
      message: "Voice note updated successfully",
      data: updatedVoiceNote
    }
  } catch (error) {
    console.error("Error updating voice note:", error)
    return { isSuccess: false, message: "Failed to update voice note" }
  }
}

export async function deleteVoiceNoteAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(voiceNotesTable).where(eq(voiceNotesTable.id, id))
    
    return {
      isSuccess: true,
      message: "Voice note deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting voice note:", error)
    return { isSuccess: false, message: "Failed to delete voice note" }
  }
}

export async function saveVoiceNoteAction(data: {
  content: string,
  title?: string,
  audioUrl?: string
  // other fields
}): Promise<ActionState<SelectVoiceNote>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.error("No user ID found in auth context");
      return { isSuccess: false, message: "Authentication required" };
    }
    
    console.log("Saving voice note for user:", userId);
    
    if (!data.content) {
      return { isSuccess: false, message: "Voice note content is required" };
    }
    
    console.log("Voice note content length:", data.content.length);
    
    // Extract key insight
    let keyInsight = undefined;
    
    try {
      const insightResult = await extractKeyInsightAction(data.content);
      if (insightResult.isSuccess && insightResult.insight) {
        keyInsight = insightResult.insight;
        console.log("Generated insight:", keyInsight);
      } else {
        console.log("Could not generate insight:", insightResult.message);
      }
    } catch (insightError) {
      console.error("Error extracting insight (continuing anyway):", insightError);
    }
    
    // Make sure we have all required fields
    const noteData = {
      userId,
      transcription: data.content,
      title: data.title || "Untitled Voice Note",
      audioUrl: data.audioUrl || "",
      keyInsight
    };
    
    console.log("Saving note with data:", {
      ...noteData,
      transcription: noteData.transcription.substring(0, 50) + "..." // Log only beginning for brevity
    });
    
    const [newNote] = await db.insert(voiceNotesTable)
      .values(noteData)
      .returning();
      
    console.log("Saved voice note:", {
      id: newNote.id,
      title: newNote.title,
      hasKeyInsight: !!newNote.keyInsight
    });
    
    return {
      isSuccess: true,
      message: "Voice note saved successfully",
      data: newNote
    };
  } catch (error) {
    console.error("Error saving voice note:", error);
    return { 
      isSuccess: false, 
      message: `Failed to save voice note: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

export async function generateInsightsForExistingNotesAction(
  userId: string
): Promise<ActionState<number>> {
  try {
    const { isSuccess, data: notes, message } = await getVoiceNotesAction(userId);
    
    if (!isSuccess || !notes) {
      return { isSuccess: false, message: `Failed to retrieve notes: ${message}` };
    }
    
    const notesWithoutInsights = notes.filter(note => !note.keyInsight);
    
    if (notesWithoutInsights.length === 0) {
      return { isSuccess: true, message: "No notes without insights found", data: 0 };
    }
    
    let updatedCount = 0;
    
    for (const note of notesWithoutInsights) {
      try {
        const insightResult = await extractKeyInsightAction(note.transcription);
        
        if (insightResult.isSuccess && insightResult.insight) {
          await db.update(voiceNotesTable)
            .set({ keyInsight: insightResult.insight })
            .where(eq(voiceNotesTable.id, note.id))
          
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error generating insight for note ${note.id}:`, error);
        // Continue with the next note
      }
    }
    
    return {
      isSuccess: true,
      message: `Generated insights for ${updatedCount} existing notes`,
      data: updatedCount
    };
  } catch (error) {
    console.error("Error generating insights for existing notes:", error);
    return { 
      isSuccess: false, 
      message: `Failed to generate insights: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 