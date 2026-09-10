import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Inject,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { z } from "zod";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import {
  NOTIFICATIONS_REPOSITORY,
  type NotificationsRepository,
} from "src/persistence/ports/notifications.repository";
import type { User } from "src/domain/user.entity";

const registerSchema = z.object({
  token: z.string().trim().min(20).max(4096),
  deviceType: z.enum(["web", "android", "ios"]).default("web"),
  browser: z.string().trim().max(60).optional(),
  installationId: z.string().trim().max(255).optional(),
});

const unregisterSchema = z.object({
  token: z.string().trim().min(20).max(4096),
});

/**
 * Device registration for web push. Authenticated: the token is always bound to
 * the caller resolved from the session, never to a userId sent by the browser.
 */
@Controller("notifications")
export class NotificationsController {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly repo: NotificationsRepository,
  ) {}

  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Post("register-token")
  @HttpCode(200)
  async register(
    @Body(new ZodValidationPipe(registerSchema))
    dto: z.infer<typeof registerSchema>,
    @CurrentUser() user: User,
    @Req() request: Request,
  ) {
    const record = await this.repo.upsertToken({
      userId: user.id,
      token: dto.token,
      deviceType: dto.deviceType,
      browser: dto.browser ?? null,
      installationId: dto.installationId ?? null,
      userAgent: request.headers["user-agent"] ?? null,
    });

    return { registered: true, deviceType: record.deviceType };
  }

  /** Deactivate the token for this browser, e.g. on sign-out. */
  @Delete("unregister-token")
  @HttpCode(204)
  async unregister(
    @Body(new ZodValidationPipe(unregisterSchema))
    dto: z.infer<typeof unregisterSchema>,
    @CurrentUser() user: User,
  ) {
    await this.repo.deactivateOwnToken(user.id, dto.token);
  }
}
