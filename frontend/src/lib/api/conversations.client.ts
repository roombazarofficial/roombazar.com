import { api } from "./client";

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
