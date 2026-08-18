import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_PUBLIC } from "src/common/decorators/public.decorator";
import { AuthService } from "src/modules/auth/auth.service";
import { SESSION_COOKIE } from "src/modules/auth/cookie";
import type { User } from "src/domain/user.entity";

export interface AuthedRequest extends Request {
  user?: User;
}

/**
 * Resolves the session cookie to a user.
 *
 * Registered globally, so a route is protected unless it carries @Public().
 * Opt-out beats opt-in: a forgotten guard would fail open, whereas a forgotten
 * @Public breaks the route loudly and immediately.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const token = tokenFrom(request);

    if (!token) {
      if (isPublic) return true;

      throw new UnauthorizedException({
        code: "unauthenticated",
        message: "Sign in to continue",
      });
    }

    const user = await this.auth.resolveSession(token);

    if (!user) {
      if (isPublic) return true;

      throw new UnauthorizedException({
        code: "sessionexpired",
        message: "Your session has expired. Sign in again.",
      });
    }

    request.user = user;
    return true;
  }
}

function tokenFrom(request: Request): string | null {
  const cookies = request.cookies as Record<string, string> | undefined;
  const fromCookie = cookies?.[SESSION_COOKIE];
  if (fromCookie) return fromCookie;

  // Bearer is accepted too, so a native client or a script can authenticate
  // without a cookie jar.
  const header = request.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim() || null;
  }

  return null;
}
