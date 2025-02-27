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

// Generate title for voice note using OpenAI's GPT-4o mini
export async function generateTitleAction(
  transcription: string
): Promise<{ isSuccess: boolean; title?: string; message: string }> {
  try {
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
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    const title = data.choices[0].message.content.trim()
    
    return { isSuccess: true, title, message: "Title generated successfully" }
  } catch (error) {
    console.error("Error generating title:", error)
    return { isSuccess: false, message: "Failed to generate title" }
  }
} 