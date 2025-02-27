/*
<ai_context>
Global TypeScript declarations for the app.
</ai_context>
*/

// Importing React types globally
import React from 'react'
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any
    }
  }
}

// Extending NodeJS namespace
declare namespace NodeJS {
  interface ProcessEnv {
    DEEPGRAM_API_KEY: string
    OPENAI_API_KEY: string
    DATABASE_URL: string
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string
    CLERK_SECRET_KEY: string
    [key: string]: string | undefined
  }
} 