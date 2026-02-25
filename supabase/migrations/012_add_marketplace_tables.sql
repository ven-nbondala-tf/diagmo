-- Marketplace tables for community template sharing
-- Migration: 012_add_marketplace_tables.sql

-- Add verified column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Marketplace templates table
CREATE TABLE IF NOT EXISTS marketplace_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Other',
  tags TEXT[] DEFAULT '{}',
  thumbnail TEXT,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  layers JSONB DEFAULT '[]',
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  price INTEGER DEFAULT 0, -- Price in cents, 0 = free
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template ratings table
CREATE TABLE IF NOT EXISTS template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Indexes for marketplace_templates
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_author ON marketplace_templates(author_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_category ON marketplace_templates(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_featured ON marketplace_templates(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_downloads ON marketplace_templates(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_rating ON marketplace_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_created ON marketplace_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_templates_tags ON marketplace_templates USING gin(tags);

-- Indexes for template_ratings
CREATE INDEX IF NOT EXISTS idx_template_ratings_template ON template_ratings(template_id);
CREATE INDEX IF NOT EXISTS idx_template_ratings_user ON template_ratings(user_id);

-- Enable RLS
ALTER TABLE marketplace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_templates
-- Everyone can read marketplace templates
CREATE POLICY "Marketplace templates are viewable by everyone"
  ON marketplace_templates FOR SELECT
  USING (true);

-- Authors can insert their own templates
CREATE POLICY "Users can create marketplace templates"
  ON marketplace_templates FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own templates
CREATE POLICY "Users can update own marketplace templates"
  ON marketplace_templates FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own templates
CREATE POLICY "Users can delete own marketplace templates"
  ON marketplace_templates FOR DELETE
  USING (auth.uid() = author_id);

-- RLS policies for template_ratings
-- Everyone can read ratings
CREATE POLICY "Template ratings are viewable by everyone"
  ON template_ratings FOR SELECT
  USING (true);

-- Users can rate templates
CREATE POLICY "Users can rate templates"
  ON template_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
  ON template_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete own ratings"
  ON template_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Function to increment marketplace downloads
CREATE OR REPLACE FUNCTION increment_marketplace_downloads(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_templates
  SET downloads = downloads + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update template rating when a rating is added/updated
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketplace_templates
  SET
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM template_ratings
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM template_ratings
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.template_id, OLD.template_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update rating
DROP TRIGGER IF EXISTS on_rating_change ON template_ratings;
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON template_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_template_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketplace_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_marketplace_template_timestamp ON marketplace_templates;
CREATE TRIGGER update_marketplace_template_timestamp
  BEFORE UPDATE ON marketplace_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_template_timestamp();
