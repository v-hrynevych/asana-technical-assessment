import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import useChat, { CHAT_REQUEST_TIMEOUT_MS } from "@/app/chat/_hooks/useChat";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it("rejects blank prompts and blocks duplicate calls before a rerender", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ message: "Reply" }));
  vi.stubGlobal("fetch", fetchMock);
  const { result } = renderHook(() => useChat());
  await act(async () => {
    const submit = result.current.submitPrompt;
    await submit(" \n ");
    expect(fetchMock).not.toHaveBeenCalled();
    const first = submit(" Hello ");
    const duplicate = submit("Duplicate");
    await Promise.all([first, duplicate]);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(result.current.messages.map((message) => message.content)).toEqual(["Hello", "Reply"]);
  expect(result.current.pending).toBe(false);
});

it("times out during body reading and protects a retry from the old completion", async () => {
  vi.useFakeTimers();
  let finishBody!: (body: unknown) => void;
  const response = new Response();
  vi.spyOn(response, "json").mockReturnValue(new Promise((resolve) => { finishBody = resolve; }));
  const fetchMock = vi.fn().mockResolvedValueOnce(response).mockImplementation(() => new Promise(() => {}));
  vi.stubGlobal("fetch", fetchMock);
  const { result } = renderHook(() => useChat());
  act(() => { void result.current.submitPrompt("First"); });
  await act(async () => { await vi.advanceTimersByTimeAsync(CHAT_REQUEST_TIMEOUT_MS); });
  expect(result.current.error).toBe("The request timed out. Please try again.");
  act(() => { void result.current.submitPrompt("Retry"); });
  await act(async () => finishBody({ message: "Old reply" }));
  expect(result.current.pending).toBe(true);
  expect(result.current.messages).toEqual([]);
  act(() => { void result.current.submitPrompt("Duplicate"); });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("aborts and clears the timer on unmount", async () => {
  vi.useFakeTimers();
  let signal: AbortSignal | null | undefined;
  vi.stubGlobal("fetch", vi.fn((_url: string, options: RequestInit) => {
    signal = options.signal;
    return new Promise<Response>((_resolve, reject) => {
      signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    });
  }));
  const { result, unmount } = renderHook(() => useChat());
  let pendingRequest!: Promise<void>;
  act(() => { pendingRequest = result.current.submitPrompt("Hello"); });
  unmount();
  await pendingRequest;
  expect(signal?.aborted).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});

it("clears completed request timers and keeps previous messages while waiting", async () => {
  vi.useFakeTimers();
  const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ message: "Reply" }))
    .mockImplementation(() => new Promise(() => {}));
  vi.stubGlobal("fetch", fetchMock);
  const { result } = renderHook(() => useChat());
  await act(async () => { await result.current.submitPrompt("Hello"); });
  await act(async () => { await vi.advanceTimersByTimeAsync(CHAT_REQUEST_TIMEOUT_MS); });
  expect(result.current.error).toBeNull();
  expect(result.current.pending).toBe(false);
  act(() => { void result.current.submitPrompt("Next"); });
  expect(result.current.pending).toBe(true);
  expect(result.current.messages.map((message) => message.content)).toEqual(["Hello", "Reply"]);
});
