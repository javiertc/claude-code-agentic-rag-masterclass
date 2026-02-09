import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import type { Message } from "@/types";

interface ChatAreaProps {
  messages: Message[];
  onSend: (content: string) => void;
  isStreaming: boolean;
  activeThreadId: string | null;
}

export function ChatArea({
  messages,
  onSend,
  isStreaming,
  activeThreadId,
}: ChatAreaProps) {
  if (!activeThreadId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">
          Select a thread or create a new one
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <MessageList messages={messages} />
      <ChatInput onSend={onSend} disabled={isStreaming} threadId={activeThreadId} />
    </div>
  );
}
