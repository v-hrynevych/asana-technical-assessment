import { afterEach, expect, it, vi } from "vitest";
import { CHAT_STORAGE_KEY, clearMessages, loadMessages, saveMessages } from "@/app/chat/_lib/storage";
import type { ChatMessage } from "@/app/chat/_types/chat";

const messages: ChatMessage[] = [{ id: "1", role: "user", content: "Hello" }, { id: "2", role: "assistant", content: "Hi" }];
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("saves and restores user and assistant messages", () => {
  saveMessages(messages);
  expect(JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) ?? "null")).toEqual(messages);
  expect(loadMessages()).toEqual(messages);
});

it.each(["{", "null", "{}", '[{"id":"1","role":"system","content":"Hi"}]',
  '[{"id":"1","role":"user","content":42}]', '[{"role":"user","content":"Hi"}]',
  JSON.stringify([messages[0], messages[0]]),
])("ignores malformed or invalid history: %s", (stored) => {
  localStorage.setItem(CHAT_STORAGE_KEY, stored);
  expect(loadMessages()).toEqual([]);
});

it("returns empty history when missing and removes only its own key on clear", () => {
  expect(loadMessages()).toEqual([]);
  localStorage.setItem("unrelated", "keep");
  saveMessages(messages);
  clearMessages();
  expect(localStorage.getItem(CHAT_STORAGE_KEY)).toBeNull();
  expect(localStorage.getItem("unrelated")).toBe("keep");
});

it("handles inaccessible storage and SSR safely", () => {
  vi.spyOn(window, "localStorage", "get").mockImplementation(() => { throw new Error("Blocked"); });
  expect(loadMessages()).toEqual([]);
  expect(() => saveMessages(messages)).not.toThrow();
  expect(() => clearMessages()).not.toThrow();
  vi.stubGlobal("window", undefined);
  expect(loadMessages()).toEqual([]);
  expect(() => saveMessages(messages)).not.toThrow();
  expect(() => clearMessages()).not.toThrow();
});

it("handles quota failures safely", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota"); });
  expect(() => saveMessages(messages)).not.toThrow();
});
