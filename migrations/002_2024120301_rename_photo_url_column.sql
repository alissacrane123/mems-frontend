-- Migration: Rename photos.url column to file_path
-- Date: 2024-12-03 01:00:00
-- Description: Renames the url column to file_path for better semantic clarity

-- Rename the url column to file_path in photos table
ALTER TABLE photos RENAME COLUMN url TO file_path;