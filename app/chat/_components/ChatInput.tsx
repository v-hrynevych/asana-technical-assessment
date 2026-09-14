"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

interface ChatInputProps {
  onSubmit?: (prompt: string) => void;
}

export default function ChatInput({ onSubmit }: ChatInputProps) {
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    onSubmit?.(trimmedPrompt);
    setSubmitted(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Let IME users confirm a composed character without submitting the form.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault();
      event.currentTarget.closest("form")?.requestSubmit();
    }
  }

  return (
    <Box component="form" aria-label="Send a message" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 3 }, borderTop: 1, borderColor: "divider" }}>
      <Stack spacing={2} direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { sm: "flex-start" } }}>
        <TextField
          id="chat-prompt"
          label="Your message"
          placeholder="What would you like to explore?"
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
          value={prompt}
          onChange={(event) => { setPrompt(event.target.value); setSubmitted(false); }}
          onKeyDown={handleKeyDown}
          helperText="Enter to send · Shift + Enter for a new line"
        />
        <Button type="submit" variant="contained" disabled={!prompt.trim()} sx={{ minHeight: 48, minWidth: 100 }}>
          Send
        </Button>
      </Stack>
      <Typography role="status" variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: "1.5em" }}>
        {submitted ? "Preview only: your message has not been sent. AI replies aren’t available yet." : ""}
      </Typography>
    </Box>
  );
}
