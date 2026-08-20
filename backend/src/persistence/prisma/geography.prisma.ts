import { Injectable } from "@nestjs/common";
import type {
  Amenity,
  City,
  Locality,
  State,
} from "src/domain/geography.entity";
import type { GeographyRepository } from "src/persistence/ports/geography.repository";
import { PrismaService } from "./prisma.service";
import { toDomainAmenity, toDomainCity, toDomainLocality } from "./mappers";

@Injectable()
export class PrismaGeographyRepository implements GeographyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listStates(): Promise<State[]> {
    return this.prisma.state.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
  }

  async listDistricts(stateCode: string): Promise<City[]> {
    const rows = await this.prisma.city.findMany({
      where: { isActive: true, state: { code: stateCode } },
      orderBy: { name: "asc" },
      include: { state: { select: { name: true } } },
    });

    return rows.map((row) => ({ ...toDomainCity(row), state: row.state.name }));
  }

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

  async findCityById(id: string): Promise<City | null> {
    const row = await this.prisma.city.findUnique({
      where: { id },
      include: { state: { select: { name: true } } },
    });
    return row ? { ...toDomainCity(row), state: row.state.name } : null;
  }

  async createCity(city: City): Promise<City> {
    const state = await this.prisma.state.findFirst({
      where: { name: { equals: city.state, mode: "insensitive" } },
    });
    if (!state) throw new Error(`Unknown state: ${city.state}`);
    const row = await this.prisma.city.create({
      data: {
        id: city.id,
        stateId: state.id,
        name: city.name,
        slug: city.slug,
        isActive: city.isActive,
        centroidLat: city.centroidLat,
        centroidLng: city.centroidLng,
      },
      include: { state: { select: { name: true } } },
    });
    return { ...toDomainCity(row), state: row.state.name };
  }

  async updateCity(id: string, patch: Partial<City>): Promise<City> {
    const state = patch.state
      ? await this.prisma.state.findFirst({
          where: { name: { equals: patch.state, mode: "insensitive" } },
        })
      : null;
    const row = await this.prisma.city.update({
      where: { id },
      data: {
        ...(state && { stateId: state.id }),
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.slug !== undefined && { slug: patch.slug }),
        ...(patch.isActive !== undefined && { isActive: patch.isActive }),
        ...(patch.centroidLat !== undefined && { centroidLat: patch.centroidLat }),
        ...(patch.centroidLng !== undefined && { centroidLng: patch.centroidLng }),
      },
      include: { state: { select: { name: true } } },
    });
    return { ...toDomainCity(row), state: row.state.name };
  }

  async deleteCity(id: string): Promise<void> {
    await this.prisma.city.delete({ where: { id } });
  }

  async findCitiesByIds(ids: string[]): Promise<Map<string, City>> {
    if (ids.length === 0) return new Map();

    const rows = await this.prisma.city.findMany({
      where: { id: { in: [...new Set(ids)] } },
      include: { state: { select: { name: true } } },
    });

    return new Map(
      rows.map((row) => [
        row.id,
        { ...toDomainCity(row), state: row.state.name },
      ]),
    );
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

  async findLocalityById(id: string): Promise<Locality | null> {
    const row = await this.prisma.locality.findUnique({ where: { id } });
    return row ? toDomainLocality(row) : null;
  }

  async createLocality(locality: Locality): Promise<Locality> {
    const row = await this.prisma.locality.create({ data: locality });
    return toDomainLocality(row);
  }

  async updateLocality(id: string, patch: Partial<Locality>): Promise<Locality> {
    const row = await this.prisma.locality.update({
      where: { id },
      data: {
        ...(patch.cityId !== undefined && { cityId: patch.cityId }),
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.slug !== undefined && { slug: patch.slug }),
        ...(patch.aliases !== undefined && { aliases: patch.aliases }),
        ...(patch.centroidLat !== undefined && { centroidLat: patch.centroidLat }),
        ...(patch.centroidLng !== undefined && { centroidLng: patch.centroidLng }),
      },
    });
    return toDomainLocality(row);
  }

  async deleteLocality(id: string): Promise<void> {
    await this.prisma.locality.delete({ where: { id } });
  }

  async findLocalitiesByIds(ids: string[]): Promise<Map<string, Locality>> {
    if (ids.length === 0) return new Map();

    const rows = await this.prisma.locality.findMany({
      where: { id: { in: [...new Set(ids)] } },
    });

    return new Map(rows.map((row) => [row.id, toDomainLocality(row)]));
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

  async findAmenityById(id: string): Promise<Amenity | null> {
    const row = await this.prisma.amenity.findUnique({ where: { id } });
    return row ? toDomainAmenity(row) : null;
  }

  async createAmenity(amenity: Amenity): Promise<Amenity> {
    const row = await this.prisma.amenity.create({
      data: {
        id: amenity.id,
        slug: amenity.slug,
        name: amenity.label,
        category: amenity.category,
      },
    });
    return toDomainAmenity(row);
  }

  async updateAmenity(id: string, patch: Partial<Amenity>): Promise<Amenity> {
    const row = await this.prisma.amenity.update({
      where: { id },
      data: {
        ...(patch.slug !== undefined && { slug: patch.slug }),
        ...(patch.label !== undefined && { name: patch.label }),
        ...(patch.category !== undefined && { category: patch.category }),
      },
    });
    return toDomainAmenity(row);
  }

  async deleteAmenity(id: string): Promise<void> {
    await this.prisma.amenity.delete({ where: { id } });
  }
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
