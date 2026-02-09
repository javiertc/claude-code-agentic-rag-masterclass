import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Thread } from "@/types";
import { cn } from "@/lib/utils";

interface ThreadItemProps {
  thread: Thread;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ThreadItem({
  thread,
  isActive,
  onSelect,
  onDelete,
}: ThreadItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
        isActive && "bg-accent"
      )}
      onClick={() => onSelect(thread.id)}
    >
      <span className="flex-1 truncate text-sm">{thread.title}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(thread.id);
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
