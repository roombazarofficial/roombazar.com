import { io, type Socket } from "socket.io-client";

export interface ConversationChangedEvent {
  conversationId: string;
  reason: "message" | "read" | "contact" | "blocked";
}

let socket: Socket | null = null;

export function chatSocket(): Socket {
  if (!socket) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    socket = io(`${apiUrl.replace(/\/$/, "")}/chat`, {
      autoConnect: false,
      transports: ["websocket"],
      withCredentials: true,
    });
  }

  return socket;
}
