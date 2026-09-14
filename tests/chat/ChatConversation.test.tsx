import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ChatConversation from "@/app/chat/_components/ChatConversation";

afterEach(() => vi.unstubAllGlobals());

it("posts the prompt internally and renders the assistant reply as plain text", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ message: "**Hello** from AI" }));
  vi.stubGlobal("fetch", fetchMock);
  render(<ChatConversation emptyState={<p>Start a conversation</p>} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: "Hello" }),
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
});
