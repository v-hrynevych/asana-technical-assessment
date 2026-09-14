import { generateReply } from "@/lib/openai";
import type { ChatError, ChatResponse, ConversationMessage } from "@/app/chat/_types/chat";

function isConversationMessage(value: unknown): value is ConversationMessage {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    "role" in value && (value.role === "user" || value.role === "assistant") &&
    "content" in value && typeof value.content === "string" && !!value.content.trim();
}

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
    !("messages" in body) ||
    !Array.isArray(body.messages) ||
    body.messages.length === 0 ||
    !body.messages.every(isConversationMessage) ||
    body.messages.at(-1)?.role !== "user"
  ) {
    return Response.json(
      { error: "Please send a valid conversation ending with a user message." } satisfies ChatError,
      { status: 400 },
    );
  }

  try {
    const messages = body.messages.map(({ role, content }) => ({ role, content }));
    const message = await generateReply(messages);
    return Response.json({ message } satisfies ChatResponse);
  } catch {
    return Response.json(
      {
        error: "Unable to get a response. Please try again.",
      } satisfies ChatError,
      { status: 500 },
    );
  }
}
