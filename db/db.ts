/*
<ai_context>
Initializes the database connection and schema for the app.
</ai_context>
*/

import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { schema } from "./schema"

config({ path: ".env.local" })

// Add better error handling for the database connection
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined in .env.local")
}

// Type for the connection
const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { max: 1 })

// Export the db with proper typing
export const db = drizzle(client, { schema })
