-- Migration: Fix diagram_pages RLS policies to allow shared users access
-- This migration updates the RLS policies on diagram_pages to include users
-- who have been shared access to the diagram via diagram_shares table
-- Handles both user_id and email-based sharing

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view pages of own diagrams" ON diagram_pages;
DROP POLICY IF EXISTS "Users can create pages for own diagrams" ON diagram_pages;
DROP POLICY IF EXISTS "Users can update pages of own diagrams" ON diagram_pages;
DROP POLICY IF EXISTS "Users can delete pages of own diagrams" ON diagram_pages;
DROP POLICY IF EXISTS "Users can view pages of own or shared diagrams" ON diagram_pages;
DROP POLICY IF EXISTS "Users can create pages for own or shared diagrams" ON diagram_pages;
DROP POLICY IF EXISTS "Users can update pages of own or shared diagrams" ON diagram_pages;
DROP POLICY IF EXISTS "Users can delete pages of own or shared diagrams" ON diagram_pages;

-- Helper function to check if user has access to a diagram (owner or shared)
CREATE OR REPLACE FUNCTION user_has_diagram_access(diagram_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM diagrams d
    WHERE d.id = diagram_uuid
    AND (
      -- User is the owner
      d.user_id = auth.uid()
      -- Or user has been shared with by user_id
      OR EXISTS (
        SELECT 1 FROM diagram_shares ds
        WHERE ds.diagram_id = d.id
        AND ds.shared_with_user_id = auth.uid()
      )
      -- Or user has been shared with by email
      OR EXISTS (
        SELECT 1 FROM diagram_shares ds
        WHERE ds.diagram_id = d.id
        AND ds.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has edit access to a diagram
CREATE OR REPLACE FUNCTION user_has_diagram_edit_access(diagram_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM diagrams d
    WHERE d.id = diagram_uuid
    AND (
      -- User is the owner
      d.user_id = auth.uid()
      -- Or user has edit permission by user_id
      OR EXISTS (
        SELECT 1 FROM diagram_shares ds
        WHERE ds.diagram_id = d.id
        AND ds.shared_with_user_id = auth.uid()
        AND ds.permission = 'edit'
      )
      -- Or user has edit permission by email
      OR EXISTS (
        SELECT 1 FROM diagram_shares ds
        WHERE ds.diagram_id = d.id
        AND ds.shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND ds.permission = 'edit'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT: Users can view pages if they own the diagram OR have been shared with it
CREATE POLICY "Users can view pages of own or shared diagrams"
  ON diagram_pages FOR SELECT
  USING (user_has_diagram_access(diagram_id));

-- INSERT: Users can create pages if they own the diagram OR have edit permission
CREATE POLICY "Users can create pages for own or shared diagrams"
  ON diagram_pages FOR INSERT
  WITH CHECK (user_has_diagram_edit_access(diagram_id));

-- UPDATE: Users can update pages if they own the diagram OR have edit permission
CREATE POLICY "Users can update pages of own or shared diagrams"
  ON diagram_pages FOR UPDATE
  USING (user_has_diagram_edit_access(diagram_id));

-- DELETE: Users can delete pages if they own the diagram OR have edit permission
CREATE POLICY "Users can delete pages of own or shared diagrams"
  ON diagram_pages FOR DELETE
  USING (user_has_diagram_edit_access(diagram_id));
