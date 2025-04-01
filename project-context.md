# VoxJournal - Project Context

## Overview

VoxJournal is a web application that allows users to record, transcribe, and analyze voice notes. It offers a streamlined journaling experience where users can easily capture their thoughts via voice, review and **edit** transcriptions, and get AI-generated overviews from their recordings. **Audio is only stored temporarily during processing and is not available for playback.**

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Shadcn UI components, Framer Motion
- **Backend**: Next.js Server Actions, Drizzle ORM
- **Database**: PostgreSQL hosted on Supabase
- **Authentication**: Clerk
- **AI Services**: OpenAI (for generating overviews and titles), Deepgram (for transcription)
- **Storage**: Supabase Storage (for temporary audio file uploads)
- **Payments**: Stripe (integration ready)
- **Analytics**: PostHog (integration ready)
- **Deployment**: Vercel

## Key Features

1.  **Voice Recording**: Record voice notes directly in the browser (up to 1 hour per recording)
2.  **Automatic Transcription**: Audio recordings are automatically transcribed using Deepgram
3.  **Transcription Editing**: Users can edit the generated transcription after creation
4.  **Note Overview**: AI-powered generation of a concise overview for each note
5.  **Favorites**: Mark voice notes as favorites for easy access
6.  **Chat Interface**: Interact with your journal entries via chat

## Project Structure

```
/
├── actions/                 # Server actions
│   ├── api-actions.ts       # API-related actions (OpenAI, Deepgram)
│   ├── storage/             # Storage-related actions
│   │   └── storage-actions.ts # Upload/delete actions for Supabase Storage
│   └── db/                  # Database-related actions
│       └── voice-notes-actions.ts # CRUD operations for voice notes
├── app/                     # Next.js App Router
│   ├── (app)/               # Authenticated app routes
│   │   ├── journal/         # Main journal page
│   │   │   ├── _components/ # Journal-specific components
│   │   │   │   ├── notes-tab.tsx      # Voice notes tab
│   │   │   │   ├── chat-tab.tsx       # Chat interface tab
│   │   │   │   └── journal-page-content.tsx # Main content wrapper
│   │   │   └── page.tsx     # Journal page component
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── (marketing)/         # Public marketing pages
│   │   └── page.tsx         # Landing page
│   └── api/                 # API routes
├── components/              # Shared components
│   ├── ui/                  # UI components (Shadcn)
│   ├── voice-recorder.tsx   # Voice recording component
│   └── voice-notes-list.tsx # List of voice notes (with editing)
├── db/                      # Database configuration
│   ├── db.ts                # Database connection
│   └── schema/              # Database schema
│       ├── voice-notes-schema.ts # Voice notes table schema (no audioUrl)
│       ├── profiles-schema.ts    # User profiles table schema
│       └── chat-messages-schema.ts # Chat messages table schema
└── lib/                     # Utility functions and libraries
    └── hooks/               # Custom React hooks
```

## Database Schema

### Voice Notes Table (Updated)
*The `audioUrl` column has been removed.*
```typescript
export const voiceNotesTable = pgTable("voice_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  transcription: text("transcription").notNull(),
  overview: text("overview"),
  duration: integer("duration").notNull(), // Duration in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});
```

### Profiles Table
```typescript
export const profilesTable = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
  name: text("name"),
  preferences: jsonb("preferences").$type<UserPreferences>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});
```

### Chat Messages Table
```typescript
export const chatMessagesTable = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  role: roleEnum("role").notNull(), // 'user' or 'assistant'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});
```

## Authentication Flow

1. Users sign up or log in via Clerk authentication
2. After authentication, users are redirected to the journal page
3. The app uses Clerk's userId to associate voice notes with specific users
4. Protected routes check for authentication using Clerk middleware

## Voice Recording Flow (Updated)

1.  User clicks on the floating microphone button in the Notes tab.
2.  Audio is recorded using the browser's MediaRecorder API (max 1 hour).
3.  On recording completion, the audio blob is:
    a.  Uploaded to a temporary location in Supabase Storage.
    b.  Sent to Deepgram for transcription (client-side or via API action).
    c.  An AI-generated title is created (server-side).
    d.  A server action (`createVoiceNoteAction`) is called with user ID, title, transcription, duration, temporary audio path, and bucket name.
    e.  The server action saves the note details (title, transcription, overview, duration, etc.) to the database.
    f.  The server action triggers the deletion of the temporary audio file from Supabase Storage.
4.  The list of voice notes is refreshed to show the new entry.

## AI Integration

1.  **Transcription**: Uses Deepgram's API to convert audio to text.
2.  **Note Overview & Title**: OpenAI is used to generate a concise overview and a title from voice note transcriptions. Generated titles are cleaned to remove surrounding quotes.
3.  **Chat**: The chat interface uses OpenAI to provide conversational interaction with the user's journal entries.

## User Interface Components

### Voice Recorder
A component that handles recording audio (up to 1 hour), showing recording status, uploading the temporary audio file, triggering transcription, and initiating the save process.

### Voice Notes List
Displays the list of voice notes with options to:
- Edit the transcription inline.
- Mark as favorite.
- Delete notes.
- View the generated overview or truncated transcription.
- **(No audio playback capability)**

### Tabs Interface
The main journal interface is divided into three tabs:
1.  **Notes**: For recording and reviewing/editing voice notes.
2.  **Chat**: For conversational interaction with journal content.

## Current Issues and Considerations (Updated)

1.  **Scrolling in Lists**: The voice notes list needs proper overflow handling.
2.  **Mobile Optimization**: UI may benefit from further mobile optimization.
3.  **Storage Handling**: Temporary audio file deletion relies on server action success; consider cleanup mechanisms for orphaned files.
4.  **Performance**: Large numbers of voice notes may require pagination or virtualized lists.
5.  **Transcription Error Handling**: If transcription fails after upload, the temporary file should be cleaned up.
6.  **Env Variables:** Ensure `NEXT_PUBLIC_SUPABASE_AUDIO_BUCKET` is set in the environment.

## Adding New Features

When implementing new features, consider:

1. **Server Actions**: Use Next.js server actions for backend operations
2. **Database Schema**: Follow the established pattern for Drizzle ORM schema definitions
3. **Component Structure**: Place reusable components in the components directory and route-specific ones in _components folders
4. **Authentication**: Always include user authentication checks for protected resources
5. **Error Handling**: Implement proper error handling and user feedback
6. **AI Integration**: Consider how to leverage OpenAI or other AI services to enhance the feature

## Environment Variables (Updated)

The app relies on several environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`: For authentication
- `DEEPGRAM_API_KEY`: For audio transcription
- `OPENAI_API_KEY`: For AI-powered features (overviews, titles, chat)
- `NEXT_PUBLIC_SUPABASE_AUDIO_BUCKET`: Name of the Supabase bucket for temporary audio storage.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY` depending on client usage): For Supabase Storage interactions.

## Potential Future Features

1. **Enhanced Analytics**: More detailed analysis of journaling patterns and mood
2. **Multi-language Support**: Transcription in multiple languages
3. **Collaboration**: Shared journaling spaces for teams or partners
4. **Integration with Calendar**: Connecting journal entries to calendar events
5. **Voice Commands**: Control the app using voice commands
6. **Export Options**: Export journal entries to various formats
7. **Customizable Themes**: User-selectable UI themes
8. **Reminder System**: Scheduled reminders to journal regularly 