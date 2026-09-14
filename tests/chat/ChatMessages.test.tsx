import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import ChatMessages from "@/app/chat/_components/ChatMessages";

it("renders assistant Markdown structure while keeping user text plain", () => {
  const markdown = "# Heading\n\nParagraph with **bold** and *italic* and `inline`.\n\n- Bullet\n\n1. Ordered\n\n```js\n  const value = 1;\n  console.log(value);\n```\n\n[Example](https://example.com)";
  render(<ChatMessages emptyState={null} messages={[
    { id: "u", role: "user", content: markdown },
    { id: "a", role: "assistant", content: markdown },
  ]} />);
  const assistant = within(screen.getByRole("article", { name: "Assistant reply" }));
  expect(assistant.getByRole("heading", { name: "Heading", level: 1 })).toBeVisible();
  expect(assistant.getAllByRole("list").map(list => list.tagName)).toEqual(["UL", "OL"]);
  expect(assistant.getByText("bold").tagName).toBe("STRONG");
  expect(assistant.getByText("italic").tagName).toBe("EM");
  expect(assistant.getByText("inline").tagName).toBe("CODE");
  expect(assistant.getByText("const value = 1; console.log(value);").closest("pre")?.textContent).toBe("  const value = 1;\n  console.log(value);\n");
  expect(assistant.getByRole("link", { name: "Example" })).toHaveAttribute("href", "https://example.com");
  const user = screen.getByRole("article", { name: "Your message" });
  expect(user.textContent).toContain(markdown);
  expect(user.querySelector("h1, ul, ol, strong, em, code, a")).toBeNull();
});
