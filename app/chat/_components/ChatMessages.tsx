import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { ChatMessage } from "../_types/chat";
import ReactMarkdown from "react-markdown";
import LoadingMessage from "./LoadingMessage";

export default function ChatMessages({ messages, emptyState, initializing = false, pending = false }: {
  messages: ChatMessage[]; emptyState: ReactNode; initializing?: boolean; pending?: boolean;
}) {
  return (
    <Box component="section" aria-label="Conversation" sx={{ flex: "1 0 auto", display: "flex", flexDirection: "column", gap: 3, minWidth: 0, p: { xs: 3, sm: 6 } }}>
      {initializing ? (
        <Stack role="status" aria-live="polite" spacing={3}>
          <Typography color="text.secondary">Loading chat history...</Typography>
          <LoadingMessage width="52%" align="right" />
          <LoadingMessage width="82%" />
          <LoadingMessage width="62%" />
        </Stack>
      ) : messages.length === 0 ? (
        !pending && <Box sx={{ flex: 1, display: "grid", placeItems: "center" }}>{emptyState}</Box>
      ) : (
        <Stack role="log" aria-label="Messages" spacing={3} sx={{ width: "100%", minWidth: 0 }}>
          {messages.map((message) => (
            <Box component="article" aria-label={message.role === "user" ? "Your message" : "Assistant reply"} key={message.id} sx={{ minWidth: 0, maxWidth: "100%" }}>
              <Typography component="p" variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, fontWeight: 600, letterSpacing: "0.04em" }}>
                {message.role === "user" ? "You" : "Assistant"}
              </Typography>
              {message.role === "user" ? (
                <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{message.content}</Typography>
              ) : (
                <Box sx={{
                  minWidth: 0, maxWidth: "100%", overflowWrap: "anywhere", lineHeight: 1.7,
                  "& p": { my: 1.5 },
                  "& h1, & h2, & h3, & h4, & h5, & h6": { mt: 3, mb: 1.5, lineHeight: 1.3 },
                  "& h1": { fontSize: "1.6rem" }, "& h2": { fontSize: "1.4rem" },
                  "& h3": { fontSize: "1.2rem" }, "& h4, & h5, & h6": { fontSize: "1rem" },
                  "& ul, & ol": { my: 1.5, pl: 3 }, "& li + li": { mt: 0.5 },
                  "& > :first-child": { mt: 0 }, "& > :last-child": { mb: 0 },
                  "& pre": { maxWidth: "100%", overflowX: "auto", whiteSpace: "pre", p: 2, my: 2, bgcolor: "grey.100", border: 1, borderColor: "divider", borderRadius: 2 },
                  "& code": { fontFamily: "monospace", fontSize: "0.9em", bgcolor: "grey.100", px: 0.5, py: 0.25, borderRadius: 0.5 },
                  "& pre code": { p: 0, fontSize: "inherit", bgcolor: "transparent", borderRadius: 0 },
                  "& a": { color: "primary.main", textDecoration: "underline", textUnderlineOffset: "0.15em" },
                }}>
                  <ReactMarkdown skipHtml>{message.content}</ReactMarkdown>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
      <Box role="status" aria-live="polite">
        {pending && <>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Generating response...</Typography>
          <LoadingMessage />
        </>}
      </Box>
    </Box>
  );
}
