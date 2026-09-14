// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const { create, constructor } = vi.hoisted(() => ({ create: vi.fn(), constructor: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("openai", () => ({
  default: class {
    responses = { create };
    constructor(options: unknown) { constructor(options); }
  },
}));

import { POST } from "@/app/api/chat/route";

beforeEach(() => {
  vi.clearAllMocks();
  create.mockReset();
  vi.stubEnv("OPENAI_API_KEY", "test-placeholder");
});
afterEach(() => vi.unstubAllEnvs());

function request(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

it("rejects malformed conversation payloads without invoking OpenAI", async () => {
  for (const body of [null, {}, { prompt: "Hello" }, { messages: "Hello" }, { messages: [] },
    { messages: [null] }, { messages: [{ role: "system", content: "Hello" }] },
    { messages: [{ role: "user", content: "  " }] }, { messages: [{ role: "user", content: 42 }] },
    { messages: [{ content: "Hello" }] }, { messages: [{ role: "assistant", content: "Hello" }] }]) {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Please send a valid conversation ending with a user message." });
  }
  expect((await POST(new Request("http://localhost/api/chat", { method: "POST", body: "{" }))).status).toBe(400);
  expect(constructor).not.toHaveBeenCalled();
});

it("passes ordered conversation content to OpenAI without UI metadata", async () => {
  const messages = [
    { role: "user", content: "My favorite color is blue." },
    { role: "assistant", content: "Got it.\n\n    code" },
    { role: "user", content: "What is my favorite color?" },
  ];
  create.mockResolvedValue({ status: "completed", output_text: "Blue." });
  const response = await POST(request({ messages: messages.map(message => ({ ...message, id: "ignored", status: "pending" })) }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ message: "Blue." });
  expect(create).toHaveBeenCalledExactlyOnceWith({ model: "gpt-5.5", input: messages, store: false });
});

it("returns a safe generic error when the provider rejects", async () => {
  create.mockRejectedValue(new Error("Private provider diagnostic"));
  const response = await POST(request({ messages: [{ role: "user", content: "Hello" }] }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Unable to get a response. Please try again." });
});
