const testSaveNote = async () => {
  console.log("Test save note called");
  try {
    const result = await saveVoiceNoteAction({
      content: "This is a test voice note",
      // other required fields
    });
    console.log("Test save result:", result);
  } catch (error) {
    console.error("Test save error:", error);
  }
};

// Add this button in your JSX
<button 
  onClick={testSaveNote}
  className="text-xs text-gray-500 mt-2"
>
  Test Save Note
</button> 