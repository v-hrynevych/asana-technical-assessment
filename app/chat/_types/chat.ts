export interface ChatRequest {
  prompt: string;
}

export interface ChatResponse {
  message: string;
}

export interface ChatError {
  error: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
