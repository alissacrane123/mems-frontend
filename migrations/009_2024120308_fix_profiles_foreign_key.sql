-- Migration: Fix foreign key relationship between entries and profiles
-- Date: 2024-12-03 08:00:00
-- Description: Updates foreign key to point to profiles instead of auth.users

-- Drop existing foreign key
ALTER TABLE entries
DROP CONSTRAINT IF EXISTS entries_user_id_fkey;

-- Add new foreign key pointing to profiles
ALTER TABLE entries
ADD CONSTRAINT entries_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Reload the schema cache
NOTIFY pgrst, 'reload schema';
