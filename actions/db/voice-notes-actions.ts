"use server"

import { db } from "@/db/db"
import { InsertVoiceNote, SelectVoiceNote, voiceNotesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, desc } from "drizzle-orm"

export async function createVoiceNoteAction(
  voiceNote: InsertVoiceNote
): Promise<ActionState<SelectVoiceNote>> {
  try {
    const [newVoiceNote] = await db
      .insert(voiceNotesTable)
      .values(voiceNote)
      .returning()
    
    return {
      isSuccess: true,
      message: "Voice note created successfully",
      data: newVoiceNote
    }
  } catch (error) {
    console.error("Error creating voice note:", error)
    return { isSuccess: false, message: "Failed to create voice note" }
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