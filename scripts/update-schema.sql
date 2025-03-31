-- Add missing columns to voice_notes table
ALTER TABLE voice_notes 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 0;

-- Comments on the columns for documentation
COMMENT ON COLUMN voice_notes.location IS 'Optional location information extracted from the note';
COMMENT ON COLUMN voice_notes.duration IS 'Duration of the voice note in seconds'; 