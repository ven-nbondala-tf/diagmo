-- Migration: Collaboration Tables
-- Required for real-time collaboration presence and user profiles

-- =============================================
-- Diagram Presence Table (for real-time cursors)
-- =============================================

CREATE TABLE IF NOT EXISTS diagram_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  cursor_x FLOAT,
  cursor_y FLOAT,
  viewport_x FLOAT,
  viewport_y FLOAT,
  viewport_zoom FLOAT DEFAULT 1,
  last_seen TIMESTAMPTZ DEFAULT now(),
  UNIQUE(diagram_id, user_id)
);

-- Indexes for presence lookups
CREATE INDEX IF NOT EXISTS idx_diagram_presence_diagram ON diagram_presence(diagram_id);
CREATE INDEX IF NOT EXISTS idx_diagram_presence_user ON diagram_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_diagram_presence_last_seen ON diagram_presence(last_seen);

-- Enable RLS
ALTER TABLE diagram_presence ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Profiles Table (for user display names)
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Presence Policies
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view presence on accessible diagrams" ON diagram_presence;
DROP POLICY IF EXISTS "Users can insert own presence" ON diagram_presence;
DROP POLICY IF EXISTS "Users can update own presence" ON diagram_presence;
DROP POLICY IF EXISTS "Users can delete own presence" ON diagram_presence;

-- Users can view presence on diagrams they have access to
CREATE POLICY "Users can view presence on accessible diagrams"
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
  );

-- Users can insert their own presence
CREATE POLICY "Users can insert own presence"
  ON diagram_presence FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
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
  );

-- Users can update their own presence
CREATE POLICY "Users can update own presence"
  ON diagram_presence FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own presence
CREATE POLICY "Users can delete own presence"
  ON diagram_presence FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- Profile Policies
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Anyone can view profiles (needed for collaboration display)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================
-- Enable Realtime for Presence
-- =============================================

-- Add presence table to realtime publication
DO $$
BEGIN
  -- Check if already added to publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'diagram_presence'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE diagram_presence;
  END IF;
END $$;

-- =============================================
-- Auto-create profile on user signup (trigger)
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Cleanup old presence records (function)
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM diagram_presence
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Set up a cron job or pg_cron to run cleanup_stale_presence() periodically
-- Example with pg_cron: SELECT cron.schedule('cleanup-presence', '*/5 * * * *', 'SELECT cleanup_stale_presence()');
