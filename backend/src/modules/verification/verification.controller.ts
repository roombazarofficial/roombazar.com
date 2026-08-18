import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { z } from "zod";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import type { User, VerificationKind } from "src/domain/user.entity";

const startSchema = z.object({
  kind: z.enum(["email", "governmentid", "ownership"]),
});

@Controller("verification")
export class VerificationController {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {}

  @Get()
  async status(@CurrentUser() user: User) {
    return {
      completed: user.verifications,
      trustLevel: user.trustLevel,
      available: (["email", "governmentid", "ownership"] as VerificationKind[])
        .filter((kind) => !user.verifications.includes(kind)),
    };
  }

  @Post("start")
  async start(
    @Body(new ZodValidationPipe(startSchema)) dto: z.infer<typeof startSchema>,
    @CurrentUser() user: User,
  ) {
    return {
      kind: dto.kind,
      status: "notimplemented",
      userId: user.id,
    };
  }
}
