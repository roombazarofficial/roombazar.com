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
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import { NotFound, ValidationFailed } from "src/common/errors/domain.errors";
import type { ModerationActionKind } from "src/domain/report.entity";
import type { User } from "src/domain/user.entity";

@Injectable()
export class ModerationService {
  constructor(
    @Inject(REPORTS_REPOSITORY) private readonly reports: ReportsRepository,
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {}

  async queue() {
    return this.reports.listOpen();
  }

  async auditLog(limit = 100) {
    return this.reports.listActions(limit);
  }

  async approveListing(listingId: string, moderator: User, note: string) {
    const listing = await this.listings.findById(listingId);
    if (!listing) throw new NotFound("Listing");

    return this.record(moderator, "approvelisting", "listing", listingId, note);
  }

  async suspendListing(listingId: string, moderator: User, note: string) {
    if (note.trim().length < 10) {
      throw new ValidationFailed("Explain why, in at least a few words", {
        note: "A reason is required to suspend a listing",
      });
    }

    const listing = await this.listings.findById(listingId);
    if (!listing) throw new NotFound("Listing");

    await this.listings.setStatus(listingId, "suspended");

    return this.record(moderator, "suspendlisting", "listing", listingId, note);
  }

  async restrictUser(userId: string, moderator: User, note: string) {
    if (note.trim().length < 10) {
      throw new ValidationFailed("Explain why, in at least a few words", {
        note: "A reason is required to restrict an account",
      });
    }

    const user = await this.users.findById(userId);
    if (!user) throw new NotFound("User");

    await this.users.setTrustLevel(userId, "restricted");

    return this.record(moderator, "restrictuser", "user", userId, note);
  }

  async unrestrictUser(userId: string, moderator: User, note: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFound("User");

    await this.users.setTrustLevel(
      userId,
      user.verifications.includes("governmentid") ? "verified" : "new",
    );

    return this.record(moderator, "unrestrictuser", "user", userId, note);
  }

  async resolveReport(
    reportId: string,
    moderator: User,
    outcome: "upheld" | "dismissed",
    note: string,
  ) {
    const report = await this.reports.findById(reportId);
    if (!report) throw new NotFound("Report");

    await this.reports.update(reportId, {
      status: outcome,
      resolvedAt: new Date().toISOString(),
    });

    return this.record(
      moderator,
      outcome === "upheld" ? "upholdreport" : "dismissreport",
      report.targetType,
      report.targetId,
      note,
    );
  }

  private async record(
    moderator: User,
    action: ModerationActionKind,
    targetType: "listing" | "user" | "message",
    targetId: string,
    note: string,
  ) {
    return this.reports.recordAction({
      id: randomUUID(),
      moderatorId: moderator.id,
      targetType,
      targetId,
      action,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    });
  }
}
