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
  expect(screen.getByRole("textbox")).toHaveValue("  \n ");
});

it("invokes submit behavior with a valid trimmed prompt", () => {
  const onSubmit = vi.fn();
  render(<ChatInput onSubmit={onSubmit} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "  Hello  " } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith("Hello");
  expect(screen.getByRole("textbox")).toHaveValue("");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Next\nline" } });
  expect(fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", shiftKey: true })).toBe(true);
  expect(screen.getByRole("textbox")).toHaveValue("Next\nline");
  expect(onSubmit).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(onSubmit).toHaveBeenLastCalledWith("Next\nline");
  expect(screen.getByRole("textbox")).toHaveValue("");
});
