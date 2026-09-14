import "server-only";
import OpenAI from "openai";

export async function generateReply(prompt: string): Promise<string> {
  // Construct at request time so builds do not require credentials.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) throw new Error("Missing API configuration");
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create({
    model: "gpt-5.5",
    input: prompt,
    store: false,
  });

  if (response.status !== "completed" || !response.output_text.trim()) {
    throw new Error("No completed text response");
  }

  return response.output_text;
}
