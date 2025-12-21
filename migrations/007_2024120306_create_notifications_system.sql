-- Migration: Create notifications system for board invitations and activity updates
-- Date: 2024-12-03 06:00:00
-- Description: Implements notifications table with extensible type system for invitations and activity

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('board_invitation', 'new_memory', 'user_joined', 'comment', 'mention')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Polymorphic data storage using JSONB for extensibility
  data JSONB NOT NULL,

  -- Constraints for data validation based on type
  CONSTRAINT valid_board_invitation_data CHECK (
    type != 'board_invitation' OR (
      data ? 'board_id' AND
      data ? 'board_name' AND
      data ? 'invited_by_id' AND
      data ? 'invited_by_email'
    )
  ),
  CONSTRAINT valid_new_memory_data CHECK (
    type != 'new_memory' OR (
      data ? 'board_id' AND
      data ? 'board_name' AND
      data ? 'entry_id' AND
      data ? 'created_by_id' AND
      data ? 'created_by_email'
    )
  ),
  CONSTRAINT valid_user_joined_data CHECK (
    type != 'user_joined' OR (
      data ? 'board_id' AND
      data ? 'board_name' AND
      data ? 'user_id' AND
      data ? 'user_email'
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications for other users" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Function to lookup user by email (returns user_id or NULL)
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
DECLARE
  found_user_id UUID;
BEGIN
  SELECT id INTO found_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  RETURN found_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user email by user_id (for notification display)
CREATE OR REPLACE FUNCTION get_user_email_by_id(lookup_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  found_email TEXT;
BEGIN
  SELECT email INTO found_email
  FROM auth.users
  WHERE id = lookup_user_id
  LIMIT 1;

  RETURN found_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email_by_id(UUID) TO authenticated;
