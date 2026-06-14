import { cn } from "@/lib/utils";
import { Bot, User, Flag } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  flagged?: boolean;
  onFlag?: () => void;
}

export function ChatBubble({ role, content, flagged, onFlag }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex max-w-[80%] flex-col gap-1">
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "bg-emerald-600 text-white rounded-br-sm"
              : "bg-muted rounded-bl-sm",
            flagged && "ring-2 ring-red-400"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && onFlag && (
          <button
            onClick={onFlag}
            className={cn(
              "flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors",
              flagged
                ? "text-red-500 hover:text-red-600"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Flag className="h-3 w-3" />
            {flagged ? "Flagged as unhelpful" : "Flag as unhelpful"}
          </button>
        )}
      </div>
    </div>
  );
}
