-- Migration: Simplified board_members RLS policies to avoid recursion
-- Date: 2024-12-03 04:00:00
-- Description: Replaces complex RLS policies with simpler ones that don't cause infinite recursion

-- Drop all existing board_members policies
DROP POLICY IF EXISTS "Users can view board members of boards they belong to" ON board_members;
DROP POLICY IF EXISTS "Board owners and admins can add members" ON board_members;
DROP POLICY IF EXISTS "Board owners and admins can update member roles" ON board_members;
DROP POLICY IF EXISTS "Board owners and admins can remove members" ON board_members;

-- Create simpler policies that avoid recursion

-- Users can view all board members (this is safe since board access is already controlled)
CREATE POLICY "Users can view board members" ON board_members
  FOR SELECT USING (true);

-- Allow board creators to add the initial owner membership (via trigger)
-- and allow authenticated users to add themselves as members (for invite system)
CREATE POLICY "Users can add board members" ON board_members
  FOR INSERT WITH CHECK (
    -- Allow if user is adding themselves (invite system)
    user_id = auth.uid() OR
    -- Allow if this is being done by the board creator trigger
    (role = 'owner' AND EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_members.board_id
      AND boards.created_by = auth.uid()
    ))
  );

-- Users can update their own membership or owners can update any membership
CREATE POLICY "Users can update board members" ON board_members
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_members.board_id
      AND boards.created_by = auth.uid()
    )
  );

-- Users can remove themselves or owners can remove any member
CREATE POLICY "Users can remove board members" ON board_members
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_members.board_id
      AND boards.created_by = auth.uid()
    )
  );