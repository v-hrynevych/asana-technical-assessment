import { expect, it } from "vitest";
import { CHAT_STORAGE_KEY, loadMessages, saveMessages } from "@/app/chat/_lib/storage";
import type { ChatMessage } from "@/app/chat/_types/chat";

const messages: ChatMessage[] = [{ id: "1", role: "user", content: "Hello" }, { id: "2", role: "assistant", content: "Hi" }];

it("saves and restores user and assistant messages", () => {
  saveMessages(messages);
  expect(JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) ?? "null")).toEqual(messages);
  expect(loadMessages()).toEqual(messages);
});

it("returns empty history for malformed stored JSON", () => {
  localStorage.setItem(CHAT_STORAGE_KEY, "{");
  expect(loadMessages()).toEqual([]);
});
