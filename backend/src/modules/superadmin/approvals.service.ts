import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
  type Page,
} from "src/persistence/ports/listings.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import {
  REPORTS_REPOSITORY,
  type ReportsRepository,
} from "src/persistence/ports/reports.repository";
import {
  GEOGRAPHY_REPOSITORY,
  type GeographyRepository,
} from "src/persistence/ports/geography.repository";
import {
  Forbidden,
  NotFound,
  ValidationFailed,
} from "src/common/errors/domain.errors";
import { assertTransition, expiryFrom } from "src/modules/listings/listinglifecycle";
import type { Listing } from "src/domain/listing.entity";
import type { User } from "src/domain/user.entity";

/**
 * Listing approval: every room is signed off by a super admin before it is
 * hosted.
 *
 * This reverses the position in docs/03-trust-and-safety.md, which had listings
 * publish immediately and be reviewed in parallel — deliberately, because
 * holding supply behind review costs listings. That trade is now the operator's
 * to make, so the queue below is built to be worked fast: ordered by wait time,
 * with the signals that decide the call attached to each row rather than
 * needing a second lookup.
 */
@Injectable()
export class ApprovalsService {
  constructor(
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(REPORTS_REPOSITORY) private readonly reports: ReportsRepository,
    @Inject(GEOGRAPHY_REPOSITORY)
    private readonly geography: GeographyRepository,
  ) {}

  /**
   * The queue, oldest submission first.
   *
   * FIFO on purpose: an owner whose room has waited three days should not be
   * overtaken by one submitted this morning. Sorting by anything else quietly
   * starves the tail.
   */
  async queue(page = 1, pageSize = 25): Promise<Page<ApprovalRow>> {
    const pending = await this.listings.findForAdmin({
      statuses: ["pendingapproval"],
      sort: "oldest",
      page,
      pageSize,
    });

    const rows: ApprovalRow[] = [];

    for (const listing of pending.items) {
      rows.push(await this.decorate(listing));
    }

    return { ...pending, items: rows };
  }

  async get(listingId: string): Promise<ApprovalRow> {
    const listing = await this.listings.findById(listingId);
    if (!listing || listing.deletedAt) throw new NotFound("Listing");

    return this.decorate(listing);
  }

  /**
   * Attaches the signals a reviewer needs to decide.
   *
   * Gathered here rather than in the controller so the queue list and the
   * detail view cannot disagree about why something was flagged.
   */
  private async decorate(listing: Listing): Promise<ApprovalRow> {
    const [owner, reportCount, city, locality] = await Promise.all([
      this.users.findById(listing.ownerId),
      this.reports.countForTarget("listing", listing.id),
      this.geography.findCityById(listing.cityId),
      this.geography.findLocalityById(listing.localityId),
    ]);

    const flags: string[] = [];

    if (listing.photos.length === 0) flags.push("No photos");
    if (listing.photos.length < 3) flags.push("Fewer than three photos");
    if (listing.description.trim().length < 60) flags.push("Very short description");
    if (!listing.addressLine) flags.push("No address given");
    if (owner && owner.trustLevel === "new") flags.push("First-time lister");
    if (owner && !owner.phoneVerifiedAt) flags.push("Phone not verified");
    if (listing.postedBy === "agent") flags.push("Posted by an agent");
    if (reportCount > 0) flags.push(`${reportCount} report(s) already filed`);

    const waitingHours = listing.submittedAt
      ? Math.floor(
          (Date.now() - new Date(listing.submittedAt).getTime()) / 3_600_000,
        )
      : 0;

    return {
      listing: { ...listing, city, locality },
      ownerName: owner?.name ?? "Unknown",
      ownerId: listing.ownerId,
      ownerTrustLevel: owner?.trustLevel ?? "new",
      ownerJoinedAt: owner?.createdAt ?? listing.createdAt,
      flags,
      waitingHours,
    };
  }

  /**
   * Approve and host the room.
   *
   * Publishing starts the 30-day clock here rather than at submission, so an
   * owner is not charged for the time their listing spent in our queue.
   */
  async approve(
    listingId: string,
    admin: User,
    note: string,
  ): Promise<Listing> {
    const listing = await this.mustBeReviewable(listingId);

    assertTransition(listing.status, "active");

    const now = new Date();

    const approved = await this.listings.update(listingId, {
      status: "active",
      approvedByUserId: admin.id,
      approvedAt: now.toISOString(),
      rejectedByUserId: null,
      rejectedAt: null,
      rejectionReason: null,
      publishedAt: now.toISOString(),
      expiresAt: expiryFrom(now),
      updatedAt: now.toISOString(),
    });

    /*
      Approving a room in a city nobody has opened yet would host something
      unreachable: cities default to inactive, and every public surface — the
      city list, the homepage, search — reads only active ones. The operator
      approving it plainly intends it to be found, so the city is opened with
      it rather than leaving a silently invisible listing.
    */
    await this.ensureCityActive(listing.cityId, admin);

    await this.record(admin, "approvelisting", listingId, note || "Approved");

    return approved;
  }

