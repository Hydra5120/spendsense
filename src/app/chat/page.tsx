"use client";

import { useChat } from "@/hooks/use-chat";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";

export default function ChatPage() {
  const { messages, isLoading, streamingContent, sendMessage } = useChat();

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
      />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
