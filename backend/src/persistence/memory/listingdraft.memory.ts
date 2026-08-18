import { Injectable } from "@nestjs/common";
import type {
  ListingDraftRecord,
  ListingDraftRepository,
} from "src/persistence/ports/listingdraft.repository";

@Injectable()
export class MemoryListingDraftRepository implements ListingDraftRepository {
  private readonly drafts = new Map<string, ListingDraftRecord>();

  async find(userId: string): Promise<ListingDraftRecord | null> {
    return this.drafts.get(userId) ?? null;
  }

  async save(
    userId: string,
    data: Record<string, unknown>,
  ): Promise<ListingDraftRecord> {
    const record: ListingDraftRecord = {
      data,
      updatedAt: new Date().toISOString(),
    };

    this.drafts.set(userId, record);
    return record;
  }

  async discard(userId: string): Promise<void> {
    this.drafts.delete(userId);
  }
}
