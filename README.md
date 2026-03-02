# Mems

A family memory journal app for capturing, preserving, and sharing memories with the people who matter most. Create shared boards, add entries with photos and locations, organize notes, and invite family members to contribute.

## Tech Stack


- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS v4
- **Data Fetching:** TanStack React Query v5
- **Auth:** Cookie-based authentication via backend API

## Features

- **Boards** — Create shared memory boards, invite family members via invite codes, and browse entries on a timeline
- **Entries** — Add memories with text, photos (JPEG, PNG, GIF, WebP), location, and date
- **Notes** — Rich-text notes with folder organization and auto-save
- **Notifications** — Board invites, new memory alerts, and member join notifications
- **Theming** — Light and dark mode with persistent preference

## Getting Started

### Prerequisites

- Node.js 18+
- A running instance of the [Mems backend API](https://github.com/)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   Set this to the URL where your backend API is running.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start the development server |
| `build` | `next build` | Create a production build |
| `start` | `next start` | Serve the production build |
| `lint` | `eslint` | Run ESLint |

## Project Structure

```
src/
├── app/                  # Pages (Next.js App Router)
│   ├── auth/             # Sign in / sign up
│   ├── boards/           # Board list and board detail pages
│   ├── notes/            # Notes list, editor, and folder views
│   └── invite/           # Invite acceptance flow
├── components/           # Reusable UI components
│   ├── boards/           # Board and entry components
│   └── notes/            # Note and folder components
├── contexts/             # React context (Auth, Theme, Notifications)
├── hooks/                # Custom hooks (useBoards, useEntries, etc.)
├── lib/                  # API client, utilities, constants
├── providers/            # TanStack Query provider
└── types/                # TypeScript type definitions
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — boards and notes overview |
| `/auth` | Sign in / sign up |
| `/boards` | All boards |
| `/boards/[id]` | Board detail with timeline and entries |
| `/notes` | All notes |
| `/notes/[id]` | Note editor |
| `/notes/folder/[folderId]` | Notes within a folder |
| `/invite/[code]` | Accept a board invite |
