import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ChatConversation from "@/app/chat/_components/ChatConversation";
import { CHAT_REQUEST_TIMEOUT_MS } from "@/app/chat/_hooks/useChat";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it("posts the prompt internally and renders the assistant reply as plain text", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ message: "**Hello** from AI" }));
  vi.stubGlobal("fetch", fetchMock);
  render(<ChatConversation emptyState={<p>Start a conversation</p>} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: "Hello" }),
    signal: expect.any(AbortSignal),
  });
  expect(await screen.findByText("**Hello** from AI")).toBeVisible();
  expect(screen.getByRole("article", { name: "Your message" })).toHaveTextContent("Hello");
  expect(screen.queryByText("Start a conversation")).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("button", { name: "Send" })).toBeEnabled());
});

it.each(["http", "network", "malformed"])("shows a safe error and keeps the draft after a %s failure", async (failure) => {
  const fetchMock = vi.fn();
  if (failure === "network") fetchMock.mockRejectedValue(new Error("Private diagnostic"));
  else fetchMock.mockResolvedValue(Response.json(
    failure === "http" ? { error: "Private diagnostic" } : { message: 42 },
    { status: failure === "http" ? 500 : 200 },
  ));
  vi.stubGlobal("fetch", fetchMock);
  render(<ChatConversation emptyState={<p>Start a conversation</p>} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to get a response. Please try again.");
  expect(screen.getByRole("textbox")).toHaveValue("Hello");
  expect(screen.queryByText("Private diagnostic")).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("button", { name: "Send" })).toBeEnabled());
  fetchMock.mockResolvedValueOnce(Response.json({ message: "Recovered reply" }));
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(await screen.findByText("Recovered reply")).toBeVisible();
});

it("shows loading, blocks submissions, and restores controls after success", async () => {
  let resolveRequest!: (response: Response) => void;
  const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((resolve) => { resolveRequest = resolve; }));
  vi.stubGlobal("fetch", fetchMock);
  render(<ChatConversation emptyState={<p>Start a conversation</p>} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(screen.getByRole("status")).toHaveTextContent("Waiting for a reply");
  expect(screen.getByRole("textbox")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  fireEvent.submit(screen.getByRole("form"));
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(async () => resolveRequest(Response.json({ message: "Reply" })));
  expect(screen.getByText("Reply")).toBeVisible();
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
  expect(screen.getByRole("textbox")).toBeEnabled();
  expect(screen.getByRole("button", { name: "Send" })).toBeEnabled();
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
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await act(async () => {});
  expect(screen.getByText("Retried reply")).toBeVisible();
  await act(async () => resolveOldRequest(Response.json({ message: "Stale reply" })));
  expect(screen.queryByText("Stale reply")).not.toBeInTheDocument();
});
