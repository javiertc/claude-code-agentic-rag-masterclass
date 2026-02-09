import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  FileUploadButton,
  FileChip,
} from "@/components/chat/FileUploadButton";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  threadId: string | null;
}

export function ChatInput({ onSend, disabled, threadId }: ChatInputProps) {
  const [content, setContent] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setContent("");
    setUploadedFiles([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="max-w-3xl mx-auto space-y-2">
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {uploadedFiles.map((f) => (
              <FileChip
                key={f}
                filename={f}
                onRemove={() =>
                  setUploadedFiles((prev) =>
                    prev.filter((name) => name !== f)
                  )
                }
              />
            ))}
          </div>
        )}
        <div className="flex gap-2">
          {threadId && (
            <FileUploadButton
              threadId={threadId}
              onUploadComplete={(name) =>
                setUploadedFiles((prev) => [...prev, name])
              }
            />
          )}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-[200px] resize-none"
            rows={1}
            disabled={disabled}
          />
          <Button
            onClick={handleSend}
            disabled={disabled || !content.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
