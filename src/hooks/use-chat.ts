"use client";

import { useState, useCallback, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  flagged?: boolean;
  createdAt: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  useEffect(() => {
    fetch("/api/chat/history")
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(() => {});
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingContent(fullText);
      }

      setStreamingContent("");

      const updated = await fetch("/api/chat/history").then((r) => r.json());
      setMessages(updated);
    } catch {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingContent("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = useCallback(async () => {
    await fetch("/api/chat/history", { method: "DELETE" });
    setMessages([]);
  }, []);

  const flagMessage = useCallback(async (id: string) => {
    const msg = messages.find((m) => m.id === id);
    if (!msg) return;

    const newFlagged = !msg.flagged;

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, flagged: newFlagged } : m))
    );

    await fetch(`/api/chat/history/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagged: newFlagged }),
    });
  }, [messages]);

  return { messages, isLoading, streamingContent, sendMessage, clearChat, flagMessage };
}
