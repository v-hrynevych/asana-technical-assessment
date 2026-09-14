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

it("rejects an empty prompt without invoking OpenAI", async () => {
  const response = await POST(request({ prompt: "" }));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Please enter a message." });
  expect(constructor).not.toHaveBeenCalled();
});

it("returns a safe generic error when the provider rejects", async () => {
  create.mockRejectedValue(new Error("Private provider diagnostic"));
  const response = await POST(request({ prompt: "Hello" }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Unable to get a response. Please try again." });
});
