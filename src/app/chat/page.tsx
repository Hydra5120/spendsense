"use client";

import { useChat } from "@/hooks/use-chat";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function ChatPage() {
  const { messages, isLoading, streamingContent, sendMessage, clearChat, flagMessage } = useChat();

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:h-[calc(100vh-3rem)]">
      <div className="border-b px-4 py-3">
        <h1 className="text-lg font-bold">SpendSense Chat</h1>
        <p className="text-xs text-muted-foreground">
          AI assistant with access to your financial data
        </p>
      </div>
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        streamingContent={streamingContent}
        onFlagMessage={flagMessage}
      />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
      {messages.length > 0 && (
        <div className="fixed top-16 right-10 z-50 md:top-12">
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={isLoading}
            className="bg-background shadow-md hover:text-destructive"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Clear chat
          </Button>
        </div>
      )}
    </div>
  );
}
