import { api } from "./client";
import type { Conversation } from "@/types/conversation";
import type { Message } from "@/types/message";

export function getConversationsClient() {
  return api.get<Conversation[]>("/conversations");
}

export function getMessagesClient(conversationId: string) {
  return api.get<Message[]>(`/conversations/${conversationId}/messages`);
}

export function startConversation(listingId: string, body: string) {
  return api.post("/conversations", { listingId, body });
}

export function sendMessage(conversationId: string, body: string) {
  return api.post(`/conversations/${conversationId}/messages`, { body });
}

export function revealContact(conversationId: string) {
  return api.post<Conversation>(`/conversations/${conversationId}/reveal`);
}

export function markConversationRead(conversationId: string) {
  return api.post(`/conversations/${conversationId}/read`);
}

export function blockConversation(conversationId: string) {
  return api.post(`/conversations/${conversationId}/block`);
}
