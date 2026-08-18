import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  REPORTS_REPOSITORY,
  type ReportsRepository,
} from "src/persistence/ports/reports.repository";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
} from "src/persistence/ports/listings.repository";
import { RateLimited, ValidationFailed } from "src/common/errors/domain.errors";
import { policyFor } from "src/common/trustlevels";
import type { Report, ReportReason, ReportTargetType } from "src/domain/report.entity";
import type { User } from "src/domain/user.entity";

const ALREADY_TAKEN_THRESHOLD = 3;

@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPORTS_REPOSITORY) private readonly reports: ReportsRepository,
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
  ) {}

  async create(
    reporter: User,
    input: {
      targetType: ReportTargetType;
      targetId: string;
      reason: ReportReason;
      detail: string | null;
    },
  ): Promise<Report> {
    const policy = policyFor(reporter.trustLevel);

    if (policy.maxReportsPerDay === 0) {
      throw new RateLimited("Your account cannot submit reports right now.");
    }

    if (input.targetType === "listing") {
      const listing = await this.listings.findById(input.targetId);
      if (!listing) throw new ValidationFailed("That listing no longer exists");

      if (listing.ownerId === reporter.id) {
        throw new ValidationFailed("You cannot report your own listing");
      }
    }

    const report = await this.reports.create({
      id: randomUUID(),
      reporterId: reporter.id,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      detail: input.detail,
      status: "open",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });

    await this.maybeAutoMarkTaken(input);

    return report;
  }

  private async maybeAutoMarkTaken(input: {
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
  }): Promise<void> {
    if (input.targetType !== "listing" || input.reason !== "alreadytaken") {
      return;
    }

    const count = await this.reports.countForTarget(
      "listing",
      input.targetId,
      "alreadytaken",
    );

    if (count < ALREADY_TAKEN_THRESHOLD) return;

    const listing = await this.listings.findById(input.targetId);
    if (!listing || listing.status !== "active") return;

    await this.listings.setStatus(input.targetId, "taken");
  }
}
