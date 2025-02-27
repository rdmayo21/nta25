/*
<ai_context>
Exports the database schema for the app.
</ai_context>
*/

export * from "./profiles-schema"
export * from "./todos-schema"
export * from "./voice-notes-schema"
export * from "./chat-messages-schema"

// Setup relations and queries for Drizzle
import { relations, sql } from "drizzle-orm"
import { pgTable } from "drizzle-orm/pg-core"

// Import tables for defining relationships and query builder
import { profilesTable } from "./profiles-schema"
import { todosTable } from "./todos-schema" 
import { voiceNotesTable } from "./voice-notes-schema"
import { chatMessagesTable } from "./chat-messages-schema"

// Setup for query builder
export const schema = {
  profiles: profilesTable,
  todos: todosTable,
  voiceNotes: voiceNotesTable,
  chatMessages: chatMessagesTable  // This is the key addition
}
