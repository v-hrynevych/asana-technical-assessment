import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ChatInput from "@/app/chat/_components/ChatInput";

it("does not submit an empty or whitespace-only prompt", () => {
  const onSubmit = vi.fn();
  render(<ChatInput onSubmit={onSubmit} />);
  expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  fireEvent.submit(screen.getByRole("form"));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "  \n " } });
  expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(onSubmit).not.toHaveBeenCalled();
});

it("invokes submit behavior with a valid trimmed prompt", () => {
  const onSubmit = vi.fn();
  render(<ChatInput onSubmit={onSubmit} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "  Hello  " } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith("Hello");
});

it("submits on Enter", () => {
  const onSubmit = vi.fn();
  render(<ChatInput onSubmit={onSubmit} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith("Hello");
});

it("allows Shift + Enter without submitting", () => {
  const onSubmit = vi.fn();
  render(<ChatInput onSubmit={onSubmit} />);
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "Hello" } });
  expect(fireEvent.keyDown(input, { key: "Enter", shiftKey: true })).toBe(true);
  fireEvent.change(input, { target: { value: "Hello\nworld" } });
  expect(input).toHaveValue("Hello\nworld");
  expect(onSubmit).not.toHaveBeenCalled();
});
