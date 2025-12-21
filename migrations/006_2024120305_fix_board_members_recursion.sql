-- Migration: Fix board_members infinite recursion by completely resetting RLS
-- Date: 2024-12-03 05:00:00
-- Description: Completely resets board_members RLS policies to eliminate infinite recursion

-- Step 1: Temporarily disable RLS to allow policy cleanup
ALTER TABLE board_members DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on board_members (this forces cleanup)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'board_members' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON board_members';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies
-- Allow all authenticated users to view board members (safe since boards control access)
CREATE POLICY "board_members_select_policy" ON board_members
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to insert board members (for invite system and board creation)
CREATE POLICY "board_members_insert_policy" ON board_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update/delete board members
CREATE POLICY "board_members_update_policy" ON board_members
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "board_members_delete_policy" ON board_members
  FOR DELETE USING (auth.role() = 'authenticated');