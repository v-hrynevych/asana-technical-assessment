"use client";

import type { ReactNode } from "react";
import { Alert, Box, Button } from "@mui/material";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import useChat from "../_hooks/useChat";

export default function ChatConversation({ emptyState }: { emptyState: ReactNode }) {
  const { messages, initializing, pending, error, submitPrompt, clearChat } = useChat();

  return (
    <>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", scrollbarGutter: "stable", display: "flex", flexDirection: "column" }}>
        {messages.length > 0 && (
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, textAlign: "right" }}>
            <Button onClick={clearChat} disabled={pending}>Clear Chat</Button>
          </Box>
        )}
        <ChatMessages messages={messages} emptyState={emptyState} initializing={initializing} pending={pending} />
        <Box sx={{ px: { xs: 2, sm: 3 } }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        </Box>
      </Box>
      <ChatInput onSubmit={submitPrompt} disabled={initializing || pending} />
    </>
  );
}
