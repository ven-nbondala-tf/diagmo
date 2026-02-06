-- Migration: Fix RLS Infinite Recursion (Error 42P17)
-- Run this in your Supabase SQL Editor
--
-- Problem: Circular RLS policy references between diagrams and diagram_shares
-- Solution: Use SECURITY DEFINER functions to bypass RLS during policy checks

-- =============================================
-- Step 1: Create helper functions (SECURITY DEFINER bypasses RLS)
-- =============================================

-- Check if current user owns a diagram
CREATE OR REPLACE FUNCTION is_diagram_owner(diagram_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM diagrams
    WHERE id = diagram_uuid AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user has share access to a diagram
CREATE OR REPLACE FUNCTION has_diagram_share_access(diagram_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM diagram_shares
    WHERE diagram_id = diagram_uuid
    AND shared_with_user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has edit permission on a shared diagram
CREATE OR REPLACE FUNCTION has_diagram_edit_access(diagram_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM diagram_shares
    WHERE diagram_id = diagram_uuid
    AND shared_with_user_id = auth.uid()
    AND permission = 'edit'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================
-- Step 2: Drop ALL existing diagram policies
-- =============================================

DROP POLICY IF EXISTS "Users can view own diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can view own or shared diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can create own diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can update own diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can update own or shared diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can delete own diagrams" ON diagrams;

-- =============================================
-- Step 3: Drop ALL existing diagram_shares policies
-- =============================================

DROP POLICY IF EXISTS "Owners can view shares" ON diagram_shares;
DROP POLICY IF EXISTS "Owners can create shares" ON diagram_shares;
DROP POLICY IF EXISTS "Owners can update shares" ON diagram_shares;
DROP POLICY IF EXISTS "Owners can delete shares" ON diagram_shares;
DROP POLICY IF EXISTS "Users can view their shares" ON diagram_shares;

-- =============================================
-- Step 4: Recreate diagram policies using helper functions
-- =============================================

-- SELECT: Owner OR has share access
CREATE POLICY "Users can view own or shared diagrams"
  ON diagrams FOR SELECT
  USING (
    auth.uid() = user_id
    OR has_diagram_share_access(id)
  );

-- INSERT: Only owner
CREATE POLICY "Users can create own diagrams"
  ON diagrams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Owner OR has edit share access
CREATE POLICY "Users can update own or shared diagrams"
  ON diagrams FOR UPDATE
  USING (
    auth.uid() = user_id
    OR has_diagram_edit_access(id)
  );

-- DELETE: Only owner
CREATE POLICY "Users can delete own diagrams"
  ON diagrams FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Step 5: Recreate diagram_shares policies using helper functions
-- =============================================

-- Owners can view shares for their diagrams
CREATE POLICY "Owners can view shares"
  ON diagram_shares FOR SELECT
  USING (is_diagram_owner(diagram_id));

-- Owners can create shares
CREATE POLICY "Owners can create shares"
  ON diagram_shares FOR INSERT
  WITH CHECK (is_diagram_owner(diagram_id));

-- Owners can update shares
CREATE POLICY "Owners can update shares"
  ON diagram_shares FOR UPDATE
  USING (is_diagram_owner(diagram_id));

-- Owners can delete shares
CREATE POLICY "Owners can delete shares"
  ON diagram_shares FOR DELETE
  USING (is_diagram_owner(diagram_id));

-- Users can view shares where they are the recipient
CREATE POLICY "Users can view their shares"
  ON diagram_shares FOR SELECT
  USING (shared_with_user_id = auth.uid());

-- =============================================
-- Step 6: Fix presence policies if table exists
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diagram_presence') THEN
    DROP POLICY IF EXISTS "Users can view presence on own diagrams" ON diagram_presence;
    DROP POLICY IF EXISTS "Users can view presence on accessible diagrams" ON diagram_presence;

    EXECUTE 'CREATE POLICY "Users can view presence on accessible diagrams"
      ON diagram_presence FOR SELECT
      USING (
        is_diagram_owner(diagram_id)
        OR has_diagram_share_access(diagram_id)
      )';
  END IF;
END $$;

-- =============================================
-- Verification: Run this to test
-- SELECT * FROM diagrams LIMIT 1;
-- =============================================
