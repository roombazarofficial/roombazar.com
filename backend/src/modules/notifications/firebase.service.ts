import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

export interface FcmPayload {
  title: string;
  body: string;
  /** String map only — FCM data values must be strings. */
  data?: Record<string, string>;
}

export interface FcmSendResult {
  successCount: number;
  failureCount: number;
  /** Tokens FCM reported as permanently invalid — deactivate these. */
  invalidTokens: string[];
}

const INVALID_TOKEN_CODES = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
  "messaging/invalid-argument",
]);

/**
 * Owns the single Firebase Admin app for the process and every call into FCM.
 *
 * Initialises exactly once, lazily tolerant of missing credentials: if the
 * three FIREBASE_* env vars are not all present the service reports
 * `enabled === false` and every send becomes a logged no-op, so the rest of the
 * API is unaffected by notifications not being configured yet.
 */
@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App | null = null;
  private messaging: Messaging | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const projectId = this.config.get<string>("FIREBASE_PROJECT_ID");
    const clientEmail = this.config.get<string>("FIREBASE_CLIENT_EMAIL");
    const rawKey = this.config.get<string>("FIREBASE_PRIVATE_KEY");

    if (!projectId || !clientEmail || !rawKey) {
      this.logger.warn(
        "Firebase credentials incomplete — push notifications are disabled.",
      );
      return;
    }

    // Render and most dashboards store the PEM with literal "\n". Some also
    // wrap the whole value in quotes. Normalise both.
    const privateKey = rawKey
      .replace(/^["']|["']$/g, "")
      .replace(/\\n/g, "\n");

    try {
      this.app =
        getApps().find((a) => a.name === "roombazar") ??
        initializeApp(
          { credential: cert({ projectId, clientEmail, privateKey }) },
          "roombazar",
        );
      this.messaging = getMessaging(this.app);
      this.logger.log(`Firebase Admin initialised for project ${projectId}`);
    } catch (error) {
      this.logger.error(
        `Firebase Admin failed to initialise: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
      this.app = null;
      this.messaging = null;
    }
  }

  get enabled(): boolean {
    return this.messaging !== null;
  }

  /**
   * Sends one payload to many tokens, in chunks of 500 (the FCM multicast
   * limit). Never throws: transport failures are counted, and permanently
   * invalid tokens are returned for the caller to deactivate.
   */
  async sendToTokens(
    tokens: string[],
    payload: FcmPayload,
  ): Promise<FcmSendResult> {
    const result: FcmSendResult = {
      successCount: 0,
      failureCount: 0,
      invalidTokens: [],
    };

    const unique = [...new Set(tokens.filter(Boolean))];
    if (!this.messaging || unique.length === 0) {
      if (!this.messaging) {
        this.logger.debug("sendToTokens called while Firebase is disabled");
      }
      return result;
    }

    const link = payload.data?.url;

    for (let i = 0; i < unique.length; i += 500) {
      const batch = unique.slice(i, i + 500);

      try {
        const response = await this.messaging.sendEachForMulticast({
          tokens: batch,
          notification: { title: payload.title, body: payload.body },
          data: payload.data ?? {},
          webpush: {
            notification: {
              title: payload.title,
              body: payload.body,
              icon: "/logo/rb-logo.png",
            },
            fcmOptions: link ? { link } : undefined,
          },
          android: { priority: "high" },
        });

        result.successCount += response.successCount;
        result.failureCount += response.failureCount;

        response.responses.forEach((res, index) => {
          if (res.success) return;
          const code = res.error?.code ?? "";
          if (INVALID_TOKEN_CODES.has(code)) {
            const dead = batch[index];
            if (dead) result.invalidTokens.push(dead);
          } else {
            this.logger.warn(`FCM send failed: ${code || "unknown"}`);
          }
        });
      } catch (error) {
        result.failureCount += batch.length;
        this.logger.error(
          `FCM multicast threw: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    }

    return result;
  }
}
