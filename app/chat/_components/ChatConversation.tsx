"use client";

import type { ReactNode } from "react";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import useChat from "../_hooks/useChat";

export default function ChatConversation({ emptyState }: { emptyState: ReactNode }) {
  const { messages, pending, error, submitPrompt, clearChat } = useChat();

  return (
    <>
      {messages.length > 0 && (
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, textAlign: "right" }}>
          <Button onClick={clearChat} disabled={pending}>Clear Chat</Button>
        </Box>
      )}
      <ChatMessages messages={messages} emptyState={emptyState} />
      <Box sx={{ px: { xs: 2, sm: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 24, mb: 1 }}>
          {pending && <>
            <CircularProgress size={18} aria-hidden="true" />
            <Typography variant="body2" color="text.secondary">Waiting for a reply…</Typography>
          </>}
        </Box>
      </Box>
      <ChatInput onSubmit={submitPrompt} disabled={pending} />
    </>
  );
}
