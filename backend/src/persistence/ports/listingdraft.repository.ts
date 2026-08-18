export const LISTING_DRAFT_REPOSITORY = Symbol("LISTING_DRAFT_REPOSITORY");

export interface ListingDraftRecord {
  data: Record<string, unknown>;
  updatedAt: string;
}

export interface ListingDraftRepository {
  find(userId: string): Promise<ListingDraftRecord | null>;
  save(
    userId: string,
    data: Record<string, unknown>,
  ): Promise<ListingDraftRecord>;
  discard(userId: string): Promise<void>;
}
