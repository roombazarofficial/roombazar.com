import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRED_ROLES } from "src/common/decorators/roles.decorator";
import { NotFound } from "src/common/errors/domain.errors";
import type { AuthedRequest } from "./session.guard";
import type { UserRole } from "src/domain/user.entity";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(
      REQUIRED_ROLES,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<AuthedRequest>();

    if (!user || !required.includes(user.role)) {
      throw new NotFound("Route");
    }

    return true;
  }
}
