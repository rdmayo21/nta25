"use server"

import { db } from "@/db/db"
import { InsertVoiceNote, SelectVoiceNote, voiceNotesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, desc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { generateOverviewAction, analyzeThemesAction, extractLocationAction } from "@/actions/api-actions"
import { deleteFileStorageAction } from "../storage/storage-actions"

interface CreateVoiceNoteInput {
  userId: string
  title: string
  transcription: string
  duration: number
  audioPath: string
  bucketName: string
}

export async function createVoiceNoteAction(
  data: CreateVoiceNoteInput
): Promise<ActionState<SelectVoiceNote>> {
  try {
    const { userId, title, transcription, duration, audioPath, bucketName } = data

    // 1. Clean the title (remove surrounding quotes and trim)
    const cleanedTitle = title.replace(/^\"|\"$/g, '').trim()

    // 2. Generate overview if transcription is available
    let overview: string | undefined = undefined
    if (transcription) {
      try {
        const overviewResult = await generateOverviewAction(transcription)
        if (overviewResult.isSuccess && overviewResult.overview) {
          // Clean the overview as well (optional, but good practice)
          overview = overviewResult.overview.replace(/^\"|\"$/g, '').trim()
        } else {
          console.log(`Could not generate overview: ${overviewResult.message}`)
        }
      } catch (error) {
        console.error("Error generating overview (continuing anyway):", error)
      }
    }

    // 3. Prepare data for DB insertion (no audioUrl)
    const insertData: InsertVoiceNote = {
      userId,
      title: cleanedTitle,
      transcription,
      duration,
      overview // Will be null if not generated
      // createdAt and updatedAt are handled by the DB
    }

    // 4. Insert into Database
    const [newVoiceNote] = await db
      .insert(voiceNotesTable)
      .values(insertData)
      .returning()

    // 5. Delete the temporary audio file from storage (fire-and-forget approach for now)
    // We don't necessarily want to fail the whole operation if deletion fails,
    // but we should log it.
    deleteFileStorageAction(bucketName, audioPath)
      .then(result => {
        if (!result.isSuccess) {
          console.error(`Failed to delete temporary audio file ${audioPath} from bucket ${bucketName}: ${result.message}`)
        } else {
          console.log(`Successfully deleted temporary audio file: ${audioPath}`)
        }
      })
      .catch(error => {
        console.error(`Error calling deleteFileStorageAction for ${audioPath}:`, error)
      })

    return {
      isSuccess: true,
      message: "Voice note created successfully",
      data: newVoiceNote
    }
  } catch (error) {
    console.error("Error creating voice note:", error)
    // Extract the audioPath for logging if available in the error context or data
    const pathInfo = typeof data === 'object' && data?.audioPath ? ` (related audio path: ${data.audioPath})` : ''
    return {
      isSuccess: false,
      message: `Failed to create voice note${pathInfo}: ${error instanceof Error ? error.message : String(error)}`
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

export async function updateVoiceNoteTranscriptionAction(
  id: string,
  newTranscription: string
): Promise<ActionState<SelectVoiceNote>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Authentication required" }
    }

    // Optional: Add logic to check if the note belongs to the user
    const existingNote = await db.query.voiceNotes.findFirst({
      where: eq(voiceNotesTable.id, id)
    })

    if (!existingNote) {
      return { isSuccess: false, message: "Voice note not found" }
    }

    if (existingNote.userId !== userId) {
      return { isSuccess: false, message: "Unauthorized to update this voice note" }
    }

    // Perform the update
    const [updatedVoiceNote] = await db
      .update(voiceNotesTable)
      .set({
        transcription: newTranscription,
        updatedAt: new Date() // Manually update the timestamp
      })
      .where(eq(voiceNotesTable.id, id))
      .returning()

    // Potentially regenerate overview after transcription update? (optional)
    // For now, just update transcription.

    return {
      isSuccess: true,
      message: "Transcription updated successfully",
      data: updatedVoiceNote
    }
  } catch (error) {
    console.error("Error updating voice note transcription:", error)
    return {
      isSuccess: false,
      message: `Failed to update transcription: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

export async function updateVoiceNoteAction(
  id: string,
  data: Partial<Omit<InsertVoiceNote, 'transcription' | 'userId' | 'createdAt' | 'id'>> // Exclude transcription etc.
): Promise<ActionState<SelectVoiceNote>> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { isSuccess: false, message: "Authentication required" }
    }

    // Verify ownership before update
    const existingNote = await db.query.voiceNotes.findFirst({ where: eq(voiceNotesTable.id, id) })
    if (!existingNote) {
      return { isSuccess: false, message: "Voice note not found" }
    }
    if (existingNote.userId !== userId) {
      return { isSuccess: false, message: "Unauthorized to update this voice note" }
    }

    // Clean title if present in update data
    const updateData = { ...data }
    if (updateData.title) {
      updateData.title = updateData.title.replace(/^\"|\"$/g, '').trim()
    }

    const [updatedVoiceNote] = await db
      .update(voiceNotesTable)
      .set({ ...updateData, updatedAt: new Date() }) // Ensure updatedAt is updated
      .where(eq(voiceNotesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Voice note updated successfully",
      data: updatedVoiceNote
    }
  } catch (error) {
    console.error("Error updating voice note:", error)
    return { isSuccess: false, message: `Failed to update voice note: ${error instanceof Error ? error.message : String(error)}` }
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

export async function analyzeVoiceNoteThemesAction(
  userId: string
): Promise<ActionState<Array<{ theme: string; description: string; noteCount: number }>>> {
  try {
    // Get all the user's voice notes
    const { isSuccess, data: notes, message } = await getVoiceNotesAction(userId)
    
    if (!isSuccess || !notes || notes.length === 0) {
      return { 
        isSuccess: false, 
        message: notes && notes.length === 0 
          ? "No voice notes found to analyze" 
          : `Failed to retrieve notes: ${message}` 
      }
    }
    
    // Extract transcriptions from the notes
    const transcriptions = notes.map(note => note.transcription)
    
    // Use the OpenAI API to analyze themes
    const { isSuccess: analysisSuccess, themes, message: analysisMessage } = await analyzeThemesAction(transcriptions)
    
    if (!analysisSuccess || !themes) {
      return { isSuccess: false, message: `Failed to analyze themes: ${analysisMessage}` }
    }
    
    return {
      isSuccess: true,
      message: "Themes analyzed successfully",
      data: themes
    }
  } catch (error) {
    console.error("Error analyzing voice note themes:", error)
    return { 
      isSuccess: false, 
      message: `Failed to analyze themes: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

// Comment out this entire function until the database is updated
/*
export async function generateLocationsForExistingNotesAction(
  userId: string
): Promise<ActionState<number>> {
  try {
    const { isSuccess, data: notes, message } = await getVoiceNotesAction(userId)
    
    if (!isSuccess || !notes) {
      return { isSuccess: false, message: `Failed to retrieve notes: ${message}` }
    }
    
    const notesWithoutLocations = notes.filter(note => !note.location)
    
    if (notesWithoutLocations.length === 0) {
      return { isSuccess: true, message: "No notes without location information found", data: 0 }
    }
    
    let updatedCount = 0
    
    for (const note of notesWithoutLocations) {
      try {
        const locationResult = await extractLocationAction(note.transcription)
        
        if (locationResult.isSuccess && locationResult.location) {
          await db.update(voiceNotesTable)
            .set({ location: locationResult.location })
            .where(eq(voiceNotesTable.id, note.id))
          
          updatedCount++
        }
      } catch (error) {
        console.error(`Error generating location for note ${note.id}:`, error)
        // Continue with the next note
      }
    }
    
    return {
      isSuccess: true,
      message: `Generated location information for ${updatedCount} existing notes`,
      data: updatedCount
    }
  } catch (error) {
    console.error("Error generating locations for existing notes:", error)
    return { 
      isSuccess: false, 
      message: `Failed to generate locations: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
*/ 