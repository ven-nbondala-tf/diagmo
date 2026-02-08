-- Migration: Feedback, User Settings, and Notifications
-- Description: Add tables for storing user feedback, settings, and notifications

-- ============================================================================
-- FEEDBACK TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'question', 'other')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'closed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- RLS policies for feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create feedback
CREATE POLICY "Users can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- USER SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Theme settings
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),

  -- Editor settings
  auto_save BOOLEAN NOT NULL DEFAULT true,
  show_minimap BOOLEAN NOT NULL DEFAULT true,
  show_grid BOOLEAN NOT NULL DEFAULT true,
  snap_to_grid BOOLEAN NOT NULL DEFAULT false,
  grid_size INTEGER NOT NULL DEFAULT 10,
  default_zoom NUMERIC(3, 2) NOT NULL DEFAULT 1.0,

  -- Notification preferences
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own settings
CREATE POLICY "Users can create own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('share', 'comment', 'mention', 'invite', 'update', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,

  -- Related entities (optional)
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Additional data
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System/triggers can create notifications for any user
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for feedback
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- Update timestamp trigger for user_settings
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- ============================================================================
-- NOTIFICATION TRIGGERS (Auto-create notifications on certain events)
-- ============================================================================

-- Create notification when a diagram is shared
CREATE OR REPLACE FUNCTION notify_on_diagram_share()
RETURNS TRIGGER AS $$
DECLARE
  diagram_name TEXT;
  sharer_email TEXT;
BEGIN
  -- Get diagram name
  SELECT name INTO diagram_name FROM diagrams WHERE id = NEW.diagram_id;

  -- Get sharer email
  SELECT email INTO sharer_email FROM auth.users WHERE id = NEW.shared_by;

  -- Create notification for the recipient
  INSERT INTO notifications (user_id, type, title, message, diagram_id, actor_id)
  VALUES (
    NEW.shared_with,
    'share',
    'Diagram shared with you',
    COALESCE(sharer_email, 'Someone') || ' shared "' || COALESCE(diagram_name, 'a diagram') || '" with you',
    NEW.diagram_id,
    NEW.shared_by
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if diagram_shares table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'diagram_shares') THEN
    DROP TRIGGER IF EXISTS on_diagram_share_notify ON diagram_shares;
    CREATE TRIGGER on_diagram_share_notify
      AFTER INSERT ON diagram_shares
      FOR EACH ROW
      EXECUTE FUNCTION notify_on_diagram_share();
  END IF;
END $$;

-- Create notification when invited to workspace
CREATE OR REPLACE FUNCTION notify_on_workspace_invite()
RETURNS TRIGGER AS $$
DECLARE
  workspace_name TEXT;
  inviter_email TEXT;
  invitee_id UUID;
BEGIN
  -- Only for new invites (email-based)
  IF NEW.user_id IS NULL AND NEW.email IS NOT NULL THEN
    -- Try to find user by email
    SELECT id INTO invitee_id FROM auth.users WHERE email = NEW.email;

    IF invitee_id IS NOT NULL THEN
      -- Get workspace name
      SELECT name INTO workspace_name FROM workspaces WHERE id = NEW.workspace_id;

      -- Get inviter email
      SELECT email INTO inviter_email FROM auth.users WHERE id = NEW.invited_by;

      -- Create notification
      INSERT INTO notifications (user_id, type, title, message, workspace_id, actor_id)
      VALUES (
        invitee_id,
        'invite',
        'Workspace invitation',
        COALESCE(inviter_email, 'Someone') || ' invited you to join "' || COALESCE(workspace_name, 'a workspace') || '"',
        NEW.workspace_id,
        NEW.invited_by
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if workspace_members table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspace_members') THEN
    DROP TRIGGER IF EXISTS on_workspace_invite_notify ON workspace_members;
    CREATE TRIGGER on_workspace_invite_notify
      AFTER INSERT ON workspace_members
      FOR EACH ROW
      EXECUTE FUNCTION notify_on_workspace_invite();
  END IF;
END $$;
