# Mems Backend API Specification

## Database Schema

### 1. `profiles`

| Field        | Type           | Constraints                                         |
| ------------ | -------------- | --------------------------------------------------- |
| `id`         | `UUID`         | PRIMARY KEY, FK → `auth.users(id)` ON DELETE CASCADE |
| `first_name` | `VARCHAR(100)` | nullable                                            |
| `last_name`  | `VARCHAR(100)` | nullable                                            |
| `created_at` | `TIMESTAMPTZ`  | DEFAULT NOW()                                       |
| `updated_at` | `TIMESTAMPTZ`  | DEFAULT NOW()                                       |

---

### 2. `boards`

| Field         | Type           | Constraints                                                                  |
| ------------- | -------------- | ---------------------------------------------------------------------------- |
| `id`          | `UUID`         | PRIMARY KEY, DEFAULT gen_random_uuid()                                       |
| `name`        | `VARCHAR(255)` | NOT NULL                                                                     |
| `description` | `TEXT`         | nullable                                                                     |
| `invite_code` | `VARCHAR(50)`  | UNIQUE, NOT NULL, DEFAULT encode(gen_random_bytes(8), 'base64url')           |
| `created_by`  | `UUID`         | FK → `auth.users(id)` ON DELETE CASCADE                                      |
| `created_at`  | `TIMESTAMPTZ`  | DEFAULT NOW()                                                                |
| `updated_at`  | `TIMESTAMPTZ`  | DEFAULT NOW()                                                                |

---

### 3. `board_members`

| Field      | Type          | Constraints                                                     |
| ---------- | ------------- | --------------------------------------------------------------- |
| `id`       | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid()                          |
| `board_id` | `UUID`        | FK → `boards(id)` ON DELETE CASCADE                             |
| `user_id`  | `UUID`        | FK → `auth.users(id)` ON DELETE CASCADE                         |
| `role`     | `VARCHAR(20)` | NOT NULL, CHECK: `'owner'` \| `'admin'` \| `'member'`          |
| `joined_at`| `TIMESTAMPTZ` | DEFAULT NOW()                                                   |

> UNIQUE constraint on `(board_id, user_id)`

---

### 4. `entries`

| Field        | Type          | Constraints                                          |
| ------------ | ------------- | ---------------------------------------------------- |
| `id`         | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid()               |
| `user_id`    | `UUID`        | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE      |
| `board_id`   | `UUID`        | NOT NULL, FK → `boards(id)` ON DELETE CASCADE        |
| `content`    | `TEXT`        | NOT NULL                                             |
| `location`   | `TEXT`        | nullable                                             |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW()                                        |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW()                                        |

---

### 5. `photos`

| Field           | Type          | Constraints                                    |
| --------------- | ------------- | ---------------------------------------------- |
| `id`            | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid()         |
| `entry_id`      | `UUID`        | FK → `entries(id)` ON DELETE CASCADE           |
| `file_path`     | `TEXT`        | NOT NULL                                       |
| `display_order` | `INTEGER`     | DEFAULT 0                                      |
| `created_at`    | `TIMESTAMPTZ` | DEFAULT NOW()                                  |

---

### 6. `notifications`

| Field        | Type          | Constraints                                                                                          |
| ------------ | ------------- | ---------------------------------------------------------------------------------------------------- |
| `id`         | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid()                                                               |
| `user_id`    | `UUID`        | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE                                                    |
| `type`       | `VARCHAR(50)` | NOT NULL, CHECK: `'board_invitation'` \| `'new_memory'` \| `'user_joined'` \| `'comment'` \| `'mention'` |
| `is_read`    | `BOOLEAN`     | NOT NULL, DEFAULT FALSE                                                                              |
| `data`       | `JSONB`       | NOT NULL, validated by type-specific CHECK constraints (see below)                                   |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW()                                                                                        |

#### Required `data` JSONB keys by notification type

| Type               | Required keys                                                    |
| ------------------ | ---------------------------------------------------------------- |
| `board_invitation` | `board_id`, `board_name`, `invited_by_id`, `invited_by_email`    |
| `new_memory`       | `board_id`, `board_name`, `entry_id`, `created_by_id`, `created_by_email` |
| `user_joined`      | `board_id`, `board_name`, `user_id`, `user_email`                |
| `comment`          | no CHECK constraint defined                                      |
| `mention`          | no CHECK constraint defined                                      |

---

### Storage Bucket: `memory-photos`

