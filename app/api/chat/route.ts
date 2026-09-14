import { generateReply } from "@/lib/openai";
import type { ChatError, ChatResponse } from "@/app/chat/_types/chat";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Please send a valid JSON request." } satisfies ChatError,
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("prompt" in body) ||
    typeof body.prompt !== "string" ||
    !body.prompt.trim()
  ) {
    return Response.json(
      { error: "Please enter a message." } satisfies ChatError,
      { status: 400 },
    );
  }

  try {
    const message = await generateReply(body.prompt.trim());
    return Response.json({ message } satisfies ChatResponse);
  } catch (error) {
    console.error("generateReply failed:", error);
    return Response.json(
      {
        error: "Unable to get a response. Please try again.",
      } satisfies ChatError,
      { status: 500 },
    );
  }
}
