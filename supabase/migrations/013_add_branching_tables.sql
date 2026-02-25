-- Diagram branching tables for Git-like versioning
-- Migration: 013_add_branching_tables.sql

-- Diagram branches table
CREATE TABLE IF NOT EXISTS diagram_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagram_id UUID NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_branch_id UUID REFERENCES diagram_branches(id) ON DELETE SET NULL,
  parent_version_id UUID, -- Will reference branch_versions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_default BOOLEAN DEFAULT false,
  head_version_id UUID, -- Will reference branch_versions
  UNIQUE(diagram_id, name)
);

-- Branch versions (commits)
CREATE TABLE IF NOT EXISTS branch_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES diagram_branches(id) ON DELETE CASCADE,
  parent_version_id UUID REFERENCES branch_versions(id) ON DELETE SET NULL,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Add foreign key for head_version_id now that branch_versions exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'diagram_branches_head_version_id_fkey'
  ) THEN
    ALTER TABLE diagram_branches
    ADD CONSTRAINT diagram_branches_head_version_id_fkey
    FOREIGN KEY (head_version_id) REFERENCES branch_versions(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Add foreign key for parent_version_id in diagram_branches
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'diagram_branches_parent_version_id_fkey'
  ) THEN
    ALTER TABLE diagram_branches
    ADD CONSTRAINT diagram_branches_parent_version_id_fkey
    FOREIGN KEY (parent_version_id) REFERENCES branch_versions(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Indexes for diagram_branches
CREATE INDEX IF NOT EXISTS idx_diagram_branches_diagram ON diagram_branches(diagram_id);
CREATE INDEX IF NOT EXISTS idx_diagram_branches_parent ON diagram_branches(parent_branch_id);
CREATE INDEX IF NOT EXISTS idx_diagram_branches_default ON diagram_branches(diagram_id, is_default) WHERE is_default = true;

-- Indexes for branch_versions
CREATE INDEX IF NOT EXISTS idx_branch_versions_branch ON branch_versions(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_versions_parent ON branch_versions(parent_version_id);
CREATE INDEX IF NOT EXISTS idx_branch_versions_created ON branch_versions(created_at DESC);

-- Enable RLS
ALTER TABLE diagram_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for diagram_branches
-- Users can view branches for diagrams they own or are shared with
CREATE POLICY "Users can view diagram branches"
  ON diagram_branches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diagrams d
      WHERE d.id = diagram_branches.diagram_id
      AND (
        d.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM diagram_shares ds
          WHERE ds.diagram_id = d.id AND ds.shared_with_email = auth.jwt()->>'email'
        )
      )
    )
  );

-- Users can create branches on diagrams they own or have edit access
CREATE POLICY "Users can create branches"
  ON diagram_branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diagrams d
      WHERE d.id = diagram_branches.diagram_id
      AND (
        d.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM diagram_shares ds
          WHERE ds.diagram_id = d.id
          AND ds.shared_with_email = auth.jwt()->>'email'
          AND ds.permission IN ('edit', 'admin')
        )
      )
    )
  );

-- Users can update branches they created or on diagrams they own
CREATE POLICY "Users can update branches"
  ON diagram_branches FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM diagrams d
      WHERE d.id = diagram_branches.diagram_id
      AND d.user_id = auth.uid()
    )
  );

-- Users can delete non-default branches they created or on diagrams they own
CREATE POLICY "Users can delete branches"
  ON diagram_branches FOR DELETE
  USING (
    is_default = false
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM diagrams d
        WHERE d.id = diagram_branches.diagram_id
        AND d.user_id = auth.uid()
      )
    )
  );

-- RLS policies for branch_versions
-- Users can view versions for branches they can access
CREATE POLICY "Users can view branch versions"
  ON branch_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diagram_branches db
      JOIN diagrams d ON d.id = db.diagram_id
      WHERE db.id = branch_versions.branch_id
      AND (
        d.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM diagram_shares ds
          WHERE ds.diagram_id = d.id AND ds.shared_with_email = auth.jwt()->>'email'
        )
      )
    )
  );

-- Users can create versions on branches they have access to
CREATE POLICY "Users can create versions"
  ON branch_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diagram_branches db
      JOIN diagrams d ON d.id = db.diagram_id
      WHERE db.id = branch_versions.branch_id
      AND (
        d.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM diagram_shares ds
          WHERE ds.diagram_id = d.id
          AND ds.shared_with_email = auth.jwt()->>'email'
          AND ds.permission IN ('edit', 'admin')
        )
      )
    )
  );

-- Function to ensure only one default branch per diagram
CREATE OR REPLACE FUNCTION ensure_single_default_branch()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE diagram_branches
    SET is_default = false
    WHERE diagram_id = NEW.diagram_id
    AND id != NEW.id
    AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for single default branch
DROP TRIGGER IF EXISTS ensure_single_default_branch_trigger ON diagram_branches;
CREATE TRIGGER ensure_single_default_branch_trigger
  BEFORE INSERT OR UPDATE ON diagram_branches
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_branch();

-- Function to automatically update head_version_id when a new version is created
CREATE OR REPLACE FUNCTION update_branch_head_version()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE diagram_branches
  SET head_version_id = NEW.id
  WHERE id = NEW.branch_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update head version
DROP TRIGGER IF EXISTS update_branch_head_version_trigger ON branch_versions;
CREATE TRIGGER update_branch_head_version_trigger
  AFTER INSERT ON branch_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_branch_head_version();
