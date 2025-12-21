-- Migration: Fix infinite recursion in board_members RLS policy
-- Date: 2024-12-03 03:00:00
-- Description: Fixes the INSERT policy for board_members that was causing infinite recursion

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Board owners and admins can add members" ON board_members;

-- Create a corrected INSERT policy that doesn't cause recursion
CREATE POLICY "Board owners and admins can add members" ON board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM board_members existing_members
      WHERE existing_members.board_id = board_members.board_id
      AND existing_members.user_id = auth.uid()
      AND existing_members.role IN ('owner', 'admin')
    )
  );