import { serverTryGet as tryGet } from "./serverclient";
import type { Conversation } from "@/types/conversation";
import type { Message } from "@/types/message";

export function getConversations(): Promise<Conversation[]> {
  return tryGet<Conversation[]>("/conversations", []);
}

export function getMessages(conversationId: string): Promise<Message[]> {
  return tryGet<Message[]>(`/conversations/${conversationId}/messages`, []);
}
