import { Controller, Get, Inject } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Public } from "src/common/decorators/public.decorator";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
} from "src/persistence/ports/listings.repository";

/**
 * Read-only feed the frontend's `app/sitemap.ts` consumes to build the public
 * XML sitemap. Kept separate from the search API on purpose: search is paged and
 * filtered for humans, this is a full bulk projection with no photo/lister joins.
 *
 * Only `active`, non-deleted listings are returned, so private, expired, taken
 * and suspended listings never reach the sitemap.
 */
@Controller("sitemap")
export class SitemapController {
  constructor(
    @Inject(LISTINGS_REPOSITORY)
    private readonly listings: ListingsRepository,
  ) {}

  @Public()
  @SkipThrottle()
  @Get("listings")
  async listingEntries() {
    const items = await this.listings.listSitemapEntries();

    return {
      generatedAt: new Date().toISOString(),
      count: items.length,
      items,
    };
  }
}
