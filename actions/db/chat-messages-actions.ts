"use server"

import { db } from "@/db/db"
import { InsertChatMessage, SelectChatMessage, chatMessagesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, asc } from "drizzle-orm"

export async function createChatMessageAction(
  message: InsertChatMessage
): Promise<ActionState<SelectChatMessage>> {
  try {
    const [newMessage] = await db
      .insert(chatMessagesTable)
      .values(message)
      .returning()
    
    return {
      isSuccess: true,
      message: "Chat message created successfully",
      data: newMessage
    }
  } catch (error) {
    console.error("Error creating chat message:", error)
    return { isSuccess: false, message: "Failed to create chat message" }
  }
}

export async function getChatMessagesAction(
  userId: string
): Promise<ActionState<SelectChatMessage[]>> {
  try {
    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessagesTable.userId, userId),
      orderBy: [asc(chatMessagesTable.createdAt)]
    })
    
    return {
      isSuccess: true,
      message: "Chat messages retrieved successfully",
      data: messages
    }
  } catch (error) {
    console.error("Error getting chat messages:", error)
    return { isSuccess: false, message: "Failed to get chat messages" }
  }
}

export async function deleteUserChatMessagesAction(
  userId: string
): Promise<ActionState<void>> {
  try {
    await db.delete(chatMessagesTable).where(eq(chatMessagesTable.userId, userId))
    
    return {
      isSuccess: true,
      message: "Chat history cleared successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting chat messages:", error)
    return { isSuccess: false, message: "Failed to clear chat history" }
  }
}

/*
export async function clearChatHistoryAction(
  userId: string
): Promise<ActionState<void>> {
  return deleteUserChatMessagesAction(userId)
}
*/ 