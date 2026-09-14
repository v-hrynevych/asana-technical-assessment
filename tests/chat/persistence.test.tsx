import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ChatConversation from "@/app/chat/_components/ChatConversation";
import { CHAT_STORAGE_KEY, saveMessages } from "@/app/chat/_lib/storage";

afterEach(() => vi.unstubAllGlobals());
const chat = <ChatConversation emptyState={<p>Empty chat</p>} />;

it("restores history and clears visible messages, storage, and errors", async () => {
  saveMessages([{ id: "1", role: "assistant", content: "Saved reply" }]);
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Failure")));
  render(chat);
  expect(screen.getByText("Saved reply")).toBeVisible();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Clear Chat" }));
  expect(screen.queryByText("Saved reply")).not.toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Clear Chat" })).not.toBeInTheDocument();
  expect(screen.getByText("Empty chat")).toBeVisible();
  expect(localStorage.getItem(CHAT_STORAGE_KEY)).toBeNull();
});
