# Voice Journal - Project Context

## Overview

Voice Journal is a web application that allows users to record, transcribe, and analyze voice notes. It offers a streamlined journaling experience where users can easily capture their thoughts via voice, review transcriptions, and get AI-generated insights from their recordings. 

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Shadcn UI components, Framer Motion
- **Backend**: Next.js Server Actions, Drizzle ORM
- **Database**: PostgreSQL hosted on Supabase
- **Authentication**: Clerk
- **AI Services**: OpenAI (for insights), Deepgram (for transcription)
- **Payments**: Stripe (integration ready)
- **Analytics**: PostHog (integration ready)
- **Deployment**: Vercel

## Key Features

1. **Voice Recording**: Record voice notes directly in the browser
2. **Automatic Transcription**: Audio recordings are automatically transcribed using Deepgram
3. **Key Insights**: AI-powered extraction of key points from transcriptions
4. **Favorites**: Mark voice notes as favorites for easy access
5. **Chat Interface**: Interact with your journal entries via chat
6. **Insights Analysis**: Get overall analysis of trends and patterns in your journaling

## Project Structure

```
/
├── actions/                 # Server actions
│   ├── api-actions.ts       # API-related actions (OpenAI, Deepgram)
│   └── db/                  # Database-related actions
│       └── voice-notes-actions.ts # CRUD operations for voice notes
├── app/                     # Next.js App Router
│   ├── (app)/               # Authenticated app routes
│   │   ├── journal/         # Main journal page
│   │   │   ├── _components/ # Journal-specific components
│   │   │   │   ├── notes-tab.tsx      # Voice notes tab
│   │   │   │   ├── chat-tab.tsx       # Chat interface tab
│   │   │   │   ├── insights-tab.tsx   # Insights analysis tab
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
│   └── voice-notes-list.tsx # List of voice notes
├── db/                      # Database configuration
│   ├── db.ts                # Database connection
│   └── schema/              # Database schema
│       ├── voice-notes-schema.ts # Voice notes table schema
│       ├── profiles-schema.ts    # User profiles table schema
│       └── chat-messages-schema.ts # Chat messages table schema
└── lib/                     # Utility functions and libraries
    └── hooks/               # Custom React hooks
```

## Database Schema

### Voice Notes Table
```typescript
export const voiceNotesTable = pgTable("voice_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  transcription: text("transcription").notNull(),
  keyInsight: text("key_insight"),
  duration: integer("duration").notNull(),
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

## Voice Recording Flow

1. User clicks on the floating microphone button in the Notes tab
2. Audio is recorded using the browser's MediaRecorder API
3. On recording completion, the audio is:
   - Uploaded to storage
   - Sent to Deepgram for transcription
   - Saved to the database with its transcription
4. The list of voice notes is refreshed to show the new entry

## AI Integration

1. **Transcription**: Uses Deepgram's API to convert audio to text
2. **Key Insights**: OpenAI is used to extract the most important points from voice note transcriptions
3. **Chat**: The chat interface uses OpenAI to provide conversational interaction with the user's journal entries

## User Interface Components

### Voice Recorder
A component that handles recording audio, showing recording status, and processing the recording on completion.

### Voice Notes List
Displays the list of voice notes with options to:
- Play/pause audio
- Mark as favorite
- Delete notes
- View detailed transcriptions and insights

### Tabs Interface
The main journal interface is divided into three tabs:
1. **Notes**: For recording and reviewing voice notes
2. **Chat**: For conversational interaction with journal content
3. **Insights**: For analysis and patterns across all journal entries

## Current Issues and Considerations

1. **Scrolling in Lists**: The voice notes list needs proper overflow handling to ensure users can scroll through all entries
2. **Mobile Optimization**: The UI is responsive but may benefit from additional mobile-specific optimizations
3. **Storage Handling**: Audio file management could be improved with better lifecycle policies
4. **Performance**: Large numbers of voice notes may require pagination or virtualized lists

## Adding New Features

When implementing new features, consider:

1. **Server Actions**: Use Next.js server actions for backend operations
2. **Database Schema**: Follow the established pattern for Drizzle ORM schema definitions
3. **Component Structure**: Place reusable components in the components directory and route-specific ones in _components folders
4. **Authentication**: Always include user authentication checks for protected resources
5. **Error Handling**: Implement proper error handling and user feedback
6. **AI Integration**: Consider how to leverage OpenAI or other AI services to enhance the feature

## Environment Variables

The app relies on several environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`: For authentication
- `DEEPGRAM_API_KEY`: For audio transcription
- `OPENAI_API_KEY`: For AI-powered insights

## Potential Future Features

1. **Enhanced Analytics**: More detailed analysis of journaling patterns and mood
2. **Multi-language Support**: Transcription and insights in multiple languages
3. **Collaboration**: Shared journaling spaces for teams or partners
4. **Integration with Calendar**: Connecting journal entries to calendar events
5. **Voice Commands**: Control the app using voice commands
6. **Export Options**: Export journal entries to various formats
7. **Customizable Themes**: User-selectable UI themes
8. **Reminder System**: Scheduled reminders to journal regularly 