export interface Message {
  id: number;
  content: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface User {
  id: string;
  email?: string;
  username: string;
  avatar_url?: string;
}
