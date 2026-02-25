# Mems Backend API Specification

> Reflects the actual Go backend implementation at `~/Desktop/mems-backend`.

## Tech Stack

- **Language:** Go
- **Router:** [chi](https://github.com/go-chi/chi) v5
- **Database:** PostgreSQL via [pgx](https://github.com/jackc/pgx) v5 (connection pool)
- **Auth:** JWT (HMAC-SHA256) stored in HttpOnly cookie, 7-day expiry
- **Password hashing:** bcrypt (`golang.org/x/crypto`)
- **File storage:** Local filesystem (`./uploads/`)
- **CORS:** `go-chi/cors`

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://localhost:5432/mems?sslmode=disable` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-secret-key` |
| `UPLOADS_PATH` | Directory for photo uploads | `./uploads` |
| `PUBLIC_URL` | Base URL for serving uploaded files | `http://localhost:8080` |
| `FRONTEND_URL` | Frontend origin (for CORS) | `http://localhost:3000` |

---

## Database Schema (9 tables)

### 1. `users`

| Field           | Type          | Constraints                            |
| --------------- | ------------- | -------------------------------------- |
| `id`            | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `email`         | `TEXT`        | UNIQUE, NOT NULL                       |
| `password_hash` | `TEXT`        | NOT NULL                               |
| `created_at`    | `TIMESTAMPTZ` | DEFAULT NOW()                          |

### 2. `profiles`

| Field        | Type           | Constraints                                    |
| ------------ | -------------- | ---------------------------------------------- |
| `id`         | `UUID`         | PRIMARY KEY, FK → `users(id)` ON DELETE CASCADE |
| `first_name` | `VARCHAR(100)` | nullable                                       |
| `last_name`  | `VARCHAR(100)` | nullable                                       |
| `created_at` | `TIMESTAMPTZ`  | DEFAULT NOW()                                  |
| `updated_at` | `TIMESTAMPTZ`  | DEFAULT NOW()                                  |

### 3. `boards`

| Field         | Type           | Constraints                                        |
| ------------- | -------------- | -------------------------------------------------- |
| `id`          | `UUID`         | PRIMARY KEY, DEFAULT gen_random_uuid()             |
| `name`        | `VARCHAR(255)` | NOT NULL                                           |
| `description` | `TEXT`         | nullable                                           |
| `invite_code` | `VARCHAR(50)`  | UNIQUE, NOT NULL                                   |
| `created_by`  | `UUID`         | FK → `users(id)`                                   |
| `created_at`  | `TIMESTAMPTZ`  | DEFAULT NOW()                                      |
| `updated_at`  | `TIMESTAMPTZ`  | DEFAULT NOW()                                      |

### 4. `board_members`

| Field      | Type          | Constraints                                                |
| ---------- | ------------- | ---------------------------------------------------------- |
| `id`       | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid()                     |
| `board_id` | `UUID`        | FK → `boards(id)` ON DELETE CASCADE                        |
| `user_id`  | `UUID`        | NOT NULL                                                   |
| `role`     | `VARCHAR(20)` | NOT NULL, CHECK: `'owner'` \| `'admin'` \| `'member'`     |
| `joined_at`| `TIMESTAMPTZ` | DEFAULT NOW()                                              |

> UNIQUE constraint on `(board_id, user_id)`

### 5. `entries`

| Field        | Type          | Constraints                                         |
| ------------ | ------------- | --------------------------------------------------- |
| `id`         | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid()              |
| `user_id`    | `UUID`        | FK → `profiles(id)` ON DELETE CASCADE               |
| `board_id`   | `UUID`        | FK → `boards(id)` ON DELETE CASCADE                 |
| `content`    | `TEXT`        | NOT NULL                                            |
| `location`   | `TEXT`        | nullable                                            |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW()                                       |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW()                                       |

### 6. `photos`

| Field           | Type          | Constraints                                    |
| --------------- | ------------- | ---------------------------------------------- |
| `id`            | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid()         |
| `entry_id`      | `UUID`        | FK → `entries(id)` ON DELETE CASCADE           |
| `file_path`     | `TEXT`        | NOT NULL                                       |
| `display_order` | `INTEGER`     | DEFAULT 0                                      |
| `created_at`    | `TIMESTAMPTZ` | DEFAULT NOW()                                  |

### 7. `notifications`

| Field        | Type          | Constraints                                                                                          |
| ------------ | ------------- | ---------------------------------------------------------------------------------------------------- |
| `id`         | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid()                                                               |
| `user_id`    | `UUID`        | NOT NULL                                                                                             |
| `type`       | `VARCHAR(50)` | NOT NULL, CHECK: `'board_invitation'` \| `'new_memory'` \| `'user_joined'` \| `'comment'` \| `'mention'` |
| `is_read`    | `BOOLEAN`     | NOT NULL, DEFAULT FALSE                                                                              |
| `data`       | `JSONB`       | NOT NULL                                                                                             |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW()                                                                                        |

#### Required `data` JSONB keys by notification type

| Type               | Required keys                                                    |
| ------------------ | ---------------------------------------------------------------- |
| `board_invitation` | `board_id`, `board_name`, `invited_by_id`, `invited_by_email`    |
| `new_memory`       | `board_id`, `board_name`, `entry_id`, `created_by_id`, `created_by_email` |
| `user_joined`      | `board_id`, `board_name`, `user_id`, `user_email`                |
| `comment`          | no constraint defined                                            |
| `mention`          | no constraint defined                                            |

### 8. `notes`

| Field        | Type          | Constraints                                         |
| ------------ | ------------- | --------------------------------------------------- |
| `id`         | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid()              |
| `user_id`    | `UUID`        | FK → `users(id)` ON DELETE CASCADE, NOT NULL        |
| `folder_id`  | `UUID`        | FK → `folders(id)` ON DELETE SET NULL, nullable     |
| `title`      | `TEXT`        | NOT NULL, DEFAULT 'Untitled Note'                   |
| `content`    | `TEXT`        | nullable                                            |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW()                             |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW()                             |

> Index on `user_id`. Has `BEFORE UPDATE` trigger to auto-set `updated_at = now()`.

### 9. `folders`

| Field        | Type          | Constraints                                         |
| ------------ | ------------- | --------------------------------------------------- |
| `id`         | `UUID`        | PRIMARY KEY, DEFAULT gen_random_uuid()              |
| `user_id`    | `UUID`        | FK → `users(id)` ON DELETE CASCADE, NOT NULL        |
| `parent_id`  | `UUID`        | FK → `folders(id)` ON DELETE CASCADE, nullable      |
| `name`       | `TEXT`        | NOT NULL                                            |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW()                             |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW()                             |

> `parent_id = NULL` means root-level folder. Supports unlimited nesting. Has `BEFORE UPDATE` trigger to auto-set `updated_at = now()`.

---

## File Storage

- **Type:** Local filesystem
- **Base path:** `UPLOADS_PATH` env var (default: `./uploads`)
- **File path pattern:** `{user_id}/{entry_id}/{timestamp}{ext}`
- **Max file size:** 10 MB
- **Served at:** `GET /uploads/*` (static file server)
- **Public URL format:** `{PUBLIC_URL}/uploads/{file_path}`

---

## Authentication

- JWT token signed with HMAC-SHA256 using `JWT_SECRET`
- Token claims: `user_id`, `email`, standard JWT fields
- Token expiry: 7 days
- Token stored in an HttpOnly cookie named `token`:
  - `HttpOnly: true`
  - `Secure: false` (set to `true` in production)
  - `SameSite: Lax`
  - `MaxAge: 7 days`
  - `Path: /`
- Frontend sends credentials automatically via `credentials: "include"` on fetch calls
- Auth middleware reads the `token` cookie, validates it, and injects `user_id` / `email` into the request context

---

## Middleware

| Middleware | Scope | Description |
|---|---|---|
| CORS | Global | Allows `FRONTEND_URL` origin, credentials, common methods/headers |
| RequireAuth | Protected routes | Validates JWT cookie, rejects with 401 if missing/invalid |

---

## API Endpoints

### Health (1 endpoint)

#### `GET /api/health`

Health check. **Public.**

- **Response:**
  ```json
  { "status": "ok" }
  ```

---

### Auth (4 endpoints)

#### `POST /api/auth/signup`

Register a new user. Creates rows in both `users` and `profiles`. Sets auth cookie. **Public.**

- **Request body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "first_name": "string",
    "last_name": "string"
  }
  ```
- **Response:** Sets HttpOnly `token` cookie.
  ```json
  {
    "user": { "id": "uuid", "email": "string" }
  }
  ```

#### `POST /api/auth/signin`

Sign in with email and password. Sets auth cookie. **Public.**

- **Request body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** Sets HttpOnly `token` cookie.
  ```json
  {
    "user": { "id": "uuid", "email": "string" }
  }
  ```

#### `POST /api/auth/signout`

Sign out. Clears auth cookie. **Protected.**

- **Response:** Clears `token` cookie.
  ```json
  { "success": true }
  ```

#### `GET /api/auth/session`

Get current session info from cookie. **Protected.**

- **Response:**
  ```json
  {
    "user": { "id": "uuid", "email": "string" },
    "expires_at": "timestamp"
  }
  ```

---

### Users (2 endpoints)

#### `GET /api/users/me`

Get the current user's profile. **Protected.**

- **Response:**
  ```json
  { "id": "uuid", "email": "string", "first_name": "string", "last_name": "string" }
  ```

#### `POST /api/users/lookup-by-email`

Find a user ID by email address. **Protected.**

- **Request body:**
  ```json
  { "email": "string" }
  ```
- **Response (found):**
  ```json
  { "success": true, "exists": true, "userId": "uuid" }
  ```
- **Response (not found):**
  ```json
  { "success": true, "exists": false }
  ```

---

### Boards (4 endpoints)

#### `GET /api/boards`

List all boards the authenticated user is a member of. **Protected.**

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

Create a new board. Auto-generates invite code and adds creator as owner in `board_members`. **Protected.**

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

#### `GET /api/boards/{id}`

Get a specific board. User must be a member. **Protected.**

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

#### `GET /api/boards/invite/{code}`

Look up a board by its invite code. **Public.**

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

#### `GET /api/boards/{id}/members`

List all members of a board. **Protected.**

- **Path params:** `id` (board UUID)
- **Response:**
  ```json
  [
    { "id": "uuid", "user_id": "uuid", "role": "string", "joined_at": "timestamp" }
  ]
  ```

#### `GET /api/boards/{id}/members/count`

Get the member count for a board. **Protected.**

- **Path params:** `id` (board UUID)
- **Response:**
  ```json
  { "count": 3 }
  ```

#### `POST /api/boards/{id}/members`

Add a member to a board. **Protected.**

- **Path params:** `id` (board UUID)
- **Request body:**
  ```json
  { "user_id": "uuid", "role": "member" }
  ```
- **Response:**
  ```json
  { "id": "uuid", "user_id": "uuid", "role": "string", "joined_at": "timestamp" }
  ```

#### `GET /api/boards/{id}/members/check`

Check if a user is already a member of a board. **Protected.**

- **Path params:** `id` (board UUID)
- **Query params:** `user_id` (UUID)
- **Response:**
  ```json
  { "is_member": true }
  ```

---

### Entries (2 endpoints)

#### `GET /api/boards/{boardId}/entries`

Get all entries for a board, including photos and author name. Ordered by `created_at DESC`. **Protected.**

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
      "photos": ["http://localhost:8080/uploads/...", "..."]
    }
  ]
  ```

#### `POST /api/boards/{boardId}/entries`

Create a new memory entry. **Protected.**

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

### Photos (2 endpoints + static serving)

#### `POST /api/entries/{entryId}/photos`

Upload a photo file and create a `photos` record. **Protected.**

- **Path params:** `entryId` (UUID)
- **Request:** `multipart/form-data` with `file` field and optional `display_order` field
- **Max file size:** 10 MB
- **Storage path:** `{UPLOADS_PATH}/{user_id}/{entry_id}/{timestamp}{ext}`
- **Response:**
  ```json
  {
    "id": "uuid",
    "entry_id": "uuid",
    "file_path": "string",
    "public_url": "string"
  }
  ```

#### `GET /api/photos`

Get the public URL for a stored photo. **Protected.**

- **Query params:** `filePath` (string)
- **Response:**
  ```json
  { "public_url": "string" }
  ```

#### `GET /uploads/*`

Static file server for uploaded photos. **Public.** Serves files from the `UPLOADS_PATH` directory.

---

### Notifications (7 endpoints)

#### `GET /api/notifications`

Get the current user's notifications (limit 50, newest first). **Protected.**

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

Create a notification for a user. **Protected.**

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

#### `PATCH /api/notifications/{id}/read`

Mark a single notification as read. **Protected.**

- **Path params:** `id` (UUID)
- **Response:**
  ```json
  { "success": true }
  ```

#### `PATCH /api/notifications/read-all`

Mark all of the current user's unread notifications as read. **Protected.**

- **Response:**
  ```json
  { "success": true }
  ```

#### `POST /api/notifications/{id}/accept`

Accept a board invitation. Marks notification as read and adds user to board as member. **Protected.**

- **Path params:** `id` (notification UUID)
- **Request body:**
  ```json
  { "board_id": "uuid" }
  ```
- **Response:**
  ```json
  { "success": true }
  ```

#### `POST /api/notifications/{id}/decline`

Decline a board invitation. Marks notification as read. **Protected.**

- **Path params:** `id` (notification UUID)
- **Response:**
  ```json
  { "success": true }
  ```

#### `GET /api/notifications/check-invite`

Check if a pending (unread) board invitation already exists for a user. **Protected.**

- **Query params:** `user_id` (UUID), `board_id` (UUID)
- **Response:**
  ```json
  { "exists": true }
  ```

### Notes (5 endpoints)

#### `GET /api/notes`

Get all notes for the current user, ordered by `updated_at DESC`. Includes `folder_id` if note is in a folder. **Protected.**

- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "user_id": "uuid",
      "folder_id": "uuid | null",
      "title": "string",
      "content": "string | null",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```

#### `POST /api/notes`

Create a new note for the current user. **Protected.**

- **Request body:**
  ```json
  {
    "title": "string (optional, defaults to 'Untitled Note')",
    "content": "string (optional)",
    "folder_id": "uuid (optional)"
  }
  ```
- **Response:**
  ```json
  { "id": "uuid", "user_id": "uuid", "folder_id": "uuid | null", "title": "string", "content": null, "created_at": "timestamp", "updated_at": "timestamp" }
  ```

#### `GET /api/notes/{id}`

Get a single note by ID. Returns 404 if not found or not owned by user. **Protected.**

- **Path params:** `id` (UUID)
- **Response:**
  ```json
  { "id": "uuid", "user_id": "uuid", "folder_id": "uuid | null", "title": "string", "content": "string | null", "created_at": "timestamp", "updated_at": "timestamp" }
  ```

#### `PATCH /api/notes/{id}`

Update a note. Uses COALESCE so only provided fields are updated. The `updated_at` trigger fires automatically. **Protected.**

- **Path params:** `id` (UUID)
- **Request body:**
  ```json
  {
    "title": "string (optional)",
    "content": "string (optional)",
    "folder_id": "uuid (optional — move note to different folder)"
  }
  ```
- **Response:**
  ```json
  { "id": "uuid", "user_id": "uuid", "folder_id": "uuid | null", "title": "string", "content": "string", "created_at": "timestamp", "updated_at": "timestamp" }
  ```

#### `DELETE /api/notes/{id}`

Delete a note. Returns 404 if not found or not owned by user. **Protected.**

- **Path params:** `id` (UUID)
- **Response:**
  ```json
  { "success": true }
  ```

---

### Folders (5 endpoints)

Folders support unlimited nesting via `parent_id`. A `null` `parent_id` means the folder is at root level.

#### Deletion Modes

| Mode | Behavior |
| ---- | -------- |
| `mode=delete` (default) | Deletes folder + all subfolders + all notes recursively via CASCADE |
| `mode=move-up` | Moves all notes and subfolders to parent (or root if top-level), then deletes the empty folder. Uses recursive CTE to find all descendants. |

#### `GET /api/folders`

Get all folders for the current user as a flat list ordered by `name ASC`. Each folder includes `parent_id` so the frontend can build the tree structure. **Protected.**

- **Response:**
  ```json
  [
    {
      "id": "uuid",
      "user_id": "uuid",
      "parent_id": "uuid | null",
      "name": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
  ```

#### `POST /api/folders`

Create a new folder. **Protected.**

- **Request body:**
  ```json
  {
    "name": "string (required)",
    "parent_id": "uuid (optional — omit or null for root folder)"
  }
  ```
- **Response:**
  ```json
  { "id": "uuid", "user_id": "uuid", "parent_id": "uuid | null", "name": "string", "created_at": "timestamp", "updated_at": "timestamp" }
  ```

#### `GET /api/folders/{id}`

Get a folder with its direct subfolders and direct notes. Returns 404 if not found or not owned by user. **Protected.**

- **Path params:** `id` (UUID)
- **Response:**
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "parent_id": "uuid | null",
    "name": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "subfolders": [...],
    "notes": [...]
  }
  ```

#### `PATCH /api/folders/{id}`

Rename a folder or move it to a different parent. **Protected.**

- **Path params:** `id` (UUID)
- **Request body:**
  ```json
  {
    "name": "string (optional)",
    "parent_id": "uuid (optional — move to different parent)"
  }
  ```
- **Response:**
  ```json
  { "id": "uuid", "user_id": "uuid", "parent_id": "uuid | null", "name": "string", "created_at": "timestamp", "updated_at": "timestamp" }
  ```

#### `DELETE /api/folders/{id}?mode=delete|move-up`

Delete a folder. See deletion modes above. **Protected.**

- **Path params:** `id` (UUID)
- **Query params:** `mode` (`delete` or `move-up`, defaults to `delete`)
- **Response:**
  ```json
  { "success": true }
  ```

---

## Authorization Summary

Public endpoints (no auth required):
- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/boards/invite/{code}`
- `GET /uploads/*`

All other endpoints require a valid JWT in the `token` HttpOnly cookie.

| Resource       | Rule                                                                 |
| -------------- | -------------------------------------------------------------------- |
| Boards         | Users can only access boards they are a member of                    |
| Entries        | Only board members can read/write entries for that board             |
| Photos         | Only board members can view; users upload to their own path          |
| Notifications  | Users can only read/update their own; any authed user can create     |
| Profiles       | Readable by all authenticated users; writable only by the owner      |
| Board Members  | Viewable by fellow board members; self-join via invite               |
| Notes          | Users can only CRUD their own notes                                  |
| Folders        | Users can only CRUD their own folders                                |

---

## Server-Side Logic

1. **On signup:** Insert a `users` row (with bcrypt-hashed password) and a `profiles` row with `first_name` and `last_name`.
2. **On board creation:** Generate a random invite code, insert the board, then insert a `board_members` row with `role: 'owner'` for the creator.
3. **On invite accept:** Check existing membership, then insert `board_members` with `role: 'member'`, and mark the notification as read.
4. **Photo upload:** Save file to local filesystem at `{user_id}/{entry_id}/{timestamp}{ext}`, insert `photos` record, return public URL.
5. **Note update:** The `update_updated_at` trigger automatically sets `updated_at = now()` on every `UPDATE` to `notes`.
6. **Folder deletion (`mode=delete`):** CASCADE on `folders.parent_id` recursively deletes all subfolders; CASCADE on `notes.folder_id` sets it to NULL (notes are orphaned to root, not deleted).
7. **Folder deletion (`mode=move-up`):** Uses a recursive CTE to find all descendant notes and subfolders, moves them to the deleted folder's parent (or root), then deletes the folder.

---

## Endpoint Summary (37 total)

```
GET    /api/health                            (public)

POST   /api/auth/signup                       (public)
POST   /api/auth/signin                       (public)
POST   /api/auth/signout                      (protected)
GET    /api/auth/session                      (protected)

GET    /api/users/me                          (protected)
POST   /api/users/lookup-by-email             (protected)

GET    /api/boards                            (protected)
POST   /api/boards                            (protected)
GET    /api/boards/{id}                       (protected)
GET    /api/boards/invite/{code}              (public)

GET    /api/boards/{id}/members               (protected)
GET    /api/boards/{id}/members/count         (protected)
POST   /api/boards/{id}/members               (protected)
GET    /api/boards/{id}/members/check         (protected)

GET    /api/boards/{boardId}/entries           (protected)
POST   /api/boards/{boardId}/entries           (protected)

POST   /api/entries/{entryId}/photos           (protected)
GET    /api/photos                             (protected)
GET    /uploads/*                              (public, static)

GET    /api/notifications                      (protected)
POST   /api/notifications                      (protected)
PATCH  /api/notifications/{id}/read            (protected)
PATCH  /api/notifications/read-all             (protected)
POST   /api/notifications/{id}/accept          (protected)
POST   /api/notifications/{id}/decline         (protected)
GET    /api/notifications/check-invite         (protected)

GET    /api/notes                              (protected)
POST   /api/notes                              (protected)
GET    /api/notes/{id}                         (protected)
PATCH  /api/notes/{id}                         (protected)
DELETE /api/notes/{id}                         (protected)

GET    /api/folders                            (protected)
POST   /api/folders                            (protected)
GET    /api/folders/{id}                       (protected)
PATCH  /api/folders/{id}                       (protected)
DELETE /api/folders/{id}                       (protected)
```
