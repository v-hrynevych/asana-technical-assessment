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

it.each(["", " \n\t "])("rejects empty prompt %j without invoking OpenAI", async (prompt) => {
  const response = await POST(request({ prompt }));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Please enter a message." });
  expect(constructor).not.toHaveBeenCalled();
});

it.each([null, [], {}, { prompt: 42 }, { prompt: null }, "hello"])("rejects invalid request body %j", async (body) => {
  expect((await POST(request(body))).status).toBe(400);
  expect(create).not.toHaveBeenCalled();
});

it("rejects malformed JSON", async () => {
  const response = await POST(new Request("http://localhost/api/chat", { method: "POST", body: "{" }));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Please send a valid JSON request." });
  expect(create).not.toHaveBeenCalled();
});

it("calls the SDK with the trimmed prompt and normalizes its response", async () => {
  create.mockResolvedValue({ status: "completed", output_text: "Hello from the assistant" });
  const response = await POST(request({ prompt: "  Hello  " }));
  expect(constructor).toHaveBeenCalledWith({ apiKey: "test-placeholder" });
  expect(create).toHaveBeenCalledExactlyOnceWith({ model: "gpt-5.5", input: "Hello", store: false });
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ message: "Hello from the assistant" });
});

it("returns a safe generic error when the provider rejects", async () => {
  create.mockRejectedValue(new Error("Private provider diagnostic"));
  const response = await POST(request({ prompt: "Hello" }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Unable to get a response. Please try again." });
});

it.each([
  { status: "completed", output_text: " " },
  { status: "incomplete", output_text: "Partial answer" },
])("rejects unusable provider responses safely", async (result) => {
  create.mockResolvedValue(result);
  const response = await POST(request({ prompt: "Hello" }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Unable to get a response. Please try again." });
});

it("handles missing server configuration safely without calling OpenAI", async () => {
  vi.stubEnv("OPENAI_API_KEY", "");
  const response = await POST(request({ prompt: "Hello" }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Unable to get a response. Please try again." });
  expect(constructor).not.toHaveBeenCalled();
});
