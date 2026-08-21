import { Injectable } from "@nestjs/common";
import type {
  SavedRepository,
  SavedSearch,
} from "src/persistence/ports/saved.repository";
import type { Listing } from "src/domain/listing.entity";
import { PrismaService } from "./prisma.service";
import { listingInclude, toDomainListing } from "./mappers";

@Injectable()
export class PrismaSavedRepository implements SavedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listSavedListingIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.savedListing.findMany({
      where: { userId },
      select: { listingId: true },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => row.listingId);
  }

  async listSavedListings(userId: string): Promise<Listing[]> {
    const rows = await this.prisma.savedListing.findMany({
      where: { userId, listing: { deletedAt: null } },
      include: { listing: { include: listingInclude } },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => toDomainListing(row.listing));
  }

  async saveListing(userId: string, listingId: string): Promise<void> {
    await this.prisma.savedListing.upsert({
      where: { userId_listingId: { userId, listingId } },
      update: {},
      create: { userId, listingId },
    });
  }

  async unsaveListing(userId: string, listingId: string): Promise<void> {
    await this.prisma.savedListing.deleteMany({ where: { userId, listingId } });
  }

  async listSearches(userId: string): Promise<SavedSearch[]> {
    const rows = await this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      label: row.label,
      query: row.query,
      notifyFrequency: row.notifyFrequency,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async createSearch(search: SavedSearch): Promise<SavedSearch> {
    const row = await this.prisma.savedSearch.create({
      data: {
        id: search.id,
        userId: search.userId,
        label: search.label,
        query: search.query,
        notifyFrequency: search.notifyFrequency,
      },
    });

    return {
      id: row.id,
      userId: row.userId,
      label: row.label,
      query: row.query,
      notifyFrequency: row.notifyFrequency,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async deleteSearch(userId: string, searchId: string): Promise<void> {
    await this.prisma.savedSearch.deleteMany({
      where: { id: searchId, userId },
    });
  }
}
