"use client"

import { useState } from "react"
import { saveVoiceNoteAction } from "@/actions/db/voice-notes-actions"

export default function VoiceRecorder() {
  // Component state and other logic here
  
  const testSaveNote = async () => {
    console.log("Test save note called");
    try {
      const result = await saveVoiceNoteAction({
        content: "This is a test voice note",
        title: "Test Voice Note",
        audioUrl: "https://example.com/test-audio.mp3"
      });
      console.log("Test save result:", result);
    } catch (error) {
      console.error("Test save error:", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Voice Recorder</h2>
      
      {/* Recorder UI components would go here */}
      
      <button 
        onClick={testSaveNote}
        className="text-xs text-gray-500 mt-2"
      >
        Test Save Note
      </button>
    </div>
  )
} 