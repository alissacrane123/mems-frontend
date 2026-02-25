export interface Board {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  role: string;
  memberCount: number;
  createdAt?: string;
}

export interface Entry {
  id: string;
  content: string;
  createdAt: string;
  location: string | null;
  userId: string;
  createdByName: string;
  photos: string[];
}

export interface BoardInfo {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

export interface Note {
  id: string;
  userId: string;
  folderId: string | null;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  userId: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}
