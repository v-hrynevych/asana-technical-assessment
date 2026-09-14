import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import ChatMessages from "@/app/chat/_components/ChatMessages";

it("renders common assistant Markdown while leaving user content plain", () => {
  const markdown = "# Heading\n\nParagraph **bold** and *italic* with `code`.\n\n- One\n- Two\n\n```js\nconst x = 1;\n```\n\n[Example](https://example.com)";
  const { container } = render(<ChatMessages emptyState={null} messages={[
    { id: "1", role: "user", content: "**User bold** <b>plain</b>" },
    { id: "2", role: "assistant", content: markdown },
  ]} />);
  expect(screen.getByText("**User bold** <b>plain</b>")).toBeVisible();
  expect(screen.getByRole("heading", { name: "Heading" })).toBeVisible();
  expect(container.querySelector("strong")).toHaveTextContent("bold");
  expect(container.querySelector("em")).toHaveTextContent("italic");
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(container.querySelector("pre code")).toHaveTextContent("const x = 1;");
  expect(screen.getByRole("link", { name: "Example" })).toHaveAttribute("href", "https://example.com");
});

it("does not render raw HTML or executable link URLs", () => {
  const { container } = render(<ChatMessages emptyState={null} messages={[
    { id: "1", role: "assistant", content: '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[Bad](javascript:alert%281%29)' },
  ]} />);
  expect(container.querySelector("script, img")).toBeNull();
  expect(container.querySelector("a")).not.toHaveAttribute("href", expect.stringContaining("javascript:"));
});
