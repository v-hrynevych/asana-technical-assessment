// @vitest-environment node
import { expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import HomePage from "@/app/page";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

it("redirects the root page to the canonical chat route", () => {
  HomePage();
  expect(redirect).toHaveBeenCalledExactlyOnceWith("/chat");
});
