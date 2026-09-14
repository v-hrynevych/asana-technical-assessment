import "server-only";
import OpenAI from "openai";
import type { ConversationMessage } from "@/app/chat/_types/chat";

export async function generateReply(messages: ConversationMessage[]): Promise<string> {
  // Construct at request time so builds do not require credentials.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) throw new Error("Missing API configuration");
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: "gpt-5.5",
    input: messages,
    store: false,
  });

  if (response.status !== "completed" || !response.output_text.trim()) {
    throw new Error("No completed text response");
  }

  return response.output_text;
}
