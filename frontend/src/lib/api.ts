import { fetchEventSource } from "@microsoft/fetch-event-source";
import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  return headers;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getAuthHeaders();
  Object.assign(headers, options.headers as Record<string, string>);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error: ${res.status}`);
  }

  return res;
}

export async function fetchMessages(threadId: string) {
  const res = await apiFetch(`/api/threads/${threadId}/messages`);
  return res.json();
}

interface StreamChatCallbacks {
  onTextDelta: (delta: string) => void;
  onResponseId: (responseId: string) => void;
  onDone: (responseId: string) => void;
  onError: (error: Error) => void;
}

export async function streamChat(
  message: string,
  threadId: string,
  callbacks: StreamChatCallbacks
): Promise<void> {
  const headers = await getAuthHeaders();

  await fetchEventSource(`${API_URL}/api/chat/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message, thread_id: threadId }),
    onmessage(ev) {
      const data = JSON.parse(ev.data);
      switch (ev.event) {
        case "response_id":
          callbacks.onResponseId(data.response_id);
          break;
        case "text_delta":
          callbacks.onTextDelta(data.delta);
          break;
        case "done":
          callbacks.onDone(data.response_id);
          break;
      }
    },
    onerror(err) {
      callbacks.onError(
        err instanceof Error ? err : new Error("Stream error")
      );
      throw err; // Stop retrying
    },
    openWhenHidden: true,
  });
}
