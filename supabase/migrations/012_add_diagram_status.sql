-- Add status field to diagrams table
ALTER TABLE diagrams
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
CHECK (status IN ('draft', 'internal', 'pending_review', 'approved'));

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_diagrams_status ON diagrams(status);

-- Comment for documentation
COMMENT ON COLUMN diagrams.status IS 'Diagram workflow status: draft, internal, pending_review, approved';
