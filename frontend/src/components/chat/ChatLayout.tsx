import { useState, useCallback } from "react";
import { ThreadSidebar } from "@/components/chat/ThreadSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useThreads } from "@/hooks/useThreads";
import { useChat } from "@/hooks/useChat";

export function ChatLayout() {
  const { threads, createThread, deleteThread } = useThreads();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const { messages, isStreaming, sendMessage } = useChat(activeThreadId);

  const handleSelectThread = useCallback((id: string) => {
    setActiveThreadId(id);
  }, []);

  const handleNewThread = useCallback(async () => {
    const thread = await createThread();
    setActiveThreadId(thread.id);
  }, [createThread]);

  const handleDeleteThread = useCallback(
    async (id: string) => {
      await deleteThread(id);
      if (activeThreadId === id) {
        setActiveThreadId(null);
      }
    },
    [deleteThread, activeThreadId]
  );

  return (
    <div className="flex h-screen">
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
      />
      <ChatArea
        messages={messages}
        onSend={sendMessage}
        isStreaming={isStreaming}
        activeThreadId={activeThreadId}
      />
    </div>
  );
}
