import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const voiceNotesTable = pgTable("voice_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  transcription: text("transcription").notNull(), // Transcribed text from DeepGram
  overview: text("overview"), // Overview extracted from the transcription
  duration: integer("duration").notNull(), // Duration of audio in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertVoiceNote = typeof voiceNotesTable.$inferInsert
export type SelectVoiceNote = typeof voiceNotesTable.$inferSelect 