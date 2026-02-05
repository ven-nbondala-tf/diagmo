-- Diagmo Pro Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagrams table
CREATE TABLE IF NOT EXISTS diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Untitled Diagram',
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagram versions table (for history)
CREATE TABLE IF NOT EXISTS diagram_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(diagram_id, version)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_folder_id ON diagrams(folder_id);
CREATE INDEX IF NOT EXISTS idx_diagram_versions_diagram_id ON diagram_versions(diagram_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_diagrams_updated_at ON diagrams;
CREATE TRIGGER update_diagrams_updated_at
  BEFORE UPDATE ON diagrams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RETURN NEW;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_versions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Folders policies
CREATE POLICY "Users can view own folders"
  ON folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders"
  ON folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  USING (auth.uid() = user_id);

-- Diagrams policies
CREATE POLICY "Users can view own diagrams"
  ON diagrams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own diagrams"
  ON diagrams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagrams"
  ON diagrams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagrams"
  ON diagrams FOR DELETE
  USING (auth.uid() = user_id);

-- Diagram versions policies
CREATE POLICY "Users can view own diagram versions"
  ON diagram_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_versions.diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for own diagrams"
  ON diagram_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_versions.diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete versions for own diagrams"
  ON diagram_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM diagrams
      WHERE diagrams.id = diagram_versions.diagram_id
      AND diagrams.user_id = auth.uid()
    )
  );

-- =============================================
-- Custom Shape Libraries
-- =============================================

-- Shape libraries table
CREATE TABLE IF NOT EXISTS shape_libraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom shapes table
CREATE TABLE IF NOT EXISTS custom_shapes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  library_id UUID REFERENCES shape_libraries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  svg_content TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for shape libraries
CREATE INDEX IF NOT EXISTS idx_shape_libraries_user_id ON shape_libraries(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_shapes_library_id ON custom_shapes(library_id);

-- Updated at trigger for shape_libraries
DROP TRIGGER IF EXISTS update_shape_libraries_updated_at ON shape_libraries;
CREATE TRIGGER update_shape_libraries_updated_at
  BEFORE UPDATE ON shape_libraries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE shape_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_shapes ENABLE ROW LEVEL SECURITY;

-- Shape libraries policies
CREATE POLICY "Users can view own libraries"
  ON shape_libraries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public libraries"
  ON shape_libraries FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create own libraries"
  ON shape_libraries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own libraries"
  ON shape_libraries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own libraries"
  ON shape_libraries FOR DELETE
  USING (auth.uid() = user_id);

-- Custom shapes policies
CREATE POLICY "Users can view shapes in own libraries"
  ON custom_shapes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shape_libraries
      WHERE shape_libraries.id = custom_shapes.library_id
      AND shape_libraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view shapes in public libraries"
  ON custom_shapes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shape_libraries
      WHERE shape_libraries.id = custom_shapes.library_id
      AND shape_libraries.is_public = true
    )
  );

CREATE POLICY "Users can create shapes in own libraries"
  ON custom_shapes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shape_libraries
      WHERE shape_libraries.id = custom_shapes.library_id
      AND shape_libraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update shapes in own libraries"
  ON custom_shapes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shape_libraries
      WHERE shape_libraries.id = custom_shapes.library_id
      AND shape_libraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shapes in own libraries"
  ON custom_shapes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shape_libraries
      WHERE shape_libraries.id = custom_shapes.library_id
      AND shape_libraries.user_id = auth.uid()
    )
  );
