import { Body, Controller, Get, Inject, Param, Post, Query } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { SuperAdminOnly } from "src/common/decorators/superadmin.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { NotFound } from "src/common/errors/domain.errors";
import type { User } from "src/domain/user.entity";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
} from "src/persistence/ports/listings.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import {
  REPORTS_REPOSITORY,
  type ReportsRepository,
} from "src/persistence/ports/reports.repository";

const auditQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

const reportDecisionSchema = z.object({
  outcome: z.enum(["upheld", "dismissed"]),
  note: z.string().trim().min(3).max(500),
});

/**
 * Console overview and the audit trail.
 *
 * The dashboard leads with what is waiting on a human — rooms in the approval
 * queue and open reports — rather than with totals. A count of everything ever
 * listed tells an operator nothing about what to do next.
 */
@Controller("superadmin")
@SuperAdminOnly()
export class SuperAdminController {
  constructor(
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(REPORTS_REPOSITORY) private readonly reports: ReportsRepository,
  ) {}

  @Get("dashboard")
  async dashboard() {
    const [statusCounts, openReports, superAdmins, admins, moderators] =
      await Promise.all([
        this.listings.countByStatus(),
        this.reports.listOpen(),
        this.users.countByRole("superadmin"),
        this.users.countByRole("admin"),
        this.users.countByRole("moderator"),
      ]);

    // Oldest waiting item, so the dashboard can say how far behind the queue is
    // rather than only how long it is.
    const oldestPending = await this.listings.findForAdmin({
      statuses: ["pendingapproval"],
      sort: "oldest",
      page: 1,
      pageSize: 1,
    });

    const oldest = oldestPending.items[0];

    const waitingHours = oldest?.submittedAt
      ? Math.floor(
          (Date.now() - new Date(oldest.submittedAt).getTime()) / 3_600_000,
        )
      : 0;

    return {
      needsAction: {
        pendingApproval: statusCounts.pendingapproval ?? 0,
        openReports: openReports.length,
        oldestPendingHours: waitingHours,
      },
      listings: {
        pendingapproval: statusCounts.pendingapproval ?? 0,
        active: statusCounts.active ?? 0,
        rejected: statusCounts.rejected ?? 0,
        suspended: statusCounts.suspended ?? 0,
        taken: statusCounts.taken ?? 0,
        expired: statusCounts.expired ?? 0,
        paused: statusCounts.paused ?? 0,
        draft: statusCounts.draft ?? 0,
      },
      staff: { superAdmins, admins, moderators },
    };
  }

  /**
   * The append-only record of every action taken in this console.
   *
   * Read-only by design: there is no endpoint that edits or removes an entry,
   * because an audit log an operator can rewrite is not an audit log.
   */
  @Get("auditlog")
  async auditLog(
    @Query(new ZodValidationPipe(auditQuerySchema))
    query: z.infer<typeof auditQuerySchema>,
  ) {
    const actions = await this.reports.listActions(query.limit);

    const actors = await this.users.findManyByIds(
      actions.map((action) => action.moderatorId),
    );

    return actions.map((action) => ({
      ...action,
      moderatorName: actors.get(action.moderatorId)?.name ?? "Unknown",
    }));
  }

  /** Open reports, for the console's reports screen. */
  @Get("reports")
  async openReports() {
    return this.reports.listOpen();
  }

  @Get("reports/:id")
  async report(@Param("id") id: string) {
    const report = await this.reports.findById(id);
    if (!report) throw new NotFound("Report");
    return report;
  }

  @Post("reports/:id/resolve")
  async resolveReport(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reportDecisionSchema))
    dto: z.infer<typeof reportDecisionSchema>,
    @CurrentUser() admin: User,
  ) {
    const report = await this.reports.findById(id);
    if (!report) throw new NotFound("Report");
    const now = new Date().toISOString();
    const updated = await this.reports.update(id, {
      status: dto.outcome,
      resolvedAt: now,
    });
    await this.reports.recordAction({
      id: randomUUID(),
      moderatorId: admin.id,
      targetType: report.targetType,
      targetId: report.targetId,
      action: dto.outcome === "upheld" ? "upholdreport" : "dismissreport",
      note: dto.note,
      createdAt: now,
    });
    return updated;
  }
}
