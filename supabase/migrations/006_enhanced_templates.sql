-- Enhanced Architecture Templates Migration
-- Adds support for cloud architecture templates with categories, complexity, variables, etc.

-- =============================================
-- Step 1: Modify diagram_templates table
-- =============================================

-- Add new columns to diagram_templates
ALTER TABLE diagram_templates
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS complexity TEXT CHECK (complexity IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS groups JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS annotations JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS estimated_cost TEXT,
  ADD COLUMN IF NOT EXISTS use_cases TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_templates UUID[] DEFAULT '{}';

-- Migrate existing category column data to categories array
UPDATE diagram_templates
SET categories = ARRAY[category]::TEXT[]
WHERE category IS NOT NULL AND (categories IS NULL OR categories = '{}');

-- Make user_id nullable for built-in/official templates
ALTER TABLE diagram_templates
  ALTER COLUMN user_id DROP NOT NULL;

-- =============================================
-- Step 2: Create indexes for better search
-- =============================================

-- Full-text search index on name, description, and tags
CREATE INDEX IF NOT EXISTS idx_templates_search ON diagram_templates
  USING GIN (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || array_to_string(COALESCE(tags, '{}'), ' ')));

-- Index for category filter
CREATE INDEX IF NOT EXISTS idx_templates_categories ON diagram_templates USING GIN (categories);

-- Index for tags filter
CREATE INDEX IF NOT EXISTS idx_templates_tags ON diagram_templates USING GIN (tags);

-- Index for use_cases filter
CREATE INDEX IF NOT EXISTS idx_templates_use_cases ON diagram_templates USING GIN (use_cases);

-- Index for complexity filter
CREATE INDEX IF NOT EXISTS idx_templates_complexity ON diagram_templates (complexity);

-- Index for official templates
CREATE INDEX IF NOT EXISTS idx_templates_official ON diagram_templates (is_official) WHERE is_official = true;

-- =============================================
-- Step 3: Create template_favorites table
-- =============================================

CREATE TABLE IF NOT EXISTS template_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES diagram_templates(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- Enable RLS on template_favorites
ALTER TABLE template_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON template_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their favorites
CREATE POLICY "Users can add favorites"
  ON template_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove from their favorites
CREATE POLICY "Users can remove favorites"
  ON template_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Step 4: Create template_usage table
-- =============================================

CREATE TABLE IF NOT EXISTS template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES diagram_templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on template_usage
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON template_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Users can track their usage
CREATE POLICY "Users can track usage"
  ON template_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for template usage analytics
CREATE INDEX IF NOT EXISTS idx_template_usage_template ON template_usage (template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_user ON template_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_created ON template_usage (created_at);

-- =============================================
-- Step 5: Create function to increment use count
-- =============================================

CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE diagram_templates
  SET use_count = COALESCE(use_count, 0) + 1,
      updated_at = now()
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-incrementing use count
DROP TRIGGER IF EXISTS on_template_used ON template_usage;
CREATE TRIGGER on_template_used
  AFTER INSERT ON template_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_template_usage();

-- =============================================
-- Step 6: Update RLS policies for diagram_templates
-- =============================================

-- Drop existing policies and recreate with official template support
DROP POLICY IF EXISTS "Users can view own templates" ON diagram_templates;
DROP POLICY IF EXISTS "Users can create templates" ON diagram_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON diagram_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON diagram_templates;

-- Users can view their own templates, public templates, or official templates
CREATE POLICY "Users can view templates"
  ON diagram_templates FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_public = true
    OR is_official = true
    OR (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = diagram_templates.workspace_id
      AND workspace_members.user_id = auth.uid()
    ))
  );

-- Users can create templates (assigned to themselves)
CREATE POLICY "Users can create templates"
  ON diagram_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON diagram_templates FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON diagram_templates FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Step 7: Create function to search templates
-- =============================================

CREATE OR REPLACE FUNCTION search_templates(
  search_query TEXT DEFAULT NULL,
  category_filter TEXT[] DEFAULT NULL,
  complexity_filter TEXT DEFAULT NULL,
  tags_filter TEXT[] DEFAULT NULL,
  official_only BOOLEAN DEFAULT false,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  categories TEXT[],
  complexity TEXT,
  thumbnail TEXT,
  use_count INTEGER,
  is_official BOOLEAN,
  is_public BOOLEAN,
  user_id UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dt.id,
    dt.name,
    dt.description,
    dt.categories,
    dt.complexity,
    dt.thumbnail,
    dt.use_count,
    dt.is_official,
    dt.is_public,
    dt.user_id,
    dt.created_at
  FROM diagram_templates dt
  WHERE
    -- Search filter
    (search_query IS NULL OR to_tsvector('english', COALESCE(dt.name, '') || ' ' || COALESCE(dt.description, '') || ' ' || array_to_string(COALESCE(dt.tags, '{}'), ' ')) @@ plainto_tsquery('english', search_query))
    -- Category filter
    AND (category_filter IS NULL OR dt.categories && category_filter)
    -- Complexity filter
    AND (complexity_filter IS NULL OR dt.complexity = complexity_filter)
    -- Tags filter
    AND (tags_filter IS NULL OR dt.tags && tags_filter)
    -- Official only filter
    AND (NOT official_only OR dt.is_official = true)
    -- Visibility check
    AND (dt.is_public = true OR dt.is_official = true OR dt.user_id = auth.uid())
  ORDER BY
    dt.is_official DESC,
    dt.use_count DESC,
    dt.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Step 8: Create function to get popular templates
-- =============================================

CREATE OR REPLACE FUNCTION get_popular_templates(
  category_filter TEXT[] DEFAULT NULL,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  categories TEXT[],
  complexity TEXT,
  thumbnail TEXT,
  use_count INTEGER,
  is_official BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dt.id,
    dt.name,
    dt.description,
    dt.categories,
    dt.complexity,
    dt.thumbnail,
    dt.use_count,
    dt.is_official
  FROM diagram_templates dt
  WHERE
    (dt.is_public = true OR dt.is_official = true)
    AND (category_filter IS NULL OR dt.categories && category_filter)
  ORDER BY dt.use_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_templates TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_templates TO authenticated;
