import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import type { User } from "src/domain/user.entity";
import { ModerationService } from "./moderation.service";

const noteSchema = z.object({
  note: z.string().trim().max(500).default(""),
});

const resolveSchema = z.object({
  outcome: z.enum(["upheld", "dismissed"]),
  note: z.string().trim().max(500).default(""),
});

@Controller("moderation")
@UseGuards(RolesGuard)
@Roles("moderator", "admin")
export class ModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Get("queue")
  async queue() {
    return this.moderation.queue();
  }

  @Get("auditlog")
  async auditLog() {
    return this.moderation.auditLog();
  }

  @Post("listings/:id/approve")
  async approve(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(noteSchema)) dto: z.infer<typeof noteSchema>,
    @CurrentUser() moderator: User,
  ) {
    return this.moderation.approveListing(id, moderator, dto.note);
  }

  @Post("listings/:id/suspend")
  async suspend(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(noteSchema)) dto: z.infer<typeof noteSchema>,
    @CurrentUser() moderator: User,
  ) {
    return this.moderation.suspendListing(id, moderator, dto.note);
  }

  @Post("users/:id/restrict")
  async restrict(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(noteSchema)) dto: z.infer<typeof noteSchema>,
    @CurrentUser() moderator: User,
  ) {
    return this.moderation.restrictUser(id, moderator, dto.note);
  }

  @Post("users/:id/unrestrict")
  async unrestrict(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(noteSchema)) dto: z.infer<typeof noteSchema>,
    @CurrentUser() moderator: User,
  ) {
    return this.moderation.unrestrictUser(id, moderator, dto.note);
  }

  @Post("reports/:id/resolve")
  async resolve(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(resolveSchema)) dto: z.infer<typeof resolveSchema>,
    @CurrentUser() moderator: User,
  ) {
    return this.moderation.resolveReport(id, moderator, dto.outcome, dto.note);
  }
}
