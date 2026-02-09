import { useState, useCallback, useEffect } from "react";
import { streamChat, fetchMessages } from "@/lib/api";
import type { Message } from "@/types";
import { toast } from "sonner";

export function useChat(threadId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Load messages from DB when thread changes
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    fetchMessages(threadId)
      .then((data) => {
        if (!cancelled) {
          setMessages(
            data.map((m: { id: string; role: "user" | "assistant"; content: string }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            }))
          );
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load messages");
      });

    return () => { cancelled = true; };
  }, [threadId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!threadId || isStreaming) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      const assistantMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      try {
        await streamChat(content, threadId, {
          onTextDelta(delta) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: m.content + delta }
                  : m
              )
            );
          },
          onResponseId() {
            // Could store for debugging
          },
          onDone() {
            setIsStreaming(false);
          },
          onError(error) {
            toast.error(error.message);
            setIsStreaming(false);
          },
        });
      } catch {
        setIsStreaming(false);
      }
    },
    [threadId, isStreaming]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isStreaming, sendMessage, clearMessages };
}
