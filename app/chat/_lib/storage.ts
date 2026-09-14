import type { ChatMessage } from "../_types/chat";

export const CHAT_STORAGE_KEY = "ai-chat.messages.v1";

function isMessage(value: unknown): value is ChatMessage {
  return typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "string" && !!value.id.trim() &&
    "role" in value && (value.role === "user" || value.role === "assistant") &&
    "content" in value && typeof value.content === "string";
}

export function loadMessages(): ChatMessage[] {
  try {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return [];
    const data: unknown = JSON.parse(stored);
    if (!Array.isArray(data) || !data.every(isMessage)) return [];
    if (new Set(data.map((message) => message.id)).size !== data.length) return [];
    return data.map(({ id, role, content }) => ({ id, role, content }));
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(
      messages.map(({ id, role, content }) => ({ id, role, content })),
    ));
  } catch {
    // Storage may be blocked or full; the current chat remains usable in memory.
  }
}

export function clearMessages(): void {
  try {
    if (typeof window !== "undefined") window.localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch {
    // Reset still clears the visible chat when browser storage is unavailable.
  }
}
