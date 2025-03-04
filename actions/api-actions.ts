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
    
    // Create system prompt with voice notes as context
    const voiceNotesContext = voiceNotesResult.data
      .map(note => `Note (${new Date(note.createdAt).toLocaleDateString()}): ${note.transcription}`)
      .join("\n\n")
    
    const messages: LLMChatMessage[] = [
      {
        role: "system",
        content: `You are a helpful assistant that responds to queries based on the user's voice notes. 
                 Here are the user's voice notes:\n\n${voiceNotesContext}\n\n
                 Only use information from these notes to answer questions. If the answer cannot be 
                 found in the notes, politely say so.`
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

// Generate key insight from voice note transcription
export async function extractKeyInsightAction(
  transcription: string
): Promise<{ isSuccess: boolean; insight?: string; message: string }> {
  try {
    // Validate input
    if (!transcription || transcription.trim() === "") {
      return { 
        isSuccess: false, 
        message: "Cannot extract insight from empty transcription" 
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
        content: "You extract concise key insights from personal voice notes. Your insights should be direct, specific, and brief (typically 10-20 words). Use second-person perspective, addressing the note creator directly with 'you' or imperative verbs. Never use phrases like 'the key insight is' or third-person references. Start with action verbs or 'You need to/should' when appropriate. Focus on actionable advice, main ideas, or critical observations that speak directly to the note creator. The insight should be clear enough to be understood as a standalone statement."
      },
      {
        role: "user",
        content: `Extract the single most important insight from this voice note transcription, addressing me directly in a concise but informative way: "${transcription}"`
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
        max_tokens: 100
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
    
    let insight = data.choices[0].message.content.trim();
    
    // Remove common introductory phrases if present
    insight = insight
      .replace(/^(the key insight( is)?|the main point( is)?|the insight( is)?|you (say|mention)|according to you)[ :]*that[ :]*/i, '')
      .replace(/^(in (your|this) voice note|(your|this) voice note|the voice note|the note),? /i, '')
      .replace(/^(the (key|main|important) (insight|point|takeaway) is )/i, '')
      .replace(/^(key insight: |insight: |main point: )/i, '')
      .replace(/^you should /i, 'Should ') // Convert "You should X" to just "Should X" for brevity
      .replace(/^you need to /i, 'Need to '); // Convert "You need to X" to just "Need to X" for brevity
    
    // Capitalize first letter if needed
    if (insight.length > 0) {
      insight = insight.charAt(0).toUpperCase() + insight.slice(1);
    }
    
    // Remove trailing period if present (to save space)
    if (insight.endsWith('.')) {
      insight = insight.slice(0, -1);
    }
    
    return { isSuccess: true, insight, message: "Insight extracted successfully" }
  } catch (error) {
    console.error("Error extracting insight:", error)
    return { 
      isSuccess: false, 
      message: `Failed to extract insight: ${error instanceof Error ? error.message : String(error)}` 
    }
  }
} 