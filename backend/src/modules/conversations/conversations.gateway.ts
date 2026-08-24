import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Namespace, Socket } from "socket.io";
import { AuthService } from "src/modules/auth/auth.service";
import { SESSION_COOKIE } from "src/modules/auth/cookie";
import type { Conversation } from "src/domain/conversation.entity";

export type ConversationChangeReason =
  | "message"
  | "read"
  | "contact"
  | "blocked";

@WebSocketGateway({
  namespace: "/chat",
  transports: ["websocket"],
  cors: { origin: true, credentials: true },
})
export class ConversationsGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ConversationsGateway.name);

  @WebSocketServer()
  private namespace!: Namespace;

  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const origin = client.handshake.headers.origin;
    const allowedOrigins = this.config.get<string[]>("CORS_ORIGINS") ?? [];

    if (origin && !allowedOrigins.includes(origin)) {
      client.disconnect(true);
      return;
    }

    const token = cookieValue(client.handshake.headers.cookie, SESSION_COOKIE);
    const user = token ? await this.auth.resolveSession(token) : null;

    if (!user) {
      client.disconnect(true);
      return;
    }

    client.data.userId = user.id;
    await client.join(userRoom(user.id));
    this.logger.debug(`Chat socket connected for user ${user.id}`);
  }

  conversationChanged(
    conversation: Conversation,
    reason: ConversationChangeReason,
  ): void {
    const payload = { conversationId: conversation.id, reason };
    this.namespace
      .to(userRoom(conversation.seekerId))
      .to(userRoom(conversation.listerId))
      .emit("conversation:changed", payload);
  }
}

function userRoom(userId: string): string {
  return `user:${userId}`;
}

function cookieValue(header: string | undefined, name: string): string | null {
  if (!header) return null;

  for (const part of header.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rawValue.join("="));
  }

  return null;
}
