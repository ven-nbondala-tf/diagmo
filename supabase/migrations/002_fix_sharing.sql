-- Fix: Clean up and recreate diagram sharing policies
-- Run this in your Supabase SQL Editor

-- =============================================
-- Step 1: Create diagram_shares table if not exists
-- =============================================

CREATE TABLE IF NOT EXISTS diagram_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(diagram_id, shared_with_user_id),
  UNIQUE(diagram_id, shared_with_email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_diagram_shares_diagram_id ON diagram_shares(diagram_id);
CREATE INDEX IF NOT EXISTS idx_diagram_shares_user_id ON diagram_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_diagram_shares_email ON diagram_shares(shared_with_email);

-- Enable RLS
ALTER TABLE diagram_shares ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Step 2: Drop ALL existing diagram policies
-- =============================================

DROP POLICY IF EXISTS "Users can view own diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can view own or shared diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can update own diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can update own or shared diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can create own diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can delete own diagrams" ON diagrams;

-- =============================================
-- Step 3: Recreate diagram policies (simple version first)
-- =============================================

-- SELECT: Users can view their own diagrams OR diagrams shared with them
CREATE POLICY "Users can view own or shared diagrams"
  ON diagrams FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM diagram_shares
      WHERE diagram_shares.diagram_id = id
      AND diagram_shares.shared_with_user_id = auth.uid()
    )
  );

-- INSERT: Users can only create their own diagrams
CREATE POLICY "Users can create own diagrams"
  ON diagrams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own OR shared diagrams (with edit permission)
CREATE POLICY "Users can update own or shared diagrams"
  ON diagrams FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM diagram_shares
      WHERE diagram_shares.diagram_id = id
      AND diagram_shares.shared_with_user_id = auth.uid()
      AND diagram_shares.permission = 'edit'
    )
  );

-- DELETE: Users can only delete their own diagrams
CREATE POLICY "Users can delete own diagrams"
  ON diagrams FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Step 4: Drop and recreate diagram_shares policies
-- =============================================

DROP POLICY IF EXISTS "Owners can view shares" ON diagram_shares;
DROP POLICY IF EXISTS "Owners can create shares" ON diagram_shares;
DROP POLICY IF EXISTS "Owners can update shares" ON diagram_shares;
DROP POLICY IF EXISTS "Owners can delete shares" ON diagram_shares;
DROP POLICY IF EXISTS "Users can view their shares" ON diagram_shares;

-- Owners can view shares for their diagrams
CREATE POLICY "Owners can view shares"
  ON diagram_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_shares.diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

-- Owners can create shares
CREATE POLICY "Owners can create shares"
  ON diagram_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

-- Owners can update shares
CREATE POLICY "Owners can update shares"
  ON diagram_shares FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_shares.diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

-- Owners can delete shares
CREATE POLICY "Owners can delete shares"
  ON diagram_shares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_shares.diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

-- Users can view shares where they are the recipient
CREATE POLICY "Users can view their shares"
  ON diagram_shares FOR SELECT
  USING (shared_with_user_id = auth.uid());

-- =============================================
-- Done! Test by running:
-- SELECT * FROM diagrams LIMIT 1;
-- =============================================
