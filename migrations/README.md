# Database Migrations

This folder contains all SQL migrations for the Mems family journal application, organized chronologically.

## Migration Naming Convention

Migrations are named using the following pattern:
`{sequence}_{timestamp}_{description}.sql`

Where:
- `sequence`: 3-digit sequence number (001, 002, 003, etc.)
- `timestamp`: Date and time in YYYYMMDDHH format
- `description`: Short description of what the migration does

## Migration History

### 001_2024120300_create_initial_schema.sql
- **Date**: 2024-12-03 00:00:00
- **Description**: Creates the initial database schema including `entries` and `photos` tables with basic RLS policies
- **Tables Created**: `entries`, `photos`
- **Features**: Basic user-scoped data access with Row Level Security

### 002_2024120301_rename_photo_url_column.sql
- **Date**: 2024-12-03 01:00:00
- **Description**: Renames the `url` column to `file_path` in the photos table for better semantic clarity
- **Changes**: Column rename for improved naming convention

### 003_2024120302_implement_board_system.sql
- **Date**: 2024-12-03 02:00:00
- **Description**: Implements the complete board system for family collaboration
- **Tables Created**: `boards`, `board_members`
- **Tables Modified**: `entries` (added `board_id` column)
- **Features**:
  - Family board creation with invite codes
  - Role-based permissions (owner/admin/member)
  - Board-scoped data access with comprehensive RLS policies
  - Automatic board creator assignment as owner
  - Performance indexes

## Running Migrations

These migrations should be run in order against your Supabase database. You can:

1. Copy and paste the SQL from each file into the Supabase SQL Editor
2. Run them in sequence (001, 002, 003, etc.)
3. Or use a migration tool that supports PostgreSQL

## Notes

- All migrations include comprehensive Row Level Security (RLS) policies
- The board system enables secure multi-user collaboration
- Indexes are included for optimal performance
- Foreign key constraints ensure data integrity