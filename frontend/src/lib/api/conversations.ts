import { serverApi as api, serverTryGet as tryGet } from "./serverclient";
import type { Conversation } from "@/types/conversation";
import type { Message } from "@/types/message";

export function getConversations(): Promise<Conversation[]> {
  return tryGet<Conversation[]>("/conversations", []);
}

export function getMessages(conversationId: string): Promise<Message[]> {
  return tryGet<Message[]>(`/conversations/${conversationId}/messages`, []);
}

export function startConversation(listingId: string, body: string) {
  return api.post("/conversations", { listingId, body });
}

export function sendMessage(conversationId: string, body: string) {
  return api.post(`/conversations/${conversationId}/messages`, { body });
}

export function revealContact(conversationId: string) {
  return api.post(`/conversations/${conversationId}/reveal`);
}

export function markConversationRead(conversationId: string) {
  return api.post(`/conversations/${conversationId}/read`);
}

export function blockConversation(conversationId: string) {
  return api.post(`/conversations/${conversationId}/block`);
}
