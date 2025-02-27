/*
<ai_context>
Contains types for API integrations.
</ai_context>
*/

// DeepGram API Types
export interface DeepgramTranscriptionResponse {
  results: {
    channels: Array<{
      alternatives: Array<{
        transcript: string;
        confidence: number;
      }>;
    }>;
  };
}

// LLM API Types
export interface LLMChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMChatResponse {
  message: LLMChatMessage;
} 