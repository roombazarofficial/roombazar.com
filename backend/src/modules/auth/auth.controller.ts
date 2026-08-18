import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { Public } from "src/common/decorators/public.decorator";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import { Throttle } from "@nestjs/throttler";
import type { User } from "src/domain/user.entity";
import { AuthService, type SessionContext } from "./auth.service";
import { SESSION_COOKIE, clearSessionCookie, setSessionCookie } from "./cookie";
import {
  completeSignupSchema,
  confirmResetSchema,
  loginSchema,
  lookupSchema,
  requestResetSchema,
  startSignupSchema,
  type CompleteSignupDto,
  type ConfirmResetDto,
  type LoginDto,
  type LookupDto,
  type RequestResetDto,
  type StartSignupDto,
} from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Which form to show next. Cheap, so it is throttled loosely. */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Post("lookup")
  @HttpCode(200)
  async lookup(
    @Body(new ZodValidationPipe(lookupSchema)) dto: LookupDto,
  ) {
    return this.auth.lookup(dto.email);
  }

  /*
    Sending mail costs money and can be used to harass an address, so this is
    the tightest limit in the API. The per-address hourly cap in the service
    sits behind it, catching an attacker who rotates IPs.
  */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post("signup/start")
  @HttpCode(202)
  async startSignup(
    @Body(new ZodValidationPipe(startSignupSchema)) dto: StartSignupDto,
  ) {
    await this.auth.startSignup(dto.email);
    return { sent: true };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post("signup/complete")
  @HttpCode(201)
  async completeSignup(
    @Body(new ZodValidationPipe(completeSignupSchema)) dto: CompleteSignupDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.completeSignup(dto, contextOf(request));
    setSessionCookie(response, result.token, result.expiresAt);

    return { user: result.user };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post("login")
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(dto, contextOf(request));
    setSessionCookie(response, result.token, result.expiresAt);

    return { user: result.user };
  }

  @Public()
  @Post("logout")
  @HttpCode(204)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = tokenFrom(request);
    if (token) await this.auth.logout(token);

    // Cleared regardless, so a stale or already-revoked cookie cannot leave the
    // browser believing it is still signed in.
    clearSessionCookie(response);
  }

  @Post("logout/everywhere")
  @HttpCode(204)
  async logoutEverywhere(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logoutEverywhere(user.id);
    clearSessionCookie(response);
  }

  @Get("sessions")
  async sessions(@CurrentUser() user: User) {
    const sessions = await this.auth.listSessions(user.id);

    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      lastSeenAt: session.lastSeenAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post("password/reset/request")
  @HttpCode(202)
  async requestReset(
    @Body(new ZodValidationPipe(requestResetSchema)) dto: RequestResetDto,
  ) {
    await this.auth.requestPasswordReset(dto.email);
    return { sent: true };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post("password/reset/confirm")
  @HttpCode(204)
  async confirmReset(
    @Body(new ZodValidationPipe(confirmResetSchema)) dto: ConfirmResetDto,
  ) {
    await this.auth.confirmPasswordReset(dto);
  }
}

function contextOf(request: Request): SessionContext {
  return {
    userAgent: request.headers["user-agent"] ?? null,
    ipAddress: request.ip ?? null,
  };
}

function tokenFrom(request: Request): string | null {
  const cookies = request.cookies as Record<string, string> | undefined;
  return cookies?.[SESSION_COOKIE] ?? null;
}
