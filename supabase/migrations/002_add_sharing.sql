-- Migration: Add Diagram Sharing
-- Run this in your Supabase SQL Editor to enable sharing features

-- =============================================
-- Diagram Sharing Table
-- =============================================

-- Diagram shares table (tracks who has access to which diagram)
CREATE TABLE IF NOT EXISTS diagram_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT,  -- For pending invites (user not yet registered)
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,  -- NULL until user accepts
  UNIQUE(diagram_id, shared_with_user_id),
  UNIQUE(diagram_id, shared_with_email)
);

-- Indexes for shares
CREATE INDEX IF NOT EXISTS idx_diagram_shares_diagram_id ON diagram_shares(diagram_id);
CREATE INDEX IF NOT EXISTS idx_diagram_shares_user_id ON diagram_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_diagram_shares_email ON diagram_shares(shared_with_email);

-- Enable RLS
ALTER TABLE diagram_shares ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Share Table Policies
-- =============================================

-- Diagram owners can manage shares
CREATE POLICY "Owners can view shares"
  ON diagram_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_shares.diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can create shares"
  ON diagram_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_shares.diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update shares"
  ON diagram_shares FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_shares.diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete shares"
  ON diagram_shares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_shares.diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

-- Shared users can view their own share records
CREATE POLICY "Users can view their shares"
  ON diagram_shares FOR SELECT
  USING (shared_with_user_id = auth.uid());

-- =============================================
-- Update Diagram Policies for Shared Access
-- =============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can update own diagrams" ON diagrams;

-- Recreate with shared access
CREATE POLICY "Users can view own or shared diagrams"
  ON diagrams FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM diagram_shares
      WHERE diagram_shares.diagram_id = diagrams.id
      AND diagram_shares.shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own or shared diagrams"
  ON diagrams FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM diagram_shares
      WHERE diagram_shares.diagram_id = diagrams.id
      AND diagram_shares.shared_with_user_id = auth.uid()
      AND diagram_shares.permission = 'edit'
    )
  );

-- =============================================
-- Update Presence Policies (if presence table exists)
-- =============================================

DO $$
BEGIN
  -- Only update presence policies if the table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diagram_presence') THEN
    DROP POLICY IF EXISTS "Users can view presence on own diagrams" ON diagram_presence;

    EXECUTE 'CREATE POLICY "Users can view presence on accessible diagrams"
      ON diagram_presence FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM diagrams
          WHERE diagrams.id = diagram_presence.diagram_id
          AND (
            diagrams.user_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM diagram_shares
              WHERE diagram_shares.diagram_id = diagrams.id
              AND diagram_shares.shared_with_user_id = auth.uid()
            )
          )
        )
      )';
  END IF;
END $$;
