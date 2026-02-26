const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Converts camelCase string to snake_case
function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Recursively converts all keys in an object or array to snake_case
function snakelizeKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakelizeKeys);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toSnake(key),
        snakelizeKeys(value),
      ])
    );
  }
  return obj;
}


// Converts snake_case string to camelCase
function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Recursively converts all keys in an object or array to camelCase
function camelizeKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelizeKeys);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamel(key),
        camelizeKeys(value),
      ])
    );
  }
  return obj;
}

// Base fetch wrapper that automatically includes credentials (cookies)
// and sets Content-Type header
async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Automatically convert request body keys to snake_case
    body: options.body 
      ? JSON.stringify(snakelizeKeys(JSON.parse(options.body as string))) 
      : undefined,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Something went wrong");
  }

  const data = await res.json();
  // Automatically convert response keys to camelCase
  return camelizeKeys(data);
}

// Auth
export const signup = (data: { email: string; password: string; first_name?: string; last_name?: string }) =>
  apiFetch("/api/auth/signup", { method: "POST", body: JSON.stringify(data) });

export const signin = (data: { email: string; password: string }) =>
  apiFetch("/api/auth/signin", { method: "POST", body: JSON.stringify(data) });

export const signout = () =>
  apiFetch("/api/auth/signout", { method: "POST" });

export const getSession = () =>
  apiFetch("/api/auth/session");

// Users
export const getMe = () =>
  apiFetch("/api/users/me");

export const lookupByEmail = (email: string) =>
  apiFetch("/api/users/lookup-by-email", { method: "POST", body: JSON.stringify({ email }) });

// Boards
export const getBoards = () =>
  apiFetch("/api/boards");

export const createBoard = (data: { name: string; description?: string }) =>
  apiFetch("/api/boards", { method: "POST", body: JSON.stringify(data) });

export const getBoard = (id: string) =>
  apiFetch(`/api/boards/${id}`);

export const deleteBoard = (id: string) =>
  apiFetch(`/api/boards/${id}`, { method: "DELETE" });

export const getBoardByInviteCode = (code: string) =>
  apiFetch(`/api/boards/invite/${code}`);

// Board Members
export const getBoardMembers = (boardId: string) =>
  apiFetch(`/api/boards/${boardId}/members`);

export const getBoardMemberCount = (boardId: string) =>
  apiFetch(`/api/boards/${boardId}/members/count`);

export const joinBoard = (boardId: string, userId: string) =>
  apiFetch(`/api/boards/${boardId}/members`, { method: "POST", body: JSON.stringify({ user_id: userId, role: "member" }) });

export const checkIsMember = (boardId: string, userId: string) =>
  apiFetch(`/api/boards/${boardId}/members/check?user_id=${userId}`);

// Entries
export const getEntries = (boardId: string) =>
  apiFetch(`/api/boards/${boardId}/entries`);

export const createEntry = (boardId: string, data: { content: string; location?: string; createdAt?: string }) =>
  apiFetch(`/api/boards/${boardId}/entries`, { method: "POST", body: JSON.stringify(data) });

export const deleteEntry = (entryId: string) =>
  apiFetch(`/api/entries/${entryId}`, { method: "DELETE" });

// Photos
export const uploadPhoto = (entryId: string, file: File, displayOrder: number) => {
  const form = new FormData();
  form.append("file", file);
  form.append("display_order", String(displayOrder));

  // Note: don't set Content-Type here — the browser sets it automatically
  // with the correct multipart boundary for FormData
  return fetch(`${API_URL}/api/entries/${entryId}/photos`, {
    method: "POST",
    credentials: "include",
    body: form,
  }).then(res => res.json());
};

// Notifications
export const getNotifications = () =>
  apiFetch("/api/notifications");

export const createNotification = (data: { user_id: string; type: string; data: object }) =>
  apiFetch("/api/notifications", { method: "POST", body: JSON.stringify(data) });

export const markAsRead = (id: string) =>
  apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });

export const markAllAsRead = () =>
  apiFetch("/api/notifications/read-all", { method: "PATCH" });

export const acceptInvite = (id: string, boardId: string) =>
  apiFetch(`/api/notifications/${id}/accept`, { method: "POST", body: JSON.stringify({ board_id: boardId }) });

export const declineInvite = (id: string) =>
  apiFetch(`/api/notifications/${id}/decline`, { method: "POST" });

export const checkInvite = (userId: string, boardId: string) =>
  apiFetch(`/api/notifications/check-invite?user_id=${userId}&board_id=${boardId}`);

// Notes
export const getNotes = (folderId?: string) =>
  apiFetch(`/api/notes${folderId ? `?folder_id=${folderId}` : ""}`);

export const getNote = (id: string) =>
  apiFetch(`/api/notes/${id}`);

export const createNote = (data: { title?: string; folderId?: string }) =>
  apiFetch("/api/notes", { method: "POST", body: JSON.stringify(data) });

export const updateNote = (id: string, data: { title?: string; content?: string; folderId?: string }) =>
  apiFetch(`/api/notes/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteNote = (id: string) =>
  apiFetch(`/api/notes/${id}`, { method: "DELETE" });

// Folders
export const getFolders = (parentId?: string) =>
  apiFetch(`/api/folders${parentId ? `?parent_id=${parentId}` : ""}`);

export const getFolder = (id: string) =>
  apiFetch(`/api/folders/${id}`);

export const createFolder = (data: { name: string; parentId?: string }) =>
  apiFetch("/api/folders", { method: "POST", body: JSON.stringify(data) });

export const updateFolder = (id: string, data: { name?: string; parentId?: string }) =>
  apiFetch(`/api/folders/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteFolder = (id: string, mode: "delete" | "move-up" = "delete") =>
  apiFetch(`/api/folders/${id}?mode=${mode}`, { method: "DELETE" });