  /**
   * Reject with a reason the owner will read.
   *
   * The reason is mandatory and is shown verbatim. A rejection an owner cannot
   * act on produces either a resubmission of the same listing or a lost one,
   * and both cost more than the sentence it takes to explain.
   */
  async reject(
    listingId: string,
    admin: User,
    reason: string,
  ): Promise<Listing> {
    const trimmed = reason.trim();

    if (trimmed.length < 10) {
      throw new ValidationFailed("Tell the owner what needs fixing", {
        reason: "A reason of at least 10 characters is required",
      });
    }

    const listing = await this.mustBeReviewable(listingId);

    assertTransition(listing.status, "rejected");

    const now = new Date().toISOString();

    const rejected = await this.listings.update(listingId, {
      status: "rejected",
      rejectedByUserId: admin.id,
      rejectedAt: now,
      rejectionReason: trimmed,
      approvedByUserId: null,
      approvedAt: null,
      updatedAt: now,
    });

    await this.record(admin, "rejectlisting", listingId, trimmed);

    return rejected;
  }

  /**
   * Take a live listing down.
   *
   * Separate from reject: this one was already hosted and may have had seekers
   * contact it, so it is a moderation action against something public rather
   * than a decision not to publish.
   */
  async suspend(
    listingId: string,
    admin: User,
    reason: string,
  ): Promise<Listing> {
    const trimmed = reason.trim();

    if (trimmed.length < 10) {
      throw new ValidationFailed("Explain why this is being taken down", {
        reason: "A reason of at least 10 characters is required",
      });
    }

    const listing = await this.listings.findById(listingId);
    if (!listing || listing.deletedAt) throw new NotFound("Listing");

    assertTransition(listing.status, "suspended");

    const now = new Date().toISOString();

    const suspended = await this.listings.update(listingId, {
      status: "suspended",
      rejectionReason: trimmed,
      updatedAt: now,
    });

    await this.record(admin, "suspendlisting", listingId, trimmed);

    return suspended;
  }

  /** Restore a suspended listing straight to hosted. */
  async reinstate(
    listingId: string,
    admin: User,
    note: string,
  ): Promise<Listing> {
    const listing = await this.listings.findById(listingId);
    if (!listing || listing.deletedAt) throw new NotFound("Listing");

    if (listing.status !== "suspended") {
      throw new ValidationFailed("That listing is not suspended");
    }

    const now = new Date();

    /*
      Bypasses assertTransition on purpose: suspended is terminal in the table
      precisely so no ordinary flow can escape it, and this is the one
      deliberate exception. Writing it here, with the audit row below, keeps
      that exception visible rather than weakening the table for everyone.
    */
    const reinstated = await this.listings.update(listingId, {
      status: "active",
      rejectionReason: null,
      publishedAt: now.toISOString(),
      expiresAt: expiryFrom(now),
      updatedAt: now.toISOString(),
    });

    await this.record(admin, "reinstatelisting", listingId, note || "Reinstated");

    return reinstated;
  }

  /** Approve several at once, reporting per-listing outcomes. */
  async approveMany(
    listingIds: string[],
    admin: User,
  ): Promise<BulkOutcome[]> {
    const outcomes: BulkOutcome[] = [];

    for (const id of listingIds) {
      try {
        await this.approve(id, admin, "Bulk approved");
        outcomes.push({ listingId: id, ok: true });
      } catch (error) {
        // One bad row must not abandon the rest of the batch, and the reviewer
        // needs to know which ones did not go through.
        outcomes.push({
          listingId: id,
          ok: false,
          error: error instanceof Error ? error.message : "Failed",
        });
      }
    }

    return outcomes;
  }

  private async ensureCityActive(cityId: string, admin: User): Promise<void> {
    const city = await this.geography.findCityById(cityId);

    if (!city || city.isActive) return;

    await this.geography.updateCity(cityId, { isActive: true });

    await this.record(
      admin,
      "updatecity",
      cityId,
      `Opened ${city.name} because a listing there was approved`,
    );
  }

  private async mustBeReviewable(listingId: string): Promise<Listing> {
    const listing = await this.listings.findById(listingId);
    if (!listing || listing.deletedAt) throw new NotFound("Listing");

    if (listing.status !== "pendingapproval") {
      throw new ValidationFailed(
        `This listing is ${listing.status}, not waiting for approval`,
      );
    }

    return listing;
  }

  private async record(
    admin: User,
    action: string,
    targetId: string,
    note: string,
  ): Promise<void> {
    if (admin.role !== "superadmin") {
      throw new Forbidden("Only a super admin may decide listing approvals");
    }

    await this.reports.recordAction({
      id: randomUUID(),
      moderatorId: admin.id,
      targetType: "listing",
      targetId,
      action: action as never,
      note,
      createdAt: new Date().toISOString(),
    });
  }
}

export interface ApprovalRow {
  listing: Listing & {
    city: Awaited<ReturnType<GeographyRepository["findCityById"]>>;
    locality: Awaited<ReturnType<GeographyRepository["findLocalityById"]>>;
  };
  ownerId: string;
  ownerName: string;
  ownerTrustLevel: string;
  ownerJoinedAt: string;
  /** Why a reviewer should look closely. Empty means nothing stood out. */
  flags: string[];
  waitingHours: number;
}

export interface BulkOutcome {
  listingId: string;
  ok: boolean;
  error?: string;
}
