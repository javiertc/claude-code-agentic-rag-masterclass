import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Thread } from "@/types";

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await apiFetch("/api/threads/");
      const data = await res.json();
      setThreads(data);
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const createThread = async (): Promise<Thread> => {
    const res = await apiFetch("/api/threads/", {
      method: "POST",
      body: JSON.stringify({ title: "New Chat" }),
    });
    const thread: Thread = await res.json();
    setThreads((prev) => [thread, ...prev]);
    return thread;
  };

  const updateThread = async (id: string, title: string) => {
    const res = await apiFetch(`/api/threads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
    const updated: Thread = await res.json();
    setThreads((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteThread = async (id: string) => {
    await apiFetch(`/api/threads/${id}`, { method: "DELETE" });
    setThreads((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    threads,
    loading,
    createThread,
    updateThread,
    deleteThread,
    refetchThreads: fetchThreads,
  };
}
