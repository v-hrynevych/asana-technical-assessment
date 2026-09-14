"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatRequest } from "../_types/chat";
import { clearMessages, loadMessages, saveMessages } from "../_lib/storage";

export const CHAT_REQUEST_TIMEOUT_MS = 60_000;

type RequestState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "error"; message: string };

interface ActiveRequest {
  controller: AbortController;
  timer: ReturnType<typeof setTimeout>;
}

export default function useChat() {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [requestState, setRequestState] = useState<RequestState>({ status: "idle" });
  const activeRequest = useRef<ActiveRequest | null>(null);
  const currentMessages = useRef<ChatMessage[]>([]);

  useEffect(() => {
    // Read browser storage after hydration; lazy initialization would mismatch SSR.
    const restored = loadMessages();
    currentMessages.current = restored;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronize with browser-only storage after hydration.
    setMessages(restored);
  }, []);

  // Tie the external request and timer lifetime to the mounted chat instance.
  useEffect(() => () => {
    const request = activeRequest.current;
    activeRequest.current = null;
    if (request) {
      clearTimeout(request.timer);
      request.controller.abort();
    }
  }, []);

  function clearChat() {
    if (messages === null || activeRequest.current) return;
    currentMessages.current = [];
    setMessages([]);
    clearMessages();
    setRequestState({ status: "idle" });
  }

  async function submitPrompt(value: string) {
    const prompt = value.trim();
    if (!prompt || messages === null || activeRequest.current) return;

    const controller = new AbortController();
    const request: ActiveRequest = {
      controller,
      timer: setTimeout(() => {
        if (activeRequest.current !== request) return;
        // Release the UI even if a transport fails to settle after abort.
        activeRequest.current = null;
        setRequestState({ status: "error", message: "The request timed out. Please try again." });
        controller.abort();
      }, CHAT_REQUEST_TIMEOUT_MS),
    };
    activeRequest.current = request;
    setRequestState({ status: "pending" });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...currentMessages.current.map(({ role, content }) => ({ role, content })),
            { role: "user", content: prompt },
          ],
        } satisfies ChatRequest),
        signal: controller.signal,
      });
      if (activeRequest.current !== request) return;
      if (!response.ok) throw new Error("Chat request failed");
      const data: unknown = await response.json();
      if (activeRequest.current !== request) return;
      if (typeof data !== "object" || data === null ||
          !("message" in data) || typeof data.message !== "string" || !data.message.trim()) {
        throw new Error("Invalid chat response");
      }
      const exchange: ChatMessage[] = [
        { id: crypto.randomUUID(), role: "user", content: prompt },
        { id: crypto.randomUUID(), role: "assistant", content: data.message },
      ];
      const nextMessages = [...currentMessages.current, ...exchange];
      currentMessages.current = nextMessages;
      setMessages(nextMessages);
      saveMessages(nextMessages);
      setRequestState({ status: "idle" });
    } catch {
      if (activeRequest.current === request) {
        setRequestState({ status: "error", message: "Unable to get a response. Please try again." });
      }
    } finally {
      clearTimeout(request.timer);
      // A late completion must not release a newer request's submission lock.
      if (activeRequest.current === request) activeRequest.current = null;
    }
  }

  return {
    messages: messages ?? [],
    initializing: messages === null,
    pending: requestState.status === "pending",
    error: requestState.status === "error" ? requestState.message : null,
    submitPrompt,
    clearChat,
  };
}
