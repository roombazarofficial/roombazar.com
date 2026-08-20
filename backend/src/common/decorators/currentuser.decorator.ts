import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthedRequest } from "src/common/guards/session.guard";
import type { User } from "src/domain/user.entity";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<AuthedRequest>();

    if (!request.user) {
      throw new Error(
        "CurrentUser used on an unguarded route. Use CurrentUserOptional instead.",
      );
    }

    return request.user;
  },
);

export const CurrentUserOptional = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User | null =>
    context.switchToHttp().getRequest<AuthedRequest>().user ?? null,
);
