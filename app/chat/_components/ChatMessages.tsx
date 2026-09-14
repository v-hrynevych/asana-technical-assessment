import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { ChatMessage } from "../_types/chat";

export default function ChatMessages({ messages, emptyState }: { messages: ChatMessage[]; emptyState: ReactNode }) {
  return (
    <Box component="section" aria-label="Conversation" sx={{ flex: 1, display: "grid", placeItems: "center", minWidth: 0, p: { xs: 3, sm: 6 } }}>
      {messages.length === 0 ? emptyState : (
        <Stack role="log" aria-label="Messages" spacing={3} sx={{ width: "100%", minWidth: 0 }}>
          {messages.map((message) => (
            <Box component="article" aria-label={message.role === "user" ? "Your message" : "Assistant reply"} key={message.id}>
              <Typography component="h2" variant="subtitle2" sx={{ mb: 1 }}>
                {message.role === "user" ? "You" : "Assistant"}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{message.content}</Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
