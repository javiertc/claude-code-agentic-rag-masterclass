import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
const ACCEPTED_TYPES = ".pdf,.txt,.md,.docx,.html";

interface FileUploadButtonProps {
  threadId: string;
  onUploadComplete: (filename: string) => void;
}

export function FileUploadButton({
  threadId,
  onUploadComplete,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/files/upload/${threadId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Upload failed");
      }

      onUploadComplete(file.name);
      toast.success(`Uploaded ${file.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </>
  );
}

interface FileChipProps {
  filename: string;
  onRemove: () => void;
}

export function FileChip({ filename, onRemove }: FileChipProps) {
  return (
    <div className="flex items-center gap-1 bg-muted text-xs rounded-full px-2.5 py-1">
      <Paperclip className="h-3 w-3" />
      <span className="truncate max-w-[120px]">{filename}</span>
      <button
        onClick={onRemove}
        className="hover:text-destructive transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
