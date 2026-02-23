export interface Board {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  role: string;
  member_count: number;
  created_at?: string;
}

export interface Entry {
  id: string;
  content: string;
  created_at: string;
  location: string | null;
  user_id: string;
  created_by_name: string;
  photos: string[];
}

export interface BoardInfo {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
}
