import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import ChatConversation from "@/app/chat/_components/ChatConversation";
import { CHAT_STORAGE_KEY, loadMessages, saveMessages } from "@/app/chat/_lib/storage";

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

it("persists successful exchanges and disables reset during a request", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json({ message: "Reply" }))
    .mockImplementation(() => new Promise(() => {})));
  const { unmount } = render(chat);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Reply");
  expect(loadMessages().map(({ role, content }) => ({ role, content }))).toEqual([
    { role: "user", content: "Hello" }, { role: "assistant", content: "Reply" },
  ]);
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(screen.getByRole("button", { name: "Clear Chat" })).toBeDisabled();
  expect(loadMessages()).toHaveLength(2);
  unmount();
  render(chat);
  expect(screen.getByText("Reply")).toBeVisible();
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
});

it("hydrates server HTML before restoring browser history", async () => {
  saveMessages([{ id: "1", role: "assistant", content: "Restored after hydration" }]);
  const container = document.createElement("div");
  container.innerHTML = renderToString(chat);
  expect(container.textContent).not.toContain("Restored after hydration");
  document.body.append(container);
  const onRecoverableError = vi.fn();
  const root = hydrateRoot(container, chat, { onRecoverableError });
  await act(async () => {});
  expect(container.textContent).toContain("Restored after hydration");
  expect(onRecoverableError).not.toHaveBeenCalled();
  act(() => root.unmount());
  container.remove();
});
