import { Injectable } from "@nestjs/common";
import type { Amenity, City, Locality } from "src/domain/geography.entity";
import type { GeographyRepository } from "src/persistence/ports/geography.repository";
import { PrismaService } from "./prisma.service";
import { toDomainAmenity, toDomainCity, toDomainLocality } from "./mappers";

@Injectable()
export class PrismaGeographyRepository implements GeographyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listCities(): Promise<City[]> {
    const rows = await this.prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { state: { select: { name: true } } },
    });

    return rows.map((row) => ({ ...toDomainCity(row), state: row.state.name }));
  }

  async findCityBySlug(slug: string): Promise<City | null> {
    const row = await this.prisma.city.findUnique({
      where: { slug },
      include: { state: { select: { name: true } } },
    });

    if (!row) return null;

    return { ...toDomainCity(row), state: row.state.name };
  }

  async listLocalities(cityId: string): Promise<Locality[]> {
    const rows = await this.prisma.locality.findMany({
      where: { cityId },
      orderBy: { name: "asc" },
    });

    return rows.map(toDomainLocality);
  }

  async findLocalityBySlug(
    cityId: string,
    slug: string,
  ): Promise<Locality | null> {
    const row = await this.prisma.locality.findUnique({
      where: { cityId_slug: { cityId, slug } },
    });

    return row ? toDomainLocality(row) : null;
  }

  async resolveLocality(cityId: string, query: string): Promise<Locality | null> {
    const needle = normalise(query);
    if (!needle) return null;

    const rows = await this.prisma.locality.findMany({ where: { cityId } });

    const match = rows.find((row) =>
      [row.name, row.slug, ...row.aliases].some(
        (candidate) => normalise(candidate) === needle,
      ),
    );

    return match ? toDomainLocality(match) : null;
  }

  async listAmenities(): Promise<Amenity[]> {
    const rows = await this.prisma.amenity.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return rows.map(toDomainAmenity);
  }
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
