-- ============================================================================
-- Team Workspaces Migration
-- Adds support for shared team workspaces with role-based access control
-- ============================================================================

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add updated_at trigger for workspaces
CREATE TRIGGER set_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Workspace members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT, -- For pending invites (before user accepts)
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ, -- NULL until invite is accepted
  UNIQUE(workspace_id, user_id),
  UNIQUE(workspace_id, email)
);

-- Add workspace_id to diagrams (nullable for personal diagrams)
ALTER TABLE diagrams ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_diagrams_workspace ON diagrams(workspace_id);

-- Add workspace_id to folders
ALTER TABLE folders ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_folders_workspace ON folders(workspace_id);

-- ============================================================================
-- RLS Helper Functions (SECURITY DEFINER to bypass RLS)
-- ============================================================================

-- Check if current user is a member of a workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
    AND user_id = auth.uid()
    AND accepted_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Get the role of current user in a workspace
CREATE OR REPLACE FUNCTION get_workspace_role(ws_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM workspace_members
  WHERE workspace_id = ws_id
  AND user_id = auth.uid()
  AND accepted_at IS NOT NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if current user is an admin (owner or admin role) of a workspace
CREATE OR REPLACE FUNCTION is_workspace_admin(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND accepted_at IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if current user is the owner of a workspace
CREATE OR REPLACE FUNCTION is_workspace_owner(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = ws_id
    AND owner_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- RLS Policies for workspaces table
-- ============================================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Users can view workspaces they own or are members of
CREATE POLICY "Users can view workspaces they belong to"
  ON workspaces FOR SELECT
  USING (owner_id = auth.uid() OR is_workspace_member(id));

-- Users can create workspaces (they become the owner)
CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Admins and owners can update workspace details
CREATE POLICY "Admins can update workspaces"
  ON workspaces FOR UPDATE
  USING (is_workspace_admin(id));

-- Only owners can delete workspaces
CREATE POLICY "Owners can delete workspaces"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================================
-- RLS Policies for workspace_members table
-- ============================================================================

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Members can view other members in their workspaces
-- Also allow viewing if you have a pending invite (email match)
CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    is_workspace_member(workspace_id)
    OR is_workspace_owner(workspace_id)
    OR email = auth.email()
  );

-- Admins can invite new members
CREATE POLICY "Admins can invite members"
  ON workspace_members FOR INSERT
  WITH CHECK (is_workspace_admin(workspace_id) OR is_workspace_owner(workspace_id));

-- Admins can update member roles; users can update their own record (accept invite)
CREATE POLICY "Admins can update members"
  ON workspace_members FOR UPDATE
  USING (
    is_workspace_admin(workspace_id)
    OR is_workspace_owner(workspace_id)
    OR (user_id = auth.uid())
    OR (email = auth.email())
  );

-- Admins can remove members; users can remove themselves (leave)
CREATE POLICY "Admins can remove members"
  ON workspace_members FOR DELETE
  USING (
    is_workspace_admin(workspace_id)
    OR is_workspace_owner(workspace_id)
    OR user_id = auth.uid()
  );

-- ============================================================================
-- Update existing RLS policies for diagrams to include workspace access
-- ============================================================================

-- Drop existing policies that need updating
DROP POLICY IF EXISTS "Users can view own or shared diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can view own, shared, or workspace diagrams" ON diagrams;

-- Recreate with workspace support
CREATE POLICY "Users can view own, shared, or workspace diagrams"
  ON diagrams FOR SELECT
  USING (
    auth.uid() = user_id
    OR has_diagram_share_access(id)
    OR (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
  );

-- Update policy for diagram updates
DROP POLICY IF EXISTS "Users can update own or shared-edit diagrams" ON diagrams;
DROP POLICY IF EXISTS "Users can update own, shared-edit, or workspace diagrams" ON diagrams;

CREATE POLICY "Users can update own, shared-edit, or workspace diagrams"
  ON diagrams FOR UPDATE
  USING (
    auth.uid() = user_id
    OR has_diagram_edit_access(id)
    OR (workspace_id IS NOT NULL AND get_workspace_role(workspace_id) IN ('owner', 'admin', 'editor'))
  );

-- ============================================================================
-- Update existing RLS policies for folders to include workspace access
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can view own or workspace folders" ON folders;

CREATE POLICY "Users can view own or workspace folders"
  ON folders FOR SELECT
  USING (
    auth.uid() = user_id
    OR (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
  );

-- Update folder insert/update/delete policies
DROP POLICY IF EXISTS "Users can create folders" ON folders;
DROP POLICY IF EXISTS "Users can create own or workspace folders" ON folders;

CREATE POLICY "Users can create own or workspace folders"
  ON folders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (workspace_id IS NOT NULL AND get_workspace_role(workspace_id) IN ('owner', 'admin', 'editor'))
  );

DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own or workspace folders" ON folders;

CREATE POLICY "Users can update own or workspace folders"
  ON folders FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (workspace_id IS NOT NULL AND get_workspace_role(workspace_id) IN ('owner', 'admin', 'editor'))
  );

DROP POLICY IF EXISTS "Users can delete own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own or workspace folders" ON folders;

CREATE POLICY "Users can delete own or workspace folders"
  ON folders FOR DELETE
  USING (
    auth.uid() = user_id
    OR (workspace_id IS NOT NULL AND get_workspace_role(workspace_id) IN ('owner', 'admin'))
  );

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_email ON workspace_members(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
