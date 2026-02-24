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
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}
