"use client";

import { useState, type ReactNode } from "react";
import { Alert, Box, Typography } from "@mui/material";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import type { ChatMessage, ChatRequest } from "../_types/chat";

export default function ChatConversation({ emptyState }: { emptyState: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitPrompt(prompt: string) {
    if (pending) return;
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt } satisfies ChatRequest),
        
      });
    
      const data: unknown = await response.json();
      if (!response.ok || typeof data !== "object" || data === null ||
          !("message" in data) || typeof data.message !== "string" || !data.message.trim()) {
        throw new Error("Invalid chat response");
      }
      const exchange: ChatMessage[] = [
        { id: crypto.randomUUID(), role: "user", content: prompt },
        { id: crypto.randomUUID(), role: "assistant", content: data.message },
      ];
      setMessages((previous) => [...previous, ...exchange]);
    } catch {
      setError("Unable to get a response. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <ChatMessages messages={messages} emptyState={emptyState} />
      <Box sx={{ px: { xs: 2, sm: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography role="status" variant="body2" color="text.secondary">
          {pending ? "Waiting for a reply…" : ""}
        </Typography>
      </Box>
      <ChatInput onSubmit={submitPrompt} disabled={pending} />
    </>
  );
}
