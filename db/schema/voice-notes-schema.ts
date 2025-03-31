import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const voiceNotesTable = pgTable("voice_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(), // URL to the stored audio file
  transcription: text("transcription").notNull(), // Transcribed text from DeepGram
  overview: text("overview"), // Overview extracted from the transcription
  // location: text("location"), // Optional location information extracted from the note - Commented out until DB is updated
  // duration: integer("duration").notNull().default(0), // Duration of audio in seconds - Commented out until DB is updated
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertVoiceNote = typeof voiceNotesTable.$inferInsert
export type SelectVoiceNote = typeof voiceNotesTable.$inferSelect 