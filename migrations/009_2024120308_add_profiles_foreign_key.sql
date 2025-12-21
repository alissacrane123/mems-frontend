-- Migration: Add foreign key relationship between entries and profiles
-- Date: 2024-12-03 08:00:00
-- Description: Adds foreign key constraint so Supabase can join entries with profiles

-- Add foreign key constraint to entries table
ALTER TABLE entries
ADD CONSTRAINT entries_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Reload the schema cache
NOTIFY pgrst, 'reload schema';
