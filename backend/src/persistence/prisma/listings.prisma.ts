import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { NotFound } from "src/common/errors/domain.errors";
import type { Listing, ListingStatus, RoomType } from "src/domain/listing.entity";
import type {
  ListingSearchCriteria,
  ListingAdminCriteria,
  ListingsRepository,
  Page,
} from "src/persistence/ports/listings.repository";
import { PrismaService } from "./prisma.service";
import { listingInclude, toDomainListing } from "./mappers";

@Injectable()
export class PrismaListingsRepository implements ListingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Listing | null> {
    const row = await this.prisma.listing.findUnique({
      where: { id },
      include: listingInclude,
    });

    return row ? toDomainListing(row) : null;
  }

  async findBySlug(slug: string): Promise<Listing | null> {
    const row = await this.prisma.listing.findUnique({
      where: { slug },
      include: listingInclude,
    });

    return row ? toDomainListing(row) : null;
  }

  async findByOwner(ownerId: string): Promise<Listing[]> {
    const rows = await this.prisma.listing.findMany({
      where: { createdById: ownerId, deletedAt: null },
      include: listingInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });

    return rows.map(toDomainListing);
  }

  async search(criteria: ListingSearchCriteria): Promise<Page<Listing>> {
    const where = this.buildWhere(criteria);

    const [totalItems, rows] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: listingInclude,
        orderBy: this.buildOrderBy(criteria.sort ?? "relevance"),
        skip: (criteria.page - 1) * criteria.pageSize,
        take: criteria.pageSize,
      }),
    ]);

    return {
      items: rows.map(toDomainListing),
      page: criteria.page,
      pageSize: criteria.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / criteria.pageSize)),
    };
  }

  async findForAdmin(criteria: ListingAdminCriteria): Promise<Page<Listing>> {
    const where: Prisma.ListingWhereInput = {
      deletedAt: null,
      ...(criteria.statuses?.length && { status: { in: criteria.statuses } }),
      ...(criteria.ownerId && { createdById: criteria.ownerId }),
      ...(criteria.citySlug && { city: { slug: criteria.citySlug } }),
      ...(criteria.query && {
        OR: [
          { title: { contains: criteria.query, mode: "insensitive" } },
          { description: { contains: criteria.query, mode: "insensitive" } },
          { slug: { contains: criteria.query, mode: "insensitive" } },
        ],
      }),
    };

    const orderBy: Prisma.ListingOrderByWithRelationInput[] =
      criteria.sort === "oldest"
        ? [{ submittedAt: "asc" }, { createdAt: "asc" }]
        : criteria.sort === "rentlow"
          ? [{ rentPaise: "asc" }]
          : criteria.sort === "renthigh"
            ? [{ rentPaise: "desc" }]
            : [{ createdAt: "desc" }];

    const [totalItems, rows] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: listingInclude,
        orderBy,
        skip: (criteria.page - 1) * criteria.pageSize,
        take: criteria.pageSize,
      }),
    ]);

    return {
      items: rows.map(toDomainListing),
      page: criteria.page,
      pageSize: criteria.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / criteria.pageSize)),
    };
  }

  async countByStatus(): Promise<Record<string, number>> {
    const rows = await this.prisma.listing.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
    });

    return Object.fromEntries(
      rows.map((row) => [row.status, row._count._all]),
    );
  }

  private buildWhere(
    criteria: ListingSearchCriteria,
  ): Prisma.ListingWhereInput {
    const where: Prisma.ListingWhereInput = {
      status: "active",
      deletedAt: null,
    };

    if (criteria.citySlug) where.city = { slug: criteria.citySlug };

    if (criteria.localitySlugs?.length) {
      where.locality = { slug: { in: criteria.localitySlugs } };
    }

    if (criteria.roomTypes?.length) {
      where.roomCategory = { in: criteria.roomTypes as RoomType[] };
    }

    if (criteria.furnishing?.length) {
      where.furnishing = {
        in: criteria.furnishing as Prisma.EnumFurnishingFilter["in"],
      };
    }

    if (criteria.postedBy?.length) {
      where.postedBy = {
        in: criteria.postedBy as Prisma.EnumPostedByFilter["in"],
      };
    }

    if (criteria.minRentPaise !== undefined || criteria.maxRentPaise !== undefined) {
      where.rentPaise = {
        ...(criteria.minRentPaise !== undefined && { gte: criteria.minRentPaise }),
        ...(criteria.maxRentPaise !== undefined && { lte: criteria.maxRentPaise }),
      };
    }

    if (criteria.availableFrom) {
      where.availableFrom = { lte: new Date(criteria.availableFrom) };
    }

    if (criteria.amenitySlugs?.length) {
      where.AND = criteria.amenitySlugs.map((slug) => ({
        amenities: { some: { amenity: { slug } } },
      }));
    }

    if (criteria.occupancy !== undefined) {
      where.roomCategory = {
        in: categoriesForOccupancy(criteria.occupancy),
      };
    }

    return where;
  }

  private buildOrderBy(
    sort: NonNullable<ListingSearchCriteria["sort"]>,
  ): Prisma.ListingOrderByWithRelationInput[] {
    switch (sort) {
      case "rentlow":
        return [{ rentPaise: "asc" }, { publishedAt: "desc" }];
      case "renthigh":
        return [{ rentPaise: "desc" }, { publishedAt: "desc" }];
      case "newest":
        return [{ publishedAt: "desc" }];
      case "relevance":
      default:
        return [{ rankScore: "desc" }, { publishedAt: "desc" }];
    }
  }

  async findSimilar(listing: Listing, limit: number): Promise<Listing[]> {
    const base: Prisma.ListingWhereInput = {
      status: "active",
      deletedAt: null,
      id: { not: listing.id },
    };

    const sameLocality = await this.prisma.listing.findMany({
      where: { ...base, localityId: listing.localityId },
      include: listingInclude,
      orderBy: { rankScore: "desc" },
      take: limit,
    });

    if (sameLocality.length >= limit) {
      return sameLocality.map(toDomainListing);
    }

    const elsewhere = await this.prisma.listing.findMany({
      where: {
        ...base,
        cityId: listing.cityId,
        localityId: { not: listing.localityId },
      },
      include: listingInclude,
      orderBy: { rankScore: "desc" },
      take: limit - sameLocality.length,
    });

    return [...sameLocality, ...elsewhere].map(toDomainListing);
  }

  async create(listing: Listing): Promise<Listing> {
    const created = await this.prisma.$transaction(async (tx) => {
      const organization = await this.ensurePersonalOrganization(tx, listing.ownerId);

      const propertyType = await tx.propertyType.findFirst({
        where: { code: propertyTypeForRoomCategory(listing.roomType) },
      });

      if (!propertyType) {
        throw new NotFound("PropertyType (has the seed been run?)");
      }

      const property = await tx.property.create({
        data: {
          organizationId: organization.id,
          propertyTypeId: propertyType.id,
          name: listing.title,
          status: "active",
          address: {
            create: {
              localityId: listing.localityId,
              cityId: listing.cityId,
              addressLine: listing.addressLine,
              latitude: listing.lat,
              longitude: listing.lng,
            },
          },
        },
      });

      const amenityIds = await this.resolveAmenityIds(tx, listing.amenitySlugs);

      return tx.listing.create({
        data: {
          id: listing.id,
          slug: listing.slug,
          propertyId: property.id,
          createdById: listing.ownerId,
          status: listing.status,
          postedBy: listing.postedBy,
          roomCategory: listing.roomType,
          title: listing.title,
          description: listing.description,
          furnishing: listing.furnishing,
          rentPaise: listing.rentPaise,
          depositPaise: listing.depositPaise,
          maintenancePaise: listing.maintenancePaise,
          billsIncluded: listing.billsIncluded,
          negotiable: listing.negotiable,
          cityId: listing.cityId,
          localityId: listing.localityId,
          areaSqft: listing.areaSqft,
          floorNumber: listing.floor,
          totalFloors: listing.totalFloors,
          availableFrom: new Date(listing.availableFrom),
          minStayMonths: listing.minStayMonths,
          preferredTenant: listing.preferredTenant,
          rankScore: listing.rankScore,
          submittedAt: listing.submittedAt ? new Date(listing.submittedAt) : null,
          approvedAt: listing.approvedAt ? new Date(listing.approvedAt) : null,
          approvedByUserId: listing.approvedByUserId,
          rejectedAt: listing.rejectedAt ? new Date(listing.rejectedAt) : null,
          rejectedByUserId: listing.rejectedByUserId,
          rejectionReason: listing.rejectionReason,
          publishedAt: listing.publishedAt ? new Date(listing.publishedAt) : null,
          expiresAt: listing.expiresAt ? new Date(listing.expiresAt) : null,
          amenities: {
            create: amenityIds.map((amenityId) => ({ amenityId })),
          },
          media: {
            create: listing.photos.map((photo) => ({
              position: photo.position,
              media: {
                create: {
                  id: photo.id,
                  uploadedById: listing.ownerId,
                  objectKey: photo.objectKey,
                  secureUrl: photo.secureUrl,
                  kind: photo.kind,
                  format: photo.format,
                  contentType: photo.contentType,
                  sizeBytes: photo.sizeBytes,
                  width: photo.width,
                  height: photo.height,
                  durationSeconds: photo.durationSeconds,
                  blurhash: photo.blurhash,
                  moderationState: photo.moderationState,
                },
              },
            })),
          },
        },
        include: listingInclude,
      });
    });

    return toDomainListing(created);
  }

  async update(id: string, patch: Partial<Listing>): Promise<Listing> {
    const existing = await this.prisma.listing.findUnique({
      where: { id },
      select: { id: true, propertyId: true },
    });

    if (!existing) throw new NotFound("Listing");

    const updated = await this.prisma.$transaction(async (tx) => {
      if (
        patch.addressLine !== undefined ||
        patch.lat !== undefined ||
        patch.lng !== undefined
      ) {
        await tx.propertyAddress.update({
          where: { propertyId: existing.propertyId },
          data: {
            ...(patch.addressLine !== undefined && { addressLine: patch.addressLine }),
            ...(patch.lat !== undefined && { latitude: patch.lat }),
            ...(patch.lng !== undefined && { longitude: patch.lng }),
          },
        });
      }

      if (patch.amenitySlugs !== undefined) {
        const amenityIds = await this.resolveAmenityIds(tx, patch.amenitySlugs);

        await tx.listingAmenity.deleteMany({ where: { listingId: id } });
        await tx.listingAmenity.createMany({
          data: amenityIds.map((amenityId) => ({ listingId: id, amenityId })),
        });
      }

      return tx.listing.update({
        where: { id },
        data: {
          ...(patch.title !== undefined && { title: patch.title }),
          ...(patch.description !== undefined && { description: patch.description }),
          ...(patch.roomType !== undefined && { roomCategory: patch.roomType }),
          ...(patch.furnishing !== undefined && { furnishing: patch.furnishing }),
          ...(patch.status !== undefined && { status: patch.status }),
          ...(patch.rentPaise !== undefined && { rentPaise: patch.rentPaise }),
          ...(patch.depositPaise !== undefined && { depositPaise: patch.depositPaise }),
          ...(patch.maintenancePaise !== undefined && {
            maintenancePaise: patch.maintenancePaise,
          }),
          ...(patch.billsIncluded !== undefined && { billsIncluded: patch.billsIncluded }),
          ...(patch.negotiable !== undefined && { negotiable: patch.negotiable }),
          ...(patch.areaSqft !== undefined && { areaSqft: patch.areaSqft }),
          ...(patch.floor !== undefined && { floorNumber: patch.floor }),
          ...(patch.totalFloors !== undefined && { totalFloors: patch.totalFloors }),
          ...(patch.availableFrom !== undefined && {
            availableFrom: new Date(patch.availableFrom),
          }),
          ...(patch.minStayMonths !== undefined && { minStayMonths: patch.minStayMonths }),
          ...(patch.preferredTenant !== undefined && {
            preferredTenant: patch.preferredTenant,
          }),
          ...(patch.rankScore !== undefined && { rankScore: patch.rankScore }),
          ...(patch.submittedAt !== undefined && {
            submittedAt: patch.submittedAt ? new Date(patch.submittedAt) : null,
          }),
          ...(patch.approvedAt !== undefined && {
            approvedAt: patch.approvedAt ? new Date(patch.approvedAt) : null,
          }),
          ...(patch.approvedByUserId !== undefined && {
            approvedByUserId: patch.approvedByUserId,
          }),
          ...(patch.rejectedAt !== undefined && {
            rejectedAt: patch.rejectedAt ? new Date(patch.rejectedAt) : null,
          }),
          ...(patch.rejectedByUserId !== undefined && {
            rejectedByUserId: patch.rejectedByUserId,
          }),
          ...(patch.rejectionReason !== undefined && {
            rejectionReason: patch.rejectionReason,
          }),
          ...(patch.publishedAt !== undefined && {
            publishedAt: patch.publishedAt ? new Date(patch.publishedAt) : null,
          }),
          ...(patch.expiresAt !== undefined && {
            expiresAt: patch.expiresAt ? new Date(patch.expiresAt) : null,
          }),
          ...(patch.deletedAt !== undefined && {
            deletedAt: patch.deletedAt ? new Date(patch.deletedAt) : null,
          }),
        },
        include: listingInclude,
      });
    });

    return toDomainListing(updated);
  }

  async setStatus(id: string, status: ListingStatus): Promise<Listing> {
    const row = await this.prisma.listing.update({
      where: { id },
      data: { status },
      include: listingInclude,
    });

    return toDomainListing(row);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  async countActiveByOwner(ownerId: string): Promise<number> {
    return this.prisma.listing.count({
      where: {
        createdById: ownerId,
        deletedAt: null,
        status: { in: ["active", "paused"] },
      },
    });
  }

  async findExpired(now: string): Promise<Listing[]> {
    const rows = await this.prisma.listing.findMany({
      where: {
        status: "active",
        expiresAt: { not: null, lte: new Date(now) },
      },
      include: listingInclude,
    });

    return rows.map(toDomainListing);
  }

  async findActiveInCity(cityId: string): Promise<Listing[]> {
    const rows = await this.prisma.listing.findMany({
      where: { cityId, status: "active", deletedAt: null },
      include: listingInclude,
    });

    return rows.map(toDomainListing);
  }

  private async ensurePersonalOrganization(
    tx: Prisma.TransactionClient,
    userId: string,
  ) {
    const existing = await tx.organization.findFirst({
      where: { ownerUserId: userId, isPersonal: true, deletedAt: null },
    });

    if (existing) return existing;

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    return tx.organization.create({
      data: {
        ownerUserId: userId,
        name: user?.name ? `${user.name} (personal)` : "Personal",
        isPersonal: true,
        status: "active",
      },
    });
  }

  private async resolveAmenityIds(
    tx: Prisma.TransactionClient,
    slugs: string[],
  ): Promise<string[]> {
    if (slugs.length === 0) return [];

    const rows = await tx.amenity.findMany({
      where: { slug: { in: slugs } },
      select: { id: true },
    });

    return rows.map((row) => row.id);
  }
}

function categoriesForOccupancy(people: number): RoomType[] {
  const capacity: Record<RoomType, number> = {
    pgbed: 1,
    hostelbed: 1,
    sharedroom: 1,
    singleroom: 2,
    rk1: 2,
    bhk1: 3,
    bhk2: 4,
    bhk3plus: 6,
  };

  return (Object.keys(capacity) as RoomType[]).filter(
    (category) => capacity[category] >= people,
  );
}

function propertyTypeForRoomCategory(category: RoomType): string {
  switch (category) {
    case "pgbed":
      return "pg";
    case "hostelbed":
      return "hostel";
    case "bhk1":
    case "bhk2":
    case "bhk3plus":
    case "rk1":
      return "apartment";
    default:
      return "independenthouse";
  }
}
