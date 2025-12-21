-- Migration: Implement board system for family collaboration
-- Date: 2024-12-03 02:00:00
-- Description: Creates boards and board_members tables, updates entries table, and implements board-scoped RLS

-- Create boards table for family journals
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  invite_code VARCHAR(50) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'base64url'),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_members table for managing permissions
CREATE TABLE board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, user_id)
);

-- Add board_id to entries table
ALTER TABLE entries ADD COLUMN board_id UUID REFERENCES boards(id) ON DELETE CASCADE;

-- Make board_id NOT NULL (entries must belong to a board)
-- Note: This would need existing data migration in a real scenario
ALTER TABLE entries ALTER COLUMN board_id SET NOT NULL;

-- Enable RLS on new tables
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies on entries and photos
DROP POLICY IF EXISTS "Users can view their own entries" ON entries;
DROP POLICY IF EXISTS "Users can insert their own entries" ON entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON entries;
DROP POLICY IF EXISTS "Users can view photos of their entries" ON photos;
DROP POLICY IF EXISTS "Users can insert photos for their entries" ON photos;
DROP POLICY IF EXISTS "Users can update photos of their entries" ON photos;
DROP POLICY IF EXISTS "Users can delete photos of their entries" ON photos;

-- Create board RLS policies
CREATE POLICY "Users can view boards they are members of" ON boards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = boards.id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create boards" ON boards
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Board owners and admins can update boards" ON boards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = boards.id
      AND board_members.user_id = auth.uid()
      AND board_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Board owners can delete boards" ON boards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = boards.id
      AND board_members.user_id = auth.uid()
      AND board_members.role = 'owner'
    )
  );

-- Create board_members RLS policies
CREATE POLICY "Users can view board members of boards they belong to" ON board_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM board_members bm
      WHERE bm.board_id = board_members.board_id
      AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "Board owners and admins can add members" ON board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = board_members.board_id
      AND board_members.user_id = auth.uid()
      AND board_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Board owners and admins can update member roles" ON board_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM board_members bm
      WHERE bm.board_id = board_members.board_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Board owners and admins can remove members" ON board_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM board_members bm
      WHERE bm.board_id = board_members.board_id
      AND bm.user_id = auth.uid()
      AND bm.role IN ('owner', 'admin')
    )
  );

-- Create new board-scoped RLS policies for entries
CREATE POLICY "Users can view entries in boards they are members of" ON entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = entries.board_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Board members can insert entries" ON entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = entries.board_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own entries in boards they belong to" ON entries
  FOR UPDATE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = entries.board_id
      AND board_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own entries in boards they belong to" ON entries
  FOR DELETE USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM board_members
      WHERE board_members.board_id = entries.board_id
      AND board_members.user_id = auth.uid()
    )
  );

-- Create new board-scoped RLS policies for photos
CREATE POLICY "Users can view photos in boards they are members of" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM entries e
      JOIN board_members bm ON bm.board_id = e.board_id
      WHERE e.id = photos.entry_id
      AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for entries in boards they belong to" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries e
      JOIN board_members bm ON bm.board_id = e.board_id
      WHERE e.id = photos.entry_id
      AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos of their entries in boards they belong to" ON photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM entries e
      JOIN board_members bm ON bm.board_id = e.board_id
      WHERE e.id = photos.entry_id
      AND bm.user_id = auth.uid()
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos of their entries in boards they belong to" ON photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM entries e
      JOIN board_members bm ON bm.board_id = e.board_id
      WHERE e.id = photos.entry_id
      AND bm.user_id = auth.uid()
      AND e.user_id = auth.uid()
    )
  );

-- Create function to automatically add board creator as owner
CREATE OR REPLACE FUNCTION add_board_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO board_members (board_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add board creator as owner
CREATE TRIGGER add_board_creator_as_owner_trigger
  AFTER INSERT ON boards
  FOR EACH ROW EXECUTE FUNCTION add_board_creator_as_owner();

-- Create indexes for better performance
CREATE INDEX idx_board_members_board_id ON board_members(board_id);
CREATE INDEX idx_board_members_user_id ON board_members(user_id);
CREATE INDEX idx_entries_board_id ON entries(board_id);
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_photos_entry_id ON photos(entry_id);