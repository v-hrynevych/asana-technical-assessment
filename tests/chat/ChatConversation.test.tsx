import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ChatConversation from "@/app/chat/_components/ChatConversation";
import { CHAT_REQUEST_TIMEOUT_MS } from "@/app/chat/_hooks/useChat";
import { CHAT_STORAGE_KEY, saveMessages } from "@/app/chat/_lib/storage";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it("shows a safe error and permits another submission after an API failure", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json(
    { error: "Private diagnostic" }, { status: 500 },
  ));
  vi.stubGlobal("fetch", fetchMock);
  render(<ChatConversation emptyState={<p>Start a conversation</p>} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to get a response. Please try again.");
  expect(screen.getByRole("textbox")).toHaveValue("");
  expect(screen.queryByText("Private diagnostic")).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fetchMock.mockResolvedValueOnce(Response.json({ message: "Recovered reply" }));
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(await screen.findByText("Recovered reply")).toBeVisible();
});

it("shows loading, blocks submissions, and restores controls after success", async () => {
  saveMessages([
    { id: "saved-user", role: "user", content: "My favorite color is blue." },
    { id: "saved", role: "assistant", content: "Previous reply" },
  ]);
  const savedHistory = localStorage.getItem(CHAT_STORAGE_KEY);
  let resolveRequest!: (response: Response) => void;
  const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((resolve) => { resolveRequest = resolve; }));
  vi.stubGlobal("fetch", fetchMock);
  render(<ChatConversation emptyState={<p>Start a conversation</p>} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(screen.getByRole("status")).toHaveTextContent("Generating response...");
  expect(screen.getByText("Generating response...")).toBeVisible();
  expect(fetchMock).toHaveBeenCalledWith("/api/chat", expect.objectContaining({
    body: JSON.stringify({ messages: [
      { role: "user", content: "My favorite color is blue." },
      { role: "assistant", content: "Previous reply" },
      { role: "user", content: "Hello" },
    ] }),
  }));
  expect(screen.getByRole("status").querySelector(".MuiSkeleton-rounded")).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Conversation" })).toContainElement(screen.getByRole("status"));
  expect(screen.getByText("Previous reply")).toBeVisible();
  expect(screen.getByRole("textbox")).toHaveValue("");
  expect(localStorage.getItem(CHAT_STORAGE_KEY)).toBe(savedHistory);
  expect(screen.getByRole("textbox")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  fireEvent.submit(screen.getByRole("form"));
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(async () => resolveRequest(Response.json({ message: "Reply" })));
  expect(screen.getByText("Reply")).toBeVisible();
  expect(screen.getAllByRole("article", { name: "Assistant reply" })).toHaveLength(2);
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
  expect(screen.getByRole("textbox")).toBeEnabled();
  expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  fetchMock.mockResolvedValueOnce(Response.json({ message: "Next reply" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Next question" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(fetchMock).toHaveBeenLastCalledWith("/api/chat", expect.objectContaining({
    body: JSON.stringify({ messages: [
      { role: "user", content: "My favorite color is blue." },
      { role: "assistant", content: "Previous reply" },
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Reply" },
      { role: "user", content: "Next question" },
    ] }),
  }));
  expect(await screen.findByText("Next reply")).toBeVisible();
});

it("shows a timeout and allows retry while ignoring a late response", async () => {
  vi.useFakeTimers();
  let resolveOldRequest!: (response: Response) => void;
  let signal: AbortSignal | null | undefined;
  const fetchMock = vi.fn().mockImplementationOnce((_url: string, options: RequestInit) => {
    signal = options.signal;
    return new Promise<Response>((resolve) => { resolveOldRequest = resolve; });
  }).mockResolvedValueOnce(Response.json({ message: "Retried reply" }));
  vi.stubGlobal("fetch", fetchMock);
  render(<ChatConversation emptyState={<p>Start a conversation</p>} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await act(async () => { await vi.advanceTimersByTimeAsync(CHAT_REQUEST_TIMEOUT_MS); });
  expect(signal?.aborted).toBe(true);
  expect(screen.getByRole("alert")).toHaveTextContent("The request timed out. Please try again.");
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
  expect(screen.getByRole("textbox")).toBeEnabled();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await act(async () => {});
  expect(screen.getByText("Retried reply")).toBeVisible();
  await act(async () => resolveOldRequest(Response.json({ message: "Stale reply" })));
  expect(screen.queryByText("Stale reply")).not.toBeInTheDocument();
});
