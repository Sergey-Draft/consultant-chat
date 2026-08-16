export type MessageStatus =
  | "pending"
  | "sent"
  | "failed";

export interface ChatMessage {
  id: string;
  text: string;
  status: MessageStatus;
  createdAt: number;
}
