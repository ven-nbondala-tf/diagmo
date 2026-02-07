-- ============================================================================
-- Audit Logging Migration
-- Tracks user actions for diagrams, folders, workspaces, and sharing
-- ============================================================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT, -- Denormalized for historical reference

  -- What was affected
  entity_type TEXT NOT NULL CHECK (entity_type IN ('diagram', 'folder', 'workspace', 'share', 'workspace_member')),
  entity_id UUID NOT NULL,
  entity_name TEXT, -- Denormalized for historical reference

  -- What happened
  action TEXT NOT NULL CHECK (action IN (
    'create', 'update', 'delete', 'duplicate',
    'move', 'rename', 'share', 'unshare',
    'invite', 'join', 'leave', 'role_change',
    'restore_version'
  )),

  -- Context
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,

  -- Additional details (JSON for flexibility)
  metadata JSONB DEFAULT '{}',

  -- When
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace ON audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- RLS Policies for audit_logs
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view audit logs for:
-- 1. Their own actions
-- 2. Actions on their own diagrams/folders
-- 3. Actions in workspaces they belong to
CREATE POLICY "Users can view relevant audit logs"
  ON audit_logs FOR SELECT
  USING (
    user_id = auth.uid()
    OR (entity_type = 'diagram' AND entity_id IN (
      SELECT id FROM diagrams WHERE user_id = auth.uid()
    ))
    OR (entity_type = 'folder' AND entity_id IN (
      SELECT id FROM folders WHERE user_id = auth.uid()
    ))
    OR (workspace_id IS NOT NULL AND is_workspace_member(workspace_id))
  );

-- Only the system can insert audit logs (via triggers/functions)
-- Users cannot directly insert
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- Will be controlled via SECURITY DEFINER function

-- Audit logs are immutable - no updates or deletes
-- (No UPDATE or DELETE policies)

-- ============================================================================
-- Helper function to create audit log entries
-- ============================================================================

