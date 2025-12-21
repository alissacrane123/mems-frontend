-- Migration: Create initial database schema for journal entries and photos
-- Date: 2024-12-03 00:00:00
-- Description: Sets up the basic tables for family memory journal entries

-- Create entries table
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for entries
CREATE POLICY "Users can view their own entries" ON entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" ON entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" ON entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for photos
CREATE POLICY "Users can view photos of their entries" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = photos.entry_id
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their entries" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = photos.entry_id
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos of their entries" ON photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = photos.entry_id
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos of their entries" ON photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = photos.entry_id
      AND entries.user_id = auth.uid()
    )
  );