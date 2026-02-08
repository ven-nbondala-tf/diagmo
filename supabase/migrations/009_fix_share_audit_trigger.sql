-- Migration: Fix Share Triggers and RLS Policies
--
-- Problem 1: Triggers reference wrong column names
-- Problem 2: RLS policies may not check email-based shares correctly
--
-- Correct column names:
--   - invited_by (not shared_by)
--   - shared_with_user_id (not shared_with)
--   - shared_with_email
--
-- Solution: Fix triggers and ensure helper functions check both user_id AND email.

-- =============================================
-- Fix 0: Helper functions for share access (check BOTH user_id and email)
-- Uses auth.email() to avoid permission issues with auth.users table
-- =============================================

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

-- Update diagram_shares policy to also check by email
DROP POLICY IF EXISTS "Users can view their shares" ON diagram_shares;
CREATE POLICY "Users can view their shares"
  ON diagram_shares FOR SELECT
  USING (
    shared_with_user_id = auth.uid()
    OR shared_with_email = auth.email()
  );

-- =============================================
-- Fix 1: Notification trigger
-- =============================================

DROP TRIGGER IF EXISTS on_diagram_share_notify ON diagram_shares;

CREATE OR REPLACE FUNCTION notify_on_diagram_share()
RETURNS TRIGGER AS $$
DECLARE
  diagram_name TEXT;
  sharer_email TEXT;
BEGIN
  -- Only notify if shared with a user (not just email invite)
  IF NEW.shared_with_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get diagram name
  SELECT name INTO diagram_name FROM diagrams WHERE id = NEW.diagram_id;

  -- Get sharer email (invited_by is the correct column)
  SELECT email INTO sharer_email FROM auth.users WHERE id = NEW.invited_by;

  -- Create notification for the recipient (shared_with_user_id is the correct column)
  INSERT INTO notifications (user_id, type, title, message, diagram_id, actor_id)
  VALUES (
    NEW.shared_with_user_id,
    'share',
    'Diagram shared with you',
    COALESCE(sharer_email, 'Someone') || ' shared "' || COALESCE(diagram_name, 'a diagram') || '" with you',
    NEW.diagram_id,
    NEW.invited_by
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the share if notification fails
    RAISE WARNING 'Failed to create share notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_diagram_share_notify
  AFTER INSERT ON diagram_shares
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_diagram_share();

-- =============================================
-- Fix 2: Audit trigger
-- =============================================

DROP TRIGGER IF EXISTS audit_shares ON diagram_shares;

-- Recreate the function without is_public reference
CREATE OR REPLACE FUNCTION audit_share_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_diagram_name TEXT;
BEGIN
  -- Get diagram name for context
  SELECT name INTO v_diagram_name
  FROM diagrams
  WHERE id = COALESCE(NEW.diagram_id, OLD.diagram_id);

  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'share', NEW.id, v_diagram_name, 'share',
      NULL,
      jsonb_build_object(
        'diagram_id', NEW.diagram_id,
        'permission', NEW.permission,
        'share_type', CASE
          WHEN NEW.shared_with_email IS NOT NULL THEN 'email'
          WHEN NEW.shared_with_user_id IS NOT NULL THEN 'user'
          ELSE 'link'
        END,
        'shared_with', COALESCE(NEW.shared_with_email, NEW.shared_with_user_id::TEXT)
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
        'shared_with', COALESCE(OLD.shared_with_email, OLD.shared_with_user_id::TEXT)
      )
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER audit_shares
  AFTER INSERT OR UPDATE OR DELETE ON diagram_shares
  FOR EACH ROW
  EXECUTE FUNCTION audit_share_changes();
