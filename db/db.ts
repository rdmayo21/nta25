/*
<ai_context>
Initializes the database connection and schema for the app.
</ai_context>
*/

import { 
  profilesTable, 
  todosTable, 
  voiceNotesTable, 
  chatMessagesTable 
} from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

const schema = {
  profiles: profilesTable,
  todos: todosTable,
  voiceNotes: voiceNotesTable,
  chatMessages: chatMessagesTable
}

// Add better error handling for the database connection
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined in .env.local")
}

let client;
let db;

try {
  client = postgres(process.env.DATABASE_URL!, {
    max: 10, // Maximum number of connections
    idle_timeout: 20, // Max seconds a client can be idle before being removed
    connect_timeout: 10, // Max seconds to wait for connection
  })
  
  db = drizzle(client, { schema })
} catch (error) {
  console.error("Failed to connect to database:", error)
  // Provide a fallback to prevent app crashes
  client = postgres("postgres://localhost:5432/fallback_db")
  db = drizzle(client, { schema })
}

export { db }
