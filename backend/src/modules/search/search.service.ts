import { Inject, Injectable } from "@nestjs/common";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
  type Page,
} from "src/persistence/ports/listings.repository";
import {
  GEOGRAPHY_REPOSITORY,
  type GeographyRepository,
} from "src/persistence/ports/geography.repository";
import {
  SAVED_REPOSITORY,
  type SavedRepository,
} from "src/persistence/ports/saved.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import { NotFound } from "src/common/errors/domain.errors";
import { presentSummary } from "src/modules/listings/listings.presenter";
import type { User } from "src/domain/user.entity";
import { toArray, type SearchQueryDto } from "./dto/searchquery.dto";

@Injectable()
export class SearchService {
  constructor(
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
    @Inject(GEOGRAPHY_REPOSITORY) private readonly geography: GeographyRepository,
    @Inject(SAVED_REPOSITORY) private readonly saved: SavedRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {}

  async search(
    query: SearchQueryDto,
    viewer: User | null,
    imageHost: string,
  ): Promise<Page<unknown>> {
    const selectedCity = query.city
      ? await this.geography.findCityBySlug(query.city)
      : null;
    if (query.city && !selectedCity) throw new NotFound("City");

    const page = await this.listings.search({
      citySlug: query.city,
      localitySlugs: toArray(query.locality),
      roomTypes: toArray(query.type),
      furnishing: toArray(query.furnishing),
      postedBy: toArray(query.by),
      amenitySlugs: toArray(query.amenity),
      minRentPaise: query.minrent === undefined ? undefined : query.minrent * 100,
      maxRentPaise: query.maxrent === undefined ? undefined : query.maxrent * 100,
      availableFrom: query.from,
      occupancy: query.people,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });

    const savedIds = viewer
      ? new Set(await this.saved.listSavedListingIds(viewer.id))
      : new Set<string>();

    const [cityById, localityById] = await Promise.all([
      this.geography.findCitiesByIds(page.items.map((listing) => listing.cityId)),
      this.geography.findLocalitiesByIds(
        page.items.map((listing) => listing.localityId),
      ),
    ]);

    const listers = await this.users.findManyByIds(
      page.items.map((listing) => listing.ownerId),
    );

    const items = [];

    for (const listing of page.items) {
      const city = cityById.get(listing.cityId);
      const locality = localityById.get(listing.localityId);
      const lister = listers.get(listing.ownerId);

      if (!city || !locality || !lister) continue;

      items.push(
        presentSummary(
          listing,
          city,
          locality,
          lister,
          imageHost,
          savedIds.has(listing.id),
        ),
      );
    }

    return { ...page, items };
  }
}
