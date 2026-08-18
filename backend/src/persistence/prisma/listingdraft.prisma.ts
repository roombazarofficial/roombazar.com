import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type {
  ListingDraftRecord,
  ListingDraftRepository,
} from "src/persistence/ports/listingdraft.repository";
import { PrismaService } from "./prisma.service";

@Injectable()
export class PrismaListingDraftRepository implements ListingDraftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(userId: string): Promise<ListingDraftRecord | null> {
    const row = await this.prisma.listingDraft.findUnique({
      where: { userId },
    });

    if (!row) return null;

    return {
      data: (row.data ?? {}) as Record<string, unknown>,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async save(
    userId: string,
    data: Record<string, unknown>,
  ): Promise<ListingDraftRecord> {
    const payload = data as Prisma.InputJsonValue;

    const row = await this.prisma.listingDraft.upsert({
      where: { userId },
      update: { data: payload },
      create: { userId, data: payload },
    });

    return {
      data: (row.data ?? {}) as Record<string, unknown>,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async discard(userId: string): Promise<void> {
    await this.prisma.listingDraft.deleteMany({ where: { userId } });
  }
}
