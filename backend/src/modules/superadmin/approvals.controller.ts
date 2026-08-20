import { Body, Controller, Get, HttpCode, Param, Post, Query } from "@nestjs/common";
import { z } from "zod";
import { SuperAdminOnly } from "src/common/decorators/superadmin.decorator";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import type { User } from "src/domain/user.entity";
import { ApprovalsService } from "./approvals.service";

const pagingSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const noteSchema = z.object({
  note: z.string().trim().max(500).default(""),
});

const reasonSchema = z.object({
  reason: z.string().trim().min(10).max(500),
});

const bulkSchema = z.object({
  listingIds: z.array(z.string().min(1)).min(1).max(50),
});

/**
 * Listing approval — the gate every room passes through before it is hosted.
 *
 * Super admin only, not admin. Approving a listing is what puts a room in front
 * of the public, so it is deliberately not something a day-to-day operator can
 * do; they get the moderation queue instead.
 */
@Controller("superadmin/approvals")
@SuperAdminOnly()
export class ApprovalsController {
  constructor(private readonly approvals: ApprovalsService) {}

  /** The queue, oldest first. */
  @Get()
  async queue(
    @Query(new ZodValidationPipe(pagingSchema)) query: z.infer<typeof pagingSchema>,
  ) {
    return this.approvals.queue(query.page, query.pageSize);
  }

  /** One listing with its flags, for the review screen. */
  @Get(":id")
  async detail(@Param("id") id: string) {
    return this.approvals.get(id);
  }

  @Post(":id/approve")
  @HttpCode(200)
  async approve(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(noteSchema)) dto: z.infer<typeof noteSchema>,
    @CurrentUser() admin: User,
  ) {
    return this.approvals.approve(id, admin, dto.note);
  }

  /** Reject with a reason. The owner reads it verbatim. */
  @Post(":id/reject")
  @HttpCode(200)
  async reject(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reasonSchema)) dto: z.infer<typeof reasonSchema>,
    @CurrentUser() admin: User,
  ) {
    return this.approvals.reject(id, admin, dto.reason);
  }

  /** Take down a listing that is already live. */
  @Post(":id/suspend")
  @HttpCode(200)
  async suspend(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reasonSchema)) dto: z.infer<typeof reasonSchema>,
    @CurrentUser() admin: User,
  ) {
    return this.approvals.suspend(id, admin, dto.reason);
  }

  @Post(":id/reinstate")
  @HttpCode(200)
  async reinstate(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(noteSchema)) dto: z.infer<typeof noteSchema>,
    @CurrentUser() admin: User,
  ) {
    return this.approvals.reinstate(id, admin, dto.note);
  }

  /**
   * Bulk approve. Returns a per-listing outcome rather than a single status,
   * because one bad row in a batch of forty must not hide the other
   * thirty-nine, nor abandon them.
   */
  @Post("bulk/approve")
  @HttpCode(200)
  async approveMany(
    @Body(new ZodValidationPipe(bulkSchema)) dto: z.infer<typeof bulkSchema>,
    @CurrentUser() admin: User,
  ) {
    const outcomes = await this.approvals.approveMany(dto.listingIds, admin);

    return {
      outcomes,
      approved: outcomes.filter((o) => o.ok).length,
      failed: outcomes.filter((o) => !o.ok).length,
    };
  }
}
