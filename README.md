# VoxJournal App

A mobile web app for voice journaling with AI-powered features.

## Features

- **Voice Notes**: Record voice notes that are automatically transcribed using DeepGram API
- **Chat with Notes**: Ask questions about your recorded notes and get AI-powered responses based on your journal content
- **Mobile-Friendly**: Designed for optimal experience on mobile devices
- **Secure Authentication**: User authentication with Clerk

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Server Actions, Postgres, Supabase, Drizzle ORM
- **Authentication**: Clerk
- **APIs**: DeepGram (transcription), OpenAI (chat)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Postgres database
- Clerk account
- DeepGram API key
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd VoxJournal
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Create a `.env.local` file based on `.env.example`
   - Fill in your API keys and database credentials

4. Run the development server
```bash
npm run dev
```

## Usage

1. Sign in with your account
2. Navigate to the Journal page
3. Record voice notes using the Notes tab
4. Chat with your notes using the Chat tab

## Database Schema

- **voice_notes**: Stores voice recordings and their transcriptions
- **chat_messages**: Stores chat history between user and AI

## License

[MIT](LICENSE)