CREATE OR REPLACE FUNCTION create_audit_log(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_entity_name TEXT,
  p_action TEXT,
  p_workspace_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_log_id UUID;
BEGIN
  -- Get current user info
  v_user_id := auth.uid();
  v_user_email := auth.email();

  -- Insert the audit log
  INSERT INTO audit_logs (
    user_id, user_email, entity_type, entity_id,
    entity_name, action, workspace_id, metadata
  ) VALUES (
    v_user_id, v_user_email, p_entity_type, p_entity_id,
    p_entity_name, p_action, p_workspace_id, p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Triggers for automatic audit logging
-- ============================================================================

-- Diagram audit trigger function
CREATE OR REPLACE FUNCTION audit_diagram_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'diagram', NEW.id, NEW.name, 'create',
      NEW.workspace_id,
      jsonb_build_object('folder_id', NEW.folder_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check what changed
    IF OLD.name != NEW.name THEN
      PERFORM create_audit_log(
        'diagram', NEW.id, NEW.name, 'rename',
        NEW.workspace_id,
        jsonb_build_object('old_name', OLD.name, 'new_name', NEW.name)
      );
    END IF;

    IF OLD.folder_id IS DISTINCT FROM NEW.folder_id THEN
      PERFORM create_audit_log(
        'diagram', NEW.id, NEW.name, 'move',
        NEW.workspace_id,
        jsonb_build_object('old_folder_id', OLD.folder_id, 'new_folder_id', NEW.folder_id)
      );
    END IF;

    IF OLD.workspace_id IS DISTINCT FROM NEW.workspace_id THEN
      PERFORM create_audit_log(
        'diagram', NEW.id, NEW.name, 'move',
        COALESCE(NEW.workspace_id, OLD.workspace_id),
        jsonb_build_object(
          'old_workspace_id', OLD.workspace_id,
          'new_workspace_id', NEW.workspace_id
        )
      );
    END IF;

    -- Log content updates (but not every save - only significant ones)
    IF OLD.nodes::text != NEW.nodes::text OR OLD.edges::text != NEW.edges::text THEN
      -- Only log if it's been more than 5 minutes since last update log
      IF NOT EXISTS (
        SELECT 1 FROM audit_logs
        WHERE entity_id = NEW.id
          AND action = 'update'
          AND created_at > now() - interval '5 minutes'
      ) THEN
        PERFORM create_audit_log(
          'diagram', NEW.id, NEW.name, 'update',
          NEW.workspace_id,
          jsonb_build_object(
            'node_count', jsonb_array_length(NEW.nodes::jsonb),
            'edge_count', jsonb_array_length(NEW.edges::jsonb)
          )
        );
      END IF;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      'diagram', OLD.id, OLD.name, 'delete',
      OLD.workspace_id,
      jsonb_build_object('deleted_by', auth.uid())
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the diagram trigger
DROP TRIGGER IF EXISTS audit_diagrams ON diagrams;
CREATE TRIGGER audit_diagrams
  AFTER INSERT OR UPDATE OR DELETE ON diagrams
  FOR EACH ROW
  EXECUTE FUNCTION audit_diagram_changes();

-- Folder audit trigger function
CREATE OR REPLACE FUNCTION audit_folder_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'folder', NEW.id, NEW.name, 'create',
      NEW.workspace_id,
      jsonb_build_object('parent_id', NEW.parent_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.name != NEW.name THEN
      PERFORM create_audit_log(
        'folder', NEW.id, NEW.name, 'rename',
        NEW.workspace_id,
        jsonb_build_object('old_name', OLD.name, 'new_name', NEW.name)
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      'folder', OLD.id, OLD.name, 'delete',
      OLD.workspace_id,
      '{}'::jsonb
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the folder trigger
DROP TRIGGER IF EXISTS audit_folders ON folders;
CREATE TRIGGER audit_folders
  AFTER INSERT OR UPDATE OR DELETE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION audit_folder_changes();

-- Workspace audit trigger function
CREATE OR REPLACE FUNCTION audit_workspace_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'workspace', NEW.id, NEW.name, 'create',
      NEW.id,
      '{}'::jsonb
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.name != NEW.name THEN
      PERFORM create_audit_log(
        'workspace', NEW.id, NEW.name, 'rename',
        NEW.id,
        jsonb_build_object('old_name', OLD.name, 'new_name', NEW.name)
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      'workspace', OLD.id, OLD.name, 'delete',
      NULL,
      '{}'::jsonb
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the workspace trigger
DROP TRIGGER IF EXISTS audit_workspaces ON workspaces;
CREATE TRIGGER audit_workspaces
  AFTER INSERT OR UPDATE OR DELETE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION audit_workspace_changes();

-- Workspace member audit trigger function
CREATE OR REPLACE FUNCTION audit_workspace_member_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_workspace_name TEXT;
BEGIN
  -- Get workspace name
  SELECT name INTO v_workspace_name FROM workspaces WHERE id = COALESCE(NEW.workspace_id, OLD.workspace_id);

  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'workspace_member', NEW.id, COALESCE(NEW.email, 'member'), 'invite',
      NEW.workspace_id,
      jsonb_build_object('role', NEW.role, 'email', NEW.email)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if this is accepting an invite
    IF OLD.accepted_at IS NULL AND NEW.accepted_at IS NOT NULL THEN
      PERFORM create_audit_log(
        'workspace_member', NEW.id, COALESCE(NEW.email, 'member'), 'join',
        NEW.workspace_id,
        jsonb_build_object('role', NEW.role)
      );
    -- Check if role changed
    ELSIF OLD.role != NEW.role THEN
      PERFORM create_audit_log(
        'workspace_member', NEW.id, COALESCE(NEW.email, 'member'), 'role_change',
        NEW.workspace_id,
        jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      'workspace_member', OLD.id, COALESCE(OLD.email, 'member'), 'leave',
      OLD.workspace_id,
      jsonb_build_object('role', OLD.role)
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the workspace member trigger
DROP TRIGGER IF EXISTS audit_workspace_members ON workspace_members;
CREATE TRIGGER audit_workspace_members
  AFTER INSERT OR UPDATE OR DELETE ON workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION audit_workspace_member_changes();

-- Share audit trigger function
CREATE OR REPLACE FUNCTION audit_share_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_diagram_name TEXT;
BEGIN
  -- Get diagram name
  SELECT name INTO v_diagram_name FROM diagrams WHERE id = COALESCE(NEW.diagram_id, OLD.diagram_id);

  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'share', NEW.id, v_diagram_name, 'share',
      NULL,
      jsonb_build_object(
        'diagram_id', NEW.diagram_id,
        'permission', NEW.permission,
        'share_type', CASE
          WHEN NEW.shared_with_email IS NOT NULL THEN 'email'
          WHEN NEW.is_public THEN 'public'
          ELSE 'link'
        END,
        'shared_with', NEW.shared_with_email
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.permission != NEW.permission THEN
      PERFORM create_audit_log(
        'share', NEW.id, v_diagram_name, 'update',
        NULL,
        jsonb_build_object(
          'diagram_id', NEW.diagram_id,
          'old_permission', OLD.permission,
          'new_permission', NEW.permission
        )
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      'share', OLD.id, v_diagram_name, 'unshare',
      NULL,
      jsonb_build_object(
        'diagram_id', OLD.diagram_id,
        'shared_with', OLD.shared_with_email
      )
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the share trigger
DROP TRIGGER IF EXISTS audit_shares ON diagram_shares;
CREATE TRIGGER audit_shares
  AFTER INSERT OR UPDATE OR DELETE ON diagram_shares
  FOR EACH ROW
  EXECUTE FUNCTION audit_share_changes();
