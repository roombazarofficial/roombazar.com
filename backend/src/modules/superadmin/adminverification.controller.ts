import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { SuperAdminOnly } from "src/common/decorators/superadmin.decorator";
import { NotFound } from "src/common/errors/domain.errors";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import type { User } from "src/domain/user.entity";
import {
  REPORTS_REPOSITORY,
  type ReportsRepository,
} from "src/persistence/ports/reports.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import { PrismaService } from "src/persistence/prisma/prisma.service";

const decisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().min(3).max(500),
});

@Controller("superadmin/verifications")
@SuperAdminOnly()
export class AdminVerificationController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(REPORTS_REPOSITORY) private readonly reports: ReportsRepository,
  ) {}

  @Get()
  async list() {
    return this.prisma.userVerification.findMany({
      where: { status: "pending" },
      include: {
        user: { select: { id: true, name: true, email: true, trustLevel: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    const request = await this.prisma.userVerification.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, trustLevel: true } },
      },
    });
    if (!request) throw new NotFound("Verification request");
    return request;
  }

  @Post(":id/decision")
  async decide(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(decisionSchema))
    dto: z.infer<typeof decisionSchema>,
    @CurrentUser() admin: User,
  ) {
    const request = await this.prisma.userVerification.findUnique({ where: { id } });
    if (!request) throw new NotFound("Verification request");

    const decidedAt = new Date();
    const updated = await this.prisma.userVerification.update({
      where: { id },
      data: {
        status: dto.decision,
        reviewerNote: dto.note,
        decidedAt,
      },
    });

    if (dto.decision === "approved") {
      if (request.kind === "governmentid") {
        await this.users.setTrustLevel(request.userId, "verified");
      }
      if (request.kind === "email") {
        await this.prisma.user.update({
          where: { id: request.userId },
          data: { emailVerifiedAt: decidedAt },
        });
      }
    }

    await this.reports.recordAction({
      id: randomUUID(),
      moderatorId: admin.id,
      targetType: "user",
      targetId: request.userId,
      action: "updateuser",
      note: `${dto.decision} ${request.kind} verification: ${dto.note}`,
      createdAt: decidedAt.toISOString(),
    });

    return updated;
  }
}