- **Type:** Public bucket
- **File path pattern:** `{user_id}/{entry_id}/{timestamp}_{index}.{ext}`
- **Max file size:** 10 MB
- **Max files per entry:** 10

---

## API Endpoints

### Auth (4 endpoints)

#### `POST /api/auth/signup`

Register a new user. Must also create a `profiles` row.

- **Request body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "first_name": "string (optional)",
    "last_name": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "user": { "id": "uuid", "email": "string" },
    "session": { ... },
    "token": "string"
  }
  ```

#### `POST /api/auth/signin`

Sign in with email and password.

- **Request body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "user": { "id": "uuid", "email": "string" },
    "session": { ... },
    "token": "string"
  }
  ```

#### `POST /api/auth/signout`

Sign out and invalidate the session.

- **Request:** Auth header required
- **Response:**
  ```json
  { "success": true }
  ```

#### `GET /api/auth/session`

Get the current authenticated user and session info.

- **Request:** Auth header required
- **Response:**
  ```json
  {
    "user": { "id": "uuid", "email": "string" },
    "session": { ... }
  }
  ```

---

### Users (2 endpoints)

#### `POST /api/users/lookup-by-email`

Look up a user ID by their email address.

- **Request body:**
  ```json
  { "email": "string" }
  ```
- **Response:**
  ```json
  { "success": true, "exists": true, "userId": "uuid" }
  ```
  or
  ```json
  { "success": true, "exists": false }
  ```

#### `GET /api/users/me`

Get the current user's profile.

- **Request:** Auth header required
- **Response:**
  ```json
  { "id": "uuid", "email": "string", "first_name": "string", "last_name": "string" }
  ```

---

### Boards (4 endpoints)

#### `GET /api/boards`

List all boards the authenticated user is a member of.

- **Request:** Auth header required
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "invite_code": "string",
      "role": "owner | admin | member",
      "member_count": 3
    }
  ]
  ```

#### `POST /api/boards`

Create a new board. Must also insert a `board_members` row with `role: 'owner'` for the creator.

- **Request body:**
  ```json
  {
    "name": "string",
    "description": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string | null",
    "invite_code": "string",
    "created_by": "uuid"
  }
  ```

#### `GET /api/boards/:id`

Get a specific board. User must be a member.

- **Path params:** `id` (UUID)
- **Response:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string | null",
    "invite_code": "string",
    "role": "owner | admin | member",
    "member_count": 3
  }
  ```

#### `GET /api/boards/invite/:code`

Look up a board by its invite code. Returns public info (no auth required to view, but auth required to join).

- **Path params:** `code` (string)
- **Response:**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string | null",
    "member_count": 3
  }
  ```

---

### Board Members (4 endpoints)

#### `GET /api/boards/:id/members`

List all members of a board.

- **Path params:** `id` (board UUID)
- **Response:**
  ```json
  [
    { "id": "uuid", "user_id": "uuid", "role": "string", "joined_at": "timestamp" }
  ]
  ```

#### `GET /api/boards/:id/members/count`

Get the member count for a board.

- **Path params:** `id` (board UUID)
- **Response:**
  ```json
  { "count": 3 }
  ```

#### `POST /api/boards/:id/members`

Join a board (used when accepting invites or joining via invite code).

- **Path params:** `id` (board UUID)
- **Request body:**
  ```json
  { "user_id": "uuid", "role": "member" }
  ```
- **Response:**
  ```json
  { "success": true }
  ```

#### `GET /api/boards/:id/members/check`

Check if a user is already a member of a board.

- **Path params:** `id` (board UUID)
- **Query params:** `user_id` (UUID)
- **Response:**
  ```json
  { "is_member": true }
  ```

---

### Entries (2 endpoints)

#### `GET /api/boards/:boardId/entries`

Get all entries for a board, including photos and author name. Ordered by `created_at DESC`. User must be a board member.

- **Path params:** `boardId` (UUID)
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "content": "string",
      "created_at": "timestamp",
      "location": "string | null",
      "user_id": "uuid",
      "created_by_name": "string",
      "photos": ["https://...public_url1", "https://...public_url2"]
    }
  ]
  ```

#### `POST /api/boards/:boardId/entries`

Create a new memory entry. User must be a board member.

- **Path params:** `boardId` (UUID)
- **Request body:**
  ```json
  {
    "content": "string",
    "location": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "id": "uuid",
    "board_id": "uuid",
    "user_id": "uuid",
    "content": "string",
    "location": "string | null",
    "created_at": "timestamp"
  }
  ```

---

### Photos (2 endpoints)

#### `POST /api/entries/:entryId/photos`

