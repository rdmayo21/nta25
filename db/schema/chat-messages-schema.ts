import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const roleEnum = pgEnum("role", ["user", "assistant"])

export const chatMessagesTable = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertChatMessage = typeof chatMessagesTable.$inferInsert
export type SelectChatMessage = typeof chatMessagesTable.$inferSelect 