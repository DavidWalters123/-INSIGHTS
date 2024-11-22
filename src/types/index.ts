// Add to your existing types
export interface Comment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
  };
  created_at: any;
  updated_at?: any;
}