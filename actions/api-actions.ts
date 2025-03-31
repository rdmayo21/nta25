"use server"

import { DeepgramTranscriptionResponse, LLMChatMessage, LLMChatResponse } from "@/types"
import { getVoiceNotesAction } from "@/actions/db/voice-notes-actions"
import { auth } from "@clerk/nextjs/server"

// DeepGram API action to transcribe audio
export async function transcribeAudioAction(
  audioFile: Blob
): Promise<{ isSuccess: boolean; transcription?: string; message: string }> {
  try {
    const formData = new FormData()
    formData.append("audio", audioFile)

    const response = await fetch("https://api.deepgram.com/v1/listen?smart_format=true&punctuate=true", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`DeepGram API error: ${response.statusText}`)
    }

    const data: DeepgramTranscriptionResponse = await response.json()
    
    if (!data.results || !data.results.channels || data.results.channels.length === 0) {
      return { isSuccess: false, message: "No transcription results found" }
    }

    const transcript = data.results.channels[0].alternatives[0].transcript
    return { isSuccess: true, transcription: transcript, message: "Audio transcribed successfully" }
  } catch (error) {
    console.error("Error transcribing audio:", error)
    return { isSuccess: false, message: "Failed to transcribe audio" }
  }
}

// LLM API action to chat with voice notes
export async function chatWithNotesAction(
  userMessage: string
): Promise<{ isSuccess: boolean; response?: string; message: string }> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { isSuccess: false, message: "User not authenticated" }
    }
    
    // Get all user's voice notes to use as context
    const voiceNotesResult = await getVoiceNotesAction(userId)
    
    if (!voiceNotesResult.isSuccess) {
      return { isSuccess: false, message: "Failed to retrieve voice notes for context" }
    }
    
    // Format notes with dates and create a structured context
    const voiceNotesContext = voiceNotesResult.data
      .map(note => {
        const noteDate = new Date(note.createdAt);
        const formattedDate = noteDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        });
        
        // Handle location safely (it might not exist in the database yet)
        // @ts-ignore - Temporarily ignore TypeScript errors until the database is updated
        const locationInfo = note.location ? `Location: ${note.location}\n` : '';
        
        return `Note Date: ${formattedDate}\n${locationInfo}Content: ${note.transcription}`;
      })
      .join("\n\n");
    
    const messages: LLMChatMessage[] = [
      {
        role: "system",
        content: `You are a helpful AI assistant for a voice journaling app. Your primary function is to help users navigate and extract information from their voice notes.

When responding to queries about dates and locations:
1. Pay close attention to specific dates mentioned in the query (e.g., "Where was I on March 15th?")
2. Search through the voice notes to find entries from that date or containing references to that date
3. Extract location information from those notes - this may be in the Location field or mentioned in the Content
4. If a note from the exact date exists but doesn't have a Location field, look for location mentions in the Content
5. If no notes exist from the exact date, look for the closest dates before and after, and mention this in your response
6. Always cite which date the information comes from

For location-based queries:
1. When asked "Where was I on [date]?", first look for notes from that exact date and check their Location field
2. If no Location field exists, analyze the content for location mentions (cities, venues, addresses, etc.)
3. If multiple notes exist for the same date with different locations, mention all of them
4. If no location information can be found, explain that there are notes from that date but no location is mentioned

Each note includes:
- Date header: when the note was created
- Location (if available): extracted location from the note
- Content section: the transcribed text of the voice note

Only use information from these notes to answer questions. If the answer cannot be found in the notes, politely say so.

Here are the user's voice notes:

${voiceNotesContext}`
      },
      {
        role: "user",
        content: userMessage
      }
    ]
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 500
      })
    })
    
    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    const assistantMessage = data.choices[0].message.content
    
    return { isSuccess: true, response: assistantMessage, message: "LLM responded successfully" }
  } catch (error) {
    console.error("Error chatting with notes:", error)
    return { isSuccess: false, message: "Failed to get response from LLM" }
  }
}

// Generate title for voice note using OpenAI's GPT model
export async function generateTitleAction(
  transcription: string
): Promise<{ isSuccess: boolean; title?: string; message: string }> {
  try {
    // Validate input
    if (!transcription || transcription.trim() === "") {
      return { 
        isSuccess: false, 
        message: "Cannot generate title from empty transcription" 
      };
    }
    
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return {
        isSuccess: false,
        message: "OpenAI API key is not configured"
      };
    }
    
    const messages: LLMChatMessage[] = [
      {
        role: "system",
        content: "You are a helpful assistant that creates concise, descriptive titles for voice notes. The title should be brief (5 words or less) but descriptive of the content."
      },
      {
        role: "user",
        content: `Create a short, descriptive title for this voice note transcription: "${transcription}"`
      }
    ]
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.5,
        max_tokens: 50
      })
    })
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error (${response.status}): ${errorData}`);
      throw new Error(`OpenAI API error: ${response.statusText} (${response.status})`);
    }
    
    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected API response format:", data);
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const title = data.choices[0].message.content.trim()
    
    return { isSuccess: true, title, message: "Title generated successfully" }
  } catch (error) {
    console.error("Error generating title:", error)
    return { 
      isSuccess: false, 
      message: `Failed to generate title: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

