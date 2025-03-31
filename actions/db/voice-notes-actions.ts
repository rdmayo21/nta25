"use server"

import { db } from "@/db/db"
import { InsertVoiceNote, SelectVoiceNote, voiceNotesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { generateOverviewAction } from "@/actions/api-actions"
import { analyzeThemesAction } from "@/actions/api-actions"
import { extractLocationAction } from "@/actions/api-actions"

export async function createVoiceNoteAction(
  voiceNote: InsertVoiceNote
): Promise<ActionState<SelectVoiceNote>> {
  try {
    // Generate overview if transcription is available
    let overview = undefined;
    // Comment out location until database is updated
    // let location = undefined;
    
    if (voiceNote.transcription) {
      try {
        // Generate overview
        const overviewResult = await generateOverviewAction(voiceNote.transcription);
        if (overviewResult.isSuccess && overviewResult.overview) {
          overview = overviewResult.overview;
        } else {
          console.log(`Could not generate overview: ${overviewResult.message}`);
        }
        
        // Comment out location extraction until database is updated
        /* 
        // Extract location
        const locationResult = await extractLocationAction(voiceNote.transcription);
        if (locationResult.isSuccess && locationResult.location) {
          location = locationResult.location;
          console.log(`Extracted location: ${location}`);
        } else {
          console.log(`No location found: ${locationResult.message}`);
        }
        */
      } catch (error) {
        console.error("Error generating overview (continuing anyway):", error);
      }
    }
    
    // Create object without location and duration fields
    const insertData = {
      ...voiceNote,
      overview,
      // location,  // Remove until database is updated
      // duration: 0 // Remove until database is updated
    };
    
    // Remove duration property if it exists in the incoming data
    if ('duration' in insertData) {
      delete insertData.duration;
    }
    
    const [newVoiceNote] = await db
      .insert(voiceNotesTable)
      .values(insertData)
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
  audioUrl?: string,
  duration?: number
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
    
    // Generate overview (comment out location until database is updated)
    let overview = undefined;
    // let location = undefined;
    
    try {
      // Generate overview
      const overviewResult = await generateOverviewAction(data.content);
      if (overviewResult.isSuccess && overviewResult.overview) {
        overview = overviewResult.overview;
        console.log("Generated overview:", overview);
      } else {
        console.log("Could not generate overview:", overviewResult.message);
      }
      
      /* Comment out location extraction until database is updated
      // Extract location
      const locationResult = await extractLocationAction(data.content);
      if (locationResult.isSuccess && locationResult.location) {
        location = locationResult.location;
        console.log("Extracted location:", location);
      } else {
        console.log("No location found:", locationResult.message);
      }
      */
    } catch (error) {
      console.error("Error generating overview (continuing anyway):", error);
    }
    
    // Make sure we have all required fields, omitting location and duration until DB is updated
    const noteData = {
      userId,
      transcription: data.content,
      title: data.title || "Untitled Voice Note",
      audioUrl: data.audioUrl || "",
      // duration: data.duration || 0, // Omit until database is updated
      overview,
      // location
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
      hasOverview: !!newNote.overview
      // hasLocation: !!newNote.location
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

export async function analyzeVoiceNoteThemesAction(
  userId: string
): Promise<ActionState<Array<{ theme: string; description: string; noteCount: number }>>> {
  try {
    // Get all the user's voice notes
    const { isSuccess, data: notes, message } = await getVoiceNotesAction(userId);
    
    if (!isSuccess || !notes || notes.length === 0) {
      return { 
        isSuccess: false, 
        message: notes && notes.length === 0 
          ? "No voice notes found to analyze" 
          : `Failed to retrieve notes: ${message}` 
      };
    }
    
    // Extract transcriptions from the notes
    const transcriptions = notes.map(note => note.transcription);
    
    // Use the OpenAI API to analyze themes
    const { isSuccess: analysisSuccess, themes, message: analysisMessage } = await analyzeThemesAction(transcriptions);
    
    if (!analysisSuccess || !themes) {
      return { isSuccess: false, message: `Failed to analyze themes: ${analysisMessage}` };
    }
    
    return {
      isSuccess: true,
      message: "Themes analyzed successfully",
      data: themes
    };
  } catch (error) {
    console.error("Error analyzing voice note themes:", error);
    return { 
      isSuccess: false, 
      message: `Failed to analyze themes: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Comment out this entire function until the database is updated
/*
export async function generateLocationsForExistingNotesAction(
  userId: string
): Promise<ActionState<number>> {
  try {
    const { isSuccess, data: notes, message } = await getVoiceNotesAction(userId);
    
    if (!isSuccess || !notes) {
      return { isSuccess: false, message: `Failed to retrieve notes: ${message}` };
    }
    
    const notesWithoutLocations = notes.filter(note => !note.location);
    
    if (notesWithoutLocations.length === 0) {
      return { isSuccess: true, message: "No notes without location information found", data: 0 };
    }
    
    let updatedCount = 0;
    
    for (const note of notesWithoutLocations) {
      try {
        const locationResult = await extractLocationAction(note.transcription);
        
        if (locationResult.isSuccess && locationResult.location) {
          await db.update(voiceNotesTable)
            .set({ location: locationResult.location })
            .where(eq(voiceNotesTable.id, note.id));
          
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error generating location for note ${note.id}:`, error);
        // Continue with the next note
      }
    }
    
    return {
      isSuccess: true,
      message: `Generated location information for ${updatedCount} existing notes`,
      data: updatedCount
    };
  } catch (error) {
    console.error("Error generating locations for existing notes:", error);
    return { 
      isSuccess: false, 
      message: `Failed to generate locations: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
*/ 