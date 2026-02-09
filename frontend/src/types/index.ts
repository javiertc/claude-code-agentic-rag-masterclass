export interface Thread {
  id: string;
  user_id: string;
  title: string;
  last_response_id: string | null;
  vector_store_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}
