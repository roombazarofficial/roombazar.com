import { MemoryReviewsRepository } from "./reviews.memory";
import type { UpsertReviewInput } from "src/persistence/ports/reviews.repository";

function review(overrides: Partial<UpsertReviewInput>): UpsertReviewInput {
  return {
    listingId: "listing-1",
    userId: "user-1",
    overallRating: 5,
    cleanliness: null,
    locationScore: null,
    valueForMoney: null,
    accuracy: null,
    hostBehavior: null,
    body: "Great place",
    photos: [],
    ...overrides,
  };
}

describe("MemoryReviewsRepository", () => {
  it("summarises an empty listing as zero reviews with no average", async () => {
    const repo = new MemoryReviewsRepository();

    const summary = await repo.summaryForListing("listing-1");

    expect(summary).toEqual({
      count: 0,
      average: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  });

  it("computes the average and star distribution across reviews", async () => {
    const repo = new MemoryReviewsRepository();

    await repo.upsert(review({ userId: "user-1", overallRating: 5 }));
    await repo.upsert(review({ userId: "user-2", overallRating: 3 }));
    await repo.upsert(review({ userId: "user-3", overallRating: 5 }));

    const summary = await repo.summaryForListing("listing-1");

    expect(summary.count).toBe(3);
    expect(summary.average).toBeCloseTo((5 + 3 + 5) / 3);
    expect(summary.distribution).toEqual({ 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 });
  });

  it("only counts reviews for the requested listing", async () => {
    const repo = new MemoryReviewsRepository();

    await repo.upsert(review({ listingId: "listing-1", userId: "user-1" }));
    await repo.upsert(review({ listingId: "listing-2", userId: "user-1" }));

    const summary = await repo.summaryForListing("listing-1");

    expect(summary.count).toBe(1);
  });

  it("upserting a second time for the same (listing, user) replaces rather than duplicates", async () => {
    const repo = new MemoryReviewsRepository();

    await repo.upsert(
      review({ userId: "user-1", overallRating: 2, body: "Meh at first" }),
    );
    await repo.upsert(
      review({ userId: "user-1", overallRating: 5, body: "Actually great" }),
    );

    const summary = await repo.summaryForListing("listing-1");
    const mine = await repo.findByUserAndListing("user-1", "listing-1");

    expect(summary.count).toBe(1);
    expect(mine?.overallRating).toBe(5);
    expect(mine?.body).toBe("Actually great");
  });

  it("sorts by highest/lowest/newest as requested", async () => {
    const repo = new MemoryReviewsRepository();

    await repo.upsert(review({ userId: "user-1", overallRating: 2 }));
    await repo.upsert(review({ userId: "user-2", overallRating: 5 }));
    await repo.upsert(review({ userId: "user-3", overallRating: 3 }));

    const highest = await repo.listForListing("listing-1", "highest");
    const lowest = await repo.listForListing("listing-1", "lowest");

    expect(highest.map((r) => r.overallRating)).toEqual([5, 3, 2]);
    expect(lowest.map((r) => r.overallRating)).toEqual([2, 3, 5]);
  });

  it("keeps platform feedback separate from listing reviews", async () => {
    const repo = new MemoryReviewsRepository();

    await repo.upsert(review({ userId: "user-1" }));
    const feedback = await repo.createFeedback({
      userId: "user-1",
      sentiment: "good",
      category: "search",
      message: "Nice",
    });

    const summary = await repo.summaryForListing("listing-1");

    expect(summary.count).toBe(1);
    expect(feedback.sentiment).toBe("good");
  });
});
