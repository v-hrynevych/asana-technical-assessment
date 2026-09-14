export interface ChatRequest {
  messages: ConversationMessage[];
}

export interface ChatResponse {
  message: string;
}

export interface ChatError {
  error: string;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatMessage extends ConversationMessage {
  id: string;
}
