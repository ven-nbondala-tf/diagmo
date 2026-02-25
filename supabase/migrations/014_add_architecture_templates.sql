-- Architecture Templates Table
-- Stores cloud architecture diagram templates (AWS, Azure, GCP, etc.)
-- Migration: 014_add_architecture_templates.sql

-- Main templates table
CREATE TABLE IF NOT EXISTS architecture_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT UNIQUE NOT NULL, -- e.g., 'azure-3-tier-web-app'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}', -- e.g., ['azure', 'web-app']
  complexity TEXT NOT NULL DEFAULT 'intermediate' CHECK (complexity IN ('beginner', 'intermediate', 'advanced')),
  source TEXT, -- URL to official documentation
  tags TEXT[] NOT NULL DEFAULT '{}',
  use_cases TEXT[] NOT NULL DEFAULT '{}',
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  thumbnail_url TEXT,
  is_built_in BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,

  -- User-contributed templates
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Analytics
  use_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template categories enum-like table for reference
CREATE TABLE IF NOT EXISTS template_categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0
);

-- Insert default categories
INSERT INTO template_categories (id, label, icon, description, display_order) VALUES
  ('aws', 'AWS Architecture', 'aws-ec2', 'Amazon Web Services patterns', 1),
  ('azure', 'Azure Architecture', 'azure-vm', 'Microsoft Azure patterns', 2),
  ('gcp', 'Google Cloud', 'gcp-compute', 'Google Cloud Platform patterns', 3),
  ('multi-cloud', 'Multi-Cloud', 'cloud', 'Cross-cloud architectures', 4),
  ('web-app', 'Web Applications', 'globe', 'Web app architectures', 5),
  ('data-analytics', 'Data & Analytics', 'database', 'Data pipelines and analytics', 6),
  ('iot', 'IoT Solutions', 'cpu', 'Internet of Things patterns', 7),
  ('ai-ml', 'AI & Machine Learning', 'brain', 'ML/AI architectures', 8),
  ('devops', 'DevOps & CI/CD', 'git-branch', 'DevOps pipelines', 9),
  ('security', 'Security & Identity', 'shield', 'Security patterns', 10),
  ('networking', 'Networking', 'network', 'Network topologies', 11),
  ('containers', 'Containers & K8s', 'container', 'Container orchestration', 12),
  ('serverless', 'Serverless', 'zap', 'Serverless architectures', 13),
  ('hybrid', 'Hybrid Cloud', 'layers', 'Hybrid cloud patterns', 14),
  ('migration', 'Migration', 'arrow-right', 'Cloud migration patterns', 15),
  ('sap', 'SAP Workloads', 'building', 'SAP on cloud patterns', 16),
  ('healthcare', 'Healthcare', 'heart', 'Healthcare industry patterns', 17),
  ('financial', 'Financial Services', 'dollar-sign', 'Financial industry patterns', 18),
  ('retail', 'Retail', 'shopping-cart', 'Retail industry patterns', 19),
  ('gaming', 'Gaming', 'gamepad', 'Gaming architectures', 20)
ON CONFLICT (id) DO NOTHING;

-- User template favorites
CREATE TABLE IF NOT EXISTS template_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES architecture_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_categories ON architecture_templates USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON architecture_templates USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_templates_complexity ON architecture_templates(complexity);
CREATE INDEX IF NOT EXISTS idx_templates_published ON architecture_templates(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_templates_use_count ON architecture_templates(use_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON architecture_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_template_favorites_user ON template_favorites(user_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_templates_search ON architecture_templates
  USING GIN (to_tsvector('english', name || ' ' || description || ' ' || array_to_string(tags, ' ')));

-- Enable RLS
ALTER TABLE architecture_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for architecture_templates

-- Everyone can view published templates
CREATE POLICY "Anyone can view published templates"
  ON architecture_templates FOR SELECT
  USING (is_published = true);

-- Users can view their own unpublished templates
CREATE POLICY "Users can view own templates"
  ON architecture_templates FOR SELECT
  USING (created_by = auth.uid());

-- Authenticated users can create templates
CREATE POLICY "Users can create templates"
  ON architecture_templates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON architecture_templates FOR UPDATE
  USING (created_by = auth.uid());

-- Users can delete their own non-built-in templates
CREATE POLICY "Users can delete own templates"
  ON architecture_templates FOR DELETE
  USING (created_by = auth.uid() AND is_built_in = false);

-- RLS Policies for template_categories
CREATE POLICY "Anyone can view categories"
  ON template_categories FOR SELECT
  USING (true);

-- RLS Policies for template_favorites
CREATE POLICY "Users can view own favorites"
  ON template_favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON template_favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
  ON template_favorites FOR DELETE
  USING (user_id = auth.uid());

-- Function to increment template use count
CREATE OR REPLACE FUNCTION increment_template_use_count(p_template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE architecture_templates
  SET use_count = use_count + 1
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update template rating
CREATE OR REPLACE FUNCTION update_template_rating(
  p_template_id UUID,
  p_rating DECIMAL
)
RETURNS void AS $$
BEGIN
  UPDATE architecture_templates
  SET
    rating = ((rating * rating_count) + p_rating) / (rating_count + 1),
    rating_count = rating_count + 1
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_template_timestamp_trigger ON architecture_templates;
CREATE TRIGGER update_template_timestamp_trigger
  BEFORE UPDATE ON architecture_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_template_timestamp();
