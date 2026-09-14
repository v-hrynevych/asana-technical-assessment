"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const [prompt, setPrompt] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || disabled) return;
    onSubmit(trimmedPrompt);
    setPrompt("");
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
          rows={3}
          fullWidth
          value={prompt}
          disabled={disabled}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
          helperText="Enter to send · Shift + Enter for a new line"
        />
        <Button type="submit" variant="contained" disabled={disabled || !prompt.trim()} sx={{ minHeight: 48, minWidth: 100 }}>
          Send
        </Button>
      </Stack>
    </Box>
  );
}
