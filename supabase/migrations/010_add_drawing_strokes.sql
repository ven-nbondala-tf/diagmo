-- Migration: Add drawing_strokes column to diagram_pages
--
-- This allows whiteboard drawings to be persisted when switching between pages.
-- Drawing strokes are stored as JSONB array containing stroke objects with
-- points, color, width, tool type, and optional shape data.

-- Add drawing_strokes column to diagram_pages table
ALTER TABLE diagram_pages
ADD COLUMN IF NOT EXISTS drawing_strokes JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN diagram_pages.drawing_strokes IS 'Whiteboard drawing strokes for this page (pen, highlighter, shapes, etc.)';
