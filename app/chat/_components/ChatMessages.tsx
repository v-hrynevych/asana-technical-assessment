import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { ChatMessage } from "../_types/chat";
import ReactMarkdown from "react-markdown";

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
              {message.role === "user" ? (
                <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{message.content}</Typography>
              ) : (
                <Box sx={{
                  overflowWrap: "anywhere", lineHeight: 1.6,
                  "& > :first-child": { mt: 0 }, "& > :last-child": { mb: 0 },
                  "& pre": { overflowX: "auto", p: 2, bgcolor: "grey.100", borderRadius: 1 },
                  "& code": { fontFamily: "monospace", bgcolor: "grey.100" },
                  "& a": { color: "primary.main" },
                }}>
                  <ReactMarkdown skipHtml>{message.content}</ReactMarkdown>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