Upload a photo file and create a `photos` record. Stores to object storage at `{user_id}/{entry_id}/{timestamp}_{index}.{ext}`.

- **Path params:** `entryId` (UUID)
- **Request:** `multipart/form-data` with `file` and `display_order` fields
- **Response:**
  ```json
  {
    "id": "uuid",
    "entry_id": "uuid",
    "file_path": "string",
    "public_url": "string"
  }
  ```

#### `GET /api/photos/:filePath`

Get the public URL for a stored photo.

- **Path/query params:** `filePath` (string)
- **Response:**
  ```json
  { "public_url": "string" }
  ```

---

### Notifications (7 endpoints)

#### `GET /api/notifications`

Get the current user's notifications (limit 50, newest first).

- **Request:** Auth header required
- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "type": "board_invitation | new_memory | user_joined | comment | mention",
      "is_read": false,
      "created_at": "timestamp",
      "data": { ... }
    }
  ]
  ```

#### `POST /api/notifications`

Create a notification for a user (e.g., board invitation).

- **Request body:**
  ```json
  {
    "user_id": "uuid",
    "type": "board_invitation",
    "data": {
      "board_id": "uuid",
      "board_name": "string",
      "invited_by_id": "uuid",
      "invited_by_email": "string"
    }
  }
  ```
- **Response:**
  ```json
  { "id": "uuid", "type": "string", "created_at": "timestamp" }
  ```

#### `PATCH /api/notifications/:id/read`

Mark a single notification as read.

- **Path params:** `id` (UUID)
- **Response:**
  ```json
  { "success": true }
  ```

#### `PATCH /api/notifications/read-all`

Mark all of the current user's unread notifications as read.

- **Request:** Auth header required
- **Response:**
  ```json
  { "success": true }
  ```

#### `POST /api/notifications/:id/accept`

Accept a board invitation. Marks the notification as read and adds the user to the board as a member.

- **Path params:** `id` (notification UUID)
- **Request body:**
  ```json
  { "board_id": "uuid" }
  ```
- **Response:**
  ```json
  { "success": true }
  ```

#### `POST /api/notifications/:id/decline`

Decline a board invitation. Marks the notification as read.

- **Path params:** `id` (notification UUID)
- **Response:**
  ```json
  { "success": true }
  ```

#### `GET /api/notifications/check-invite`

Check if a pending (unread) board invitation already exists for a user.

- **Query params:** `user_id` (UUID), `board_id` (UUID)
- **Response:**
  ```json
  { "exists": true }
  ```

---

## Authorization Summary

All endpoints except `POST /api/auth/signup`, `POST /api/auth/signin`, and `GET /api/boards/invite/:code` require authentication via a Bearer token in the `Authorization` header.

| Resource       | Rule                                                                 |
| -------------- | -------------------------------------------------------------------- |
| Boards         | Users can only access boards they are a member of                    |
| Entries        | Only board members can read/write entries for that board             |
| Photos         | Only board members can view; users can only upload to their own path |
| Notifications  | Users can only read/update their own; any authed user can create     |
| Profiles       | Readable by all authenticated users; writable only by the owner      |
| Board Members  | Viewable by fellow board members; self-join via invite               |

---

## Server-Side Logic (replaces Supabase triggers/functions)

1. **On signup:** Insert a `profiles` row with `first_name` and `last_name` (falls back to email prefix for `first_name`).
2. **On board creation:** Insert a `board_members` row with `role: 'owner'` for the creator.
3. **On invite accept:** Check existing membership, then insert `board_members` with `role: 'member'`.
4. **Invite code generation:** Generate a URL-safe random string (e.g., `base64url(random 8 bytes)`) when creating a board.

---

## Endpoint Summary (25 total)

```
POST   /api/auth/signup
POST   /api/auth/signin
POST   /api/auth/signout
GET    /api/auth/session

POST   /api/users/lookup-by-email
GET    /api/users/me

GET    /api/boards
POST   /api/boards
GET    /api/boards/:id
GET    /api/boards/invite/:code

GET    /api/boards/:id/members
GET    /api/boards/:id/members/count
POST   /api/boards/:id/members
GET    /api/boards/:id/members/check

GET    /api/boards/:boardId/entries
POST   /api/boards/:boardId/entries

POST   /api/entries/:entryId/photos
GET    /api/photos/:filePath

GET    /api/notifications
POST   /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
POST   /api/notifications/:id/accept
POST   /api/notifications/:id/decline
GET    /api/notifications/check-invite
```
