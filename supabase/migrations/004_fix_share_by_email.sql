-- Migration: Fix sharing access for email-based shares
-- Run this in your Supabase SQL Editor

-- Update the share access function to also check by email
CREATE OR REPLACE FUNCTION has_diagram_share_access(diagram_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM diagram_shares
    WHERE diagram_id = diagram_uuid
    AND (
      shared_with_user_id = auth.uid()
      OR shared_with_email = auth.email()
    )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Update the edit access function too
CREATE OR REPLACE FUNCTION has_diagram_edit_access(diagram_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM diagram_shares
    WHERE diagram_id = diagram_uuid
    AND (
      shared_with_user_id = auth.uid()
      OR shared_with_email = auth.email()
    )
    AND permission = 'edit'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Also update the "Users can view their shares" policy to include email
DROP POLICY IF EXISTS "Users can view their shares" ON diagram_shares;

CREATE POLICY "Users can view their shares"
  ON diagram_shares FOR SELECT
  USING (
    shared_with_user_id = auth.uid()
    OR shared_with_email = auth.email()
  );

-- Enable Realtime on diagrams table for content sync
ALTER PUBLICATION supabase_realtime ADD TABLE diagrams;
