import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import ChatConversation from "@/app/chat/_components/ChatConversation";
import { CHAT_STORAGE_KEY, saveMessages } from "@/app/chat/_lib/storage";

afterEach(() => vi.unstubAllGlobals());
const chat = <ChatConversation emptyState={<p>Empty chat</p>} />;

it("shows initialization feedback until persisted history hydrates without an empty-state flash", async () => {
  saveMessages([{ id: "1", role: "assistant", content: "Saved reply" }]);
  const container = document.createElement("div");
  container.innerHTML = renderToString(chat);
  expect(container.textContent).toContain("Loading chat history...");
  expect(container.querySelector('[role="status"]')?.querySelectorAll(".MuiSkeleton-rounded")).toHaveLength(3);
  expect(container.textContent).not.toContain("Empty chat");
  const emptyStateRendered = vi.fn(() => <p>Empty chat</p>);
  const EmptyState = emptyStateRendered;
  const onRecoverableError = vi.fn();
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, <ChatConversation emptyState={<EmptyState />} />, { onRecoverableError });
  });
  expect(container.textContent).toContain("Saved reply");
  expect(container.textContent).not.toContain("Loading chat history");
  expect(container.querySelector(".MuiSkeleton-root")).toBeNull();
  expect(emptyStateRendered).not.toHaveBeenCalled();
  expect(onRecoverableError).not.toHaveBeenCalled();
  act(() => root.unmount());
});

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