// Generate overview from voice note transcription
export async function generateOverviewAction(
  transcription: string
): Promise<{ isSuccess: boolean; overview?: string; message: string }> {
  try {
    // Validate input
    if (!transcription || transcription.trim() === "") {
      return { 
        isSuccess: false, 
        message: "Cannot generate overview from empty transcription" 
      };
    }
    
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return {
        isSuccess: false,
        message: "OpenAI API key is not configured"
      };
    }
    
    const messages: LLMChatMessage[] = [
      {
        role: "system",
        content: "You create a very concise summary (overview) of a voice note transcription, suitable for a preview. Write it in the first person, as if the user is recalling the note's main point. Keep it brief, around 15-25 words. Focus on the core topic or action mentioned. Example: 'I was brainstorming ideas for the new project presentation.' or 'Reminder to pick up groceries after work.'"
      },
      {
        role: "user",
        content: `Generate a brief, first-person overview for this voice note transcription: "${transcription}"`
      }
    ]
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Use a faster model for summaries
        messages,
        temperature: 0.6,
        max_tokens: 60 // Allow slightly more tokens for a summary
      })
    })
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error (${response.status}): ${errorData}`);
      throw new Error(`OpenAI API error: ${response.statusText} (${response.status})`);
    }
    
    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected API response format:", data);
      throw new Error("Invalid response format from OpenAI API");
    }
    
    const overview = data.choices[0].message.content.trim()
    
    return { isSuccess: true, overview, message: "Overview generated successfully" }
  } catch (error) {
    console.error("Error generating overview:", error)
    return { 
      isSuccess: false, 
      message: `Failed to generate overview: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

// Analyze themes across voice notes
export async function analyzeThemesAction(
  transcriptions: string[]
): Promise<{
  isSuccess: boolean;
  themes?: Array<{ theme: string; description: string; noteCount: number }>;
  message: string;
}> {
  try {
    // Validate input
    if (!transcriptions || transcriptions.length === 0) {
      return {
        isSuccess: false,
        message: "Cannot analyze themes from empty transcriptions"
      };
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return {
        isSuccess: false,
        message: "OpenAI API key is not configured"
      };
    }

    // Create a context that contains all the transcriptions
    const notesContext = transcriptions
      .map((text, index) => `Note ${index + 1}: ${text}`)
      .join("\n\n");

    const messages: LLMChatMessage[] = [
      {
        role: "system",
        content: "You analyze personal voice notes to identify recurring themes, patterns, and trends. Your goal is to surface insights that might not be apparent to the user. Focus on identifying 3-7 key themes depending on the content volume and diversity. For each theme, provide a short descriptive name (2-4 words), a brief explanation (1-2 sentences), and the approximate number of notes that relate to this theme. Format your response as a JSON array of objects with 'theme', 'description', and 'noteCount' properties. Be insightful, specific, and concise."
      },
      {
        role: "user",
        content: `Analyze these voice notes and identify the key themes and patterns across them. Return your analysis as a JSON array of theme objects:\n\n${notesContext}`
      }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using the mini model for efficiency and cost
        messages,
        temperature: 0.3, // Lower temperature for more focused responses
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error (${response.status}): ${errorData}`);
      throw new Error(`OpenAI API error: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected API response format:", data);
      throw new Error("Invalid response format from OpenAI API");
    }

    let analysisContent = data.choices[0].message.content.trim();
    let themes;

    try {
      // Parse the JSON response
      const parsedContent = JSON.parse(analysisContent);
      themes = parsedContent.themes || [];

      // Ensure the expected format
      if (!Array.isArray(themes)) {
        themes = []; // Reset if not an array
      }

      // Normalize the data structure if needed
      themes = themes.map(theme => ({
        theme: theme.theme || "Unnamed Theme",
        description: theme.description || "No description available",
        noteCount: theme.noteCount || 0
      }));
    } catch (parseError) {
      console.error("Error parsing themes analysis:", parseError);
      throw new Error("Failed to parse themes analysis");
    }

    return {
      isSuccess: true,
      themes,
      message: "Themes analyzed successfully"
    };
  } catch (error) {
    console.error("Error analyzing themes:", error);
    return {
      isSuccess: false,
      message: `Failed to analyze themes: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Extract location information from voice note transcription
export async function extractLocationAction(
  transcription: string
): Promise<{ isSuccess: boolean; location?: string; message: string }> {
  try {
    // Validate input
    if (!transcription || transcription.trim() === "") {
      return { 
        isSuccess: false, 
        message: "Cannot extract location from empty transcription" 
      };
    }
    
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return {
        isSuccess: false,
        message: "OpenAI API key is not configured"
      };
    }
    
    const messages: LLMChatMessage[] = [
      {
        role: "system",
        content: "Extract location information from the voice note. If there's no clear location mentioned, respond with 'No location mentioned'. Only extract real locations (cities, countries, venues, addresses, landmarks), not abstract concepts. Return only the location name without any additional text."
      },
      {
        role: "user",
        content: `Extract any location information from this voice note: "${transcription}"`
      }
    ]
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using the mini model for efficiency and cost
        messages,
        temperature: 0.3, // Lower temperature for more focused responses
        max_tokens: 50
      })
    })
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error (${response.status}): ${errorData}`);
      throw new Error(`OpenAI API error: ${response.statusText} (${response.status})`);
    }
    
    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected API response format:", data);
      throw new Error("Invalid response format from OpenAI API");
    }
    
    let location = data.choices[0].message.content.trim();
    
    // If no location is found, return null
    if (location.toLowerCase() === "no location mentioned") {
      return { 
        isSuccess: true, 
        location: undefined, 
        message: "No location found in transcription" 
      };
    }
    
    return { isSuccess: true, location, message: "Location extracted successfully" }
  } catch (error) {
    console.error("Error extracting location:", error)
    return { 
      isSuccess: false, 
      message: `Failed to extract location: ${error instanceof Error ? error.message : String(error)}` 
    }
  }
} 