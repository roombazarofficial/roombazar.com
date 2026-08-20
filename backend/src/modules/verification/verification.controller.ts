import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { z } from "zod";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import type { User, VerificationKind } from "src/domain/user.entity";
import { PrismaService } from "src/persistence/prisma/prisma.service";

const startSchema = z.object({
  kind: z.enum(["email", "governmentid", "ownership"]),
});

@Controller("verification")
export class VerificationController {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async status(@CurrentUser() user: User) {
    const requests = await this.prisma.userVerification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return {
      completed: user.verifications,
      trustLevel: user.trustLevel,
      available: (["email", "governmentid", "ownership"] as VerificationKind[])
        .filter((kind) => !user.verifications.includes(kind)),
      requests,
    };
  }

  @Post("start")
  async start(
    @Body(new ZodValidationPipe(startSchema)) dto: z.infer<typeof startSchema>,
    @CurrentUser() user: User,
  ) {
    return this.prisma.userVerification.upsert({
      where: { userId_kind: { userId: user.id, kind: dto.kind } },
      update: {
        status: "pending",
        reviewerNote: null,
        decidedAt: null,
      },
      create: {
        userId: user.id,
        kind: dto.kind,
        status: "pending",
      },
    });
  }
}
