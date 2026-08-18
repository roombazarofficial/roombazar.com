import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Inject,
  UsePipes,
} from "@nestjs/common";
import { z } from "zod";
import { Public } from "src/common/decorators/public.decorator";
import {
  CurrentUser,
  CurrentUserOptional,
} from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import { ThrottleListingCreate } from "src/common/decorators/throttle.decorator";
import type { User } from "src/domain/user.entity";
import { ListingsService } from "./listings.service";
import {
  createListingSchema,
  updateListingSchema,
  type CreateListingDto,
  type UpdateListingDto,
} from "./dto/createlisting.dto";
import {
  listingDraftSchema,
  type ListingDraftDto,
} from "./dto/listingdraft.dto";
import {
  LISTING_DRAFT_REPOSITORY,
  type ListingDraftRepository,
} from "src/persistence/ports/listingdraft.repository";

const renewSchema = z.object({
  rentPaise: z.number().int().min(50_000).max(100_000_000),
  availableFrom: z.string().date(),
});

type RenewDto = z.infer<typeof renewSchema>;

@Controller("listings")
export class ListingsController {
  constructor(
    private readonly listings: ListingsService,
    @Inject(LISTING_DRAFT_REPOSITORY)
    private readonly drafts: ListingDraftRepository,
  ) {}

  @Public()
  @Get("slug/:slug")
  async bySlug(
    @Param("slug") slug: string,
    @CurrentUserOptional() viewer: User | null,
  ) {
    const listing = await this.listings.getBySlug(slug);

    void this.listings.recordView(listing.id, viewer);

    return listing;
  }

  @Get("mine")
  async mine(@CurrentUser() user: User) {
    return this.listings.listMine(user);
  }

  /*
    The three draft routes are declared above the ":id" routes on purpose. Nest
    matches in declaration order, so moving them below would make "draft" read
    as a listing id and answer 404.
  */
  @Get("draft")
  async draft(@CurrentUser() user: User) {
    return (await this.drafts.find(user.id)) ?? { data: null, updatedAt: null };
  }

  @Put("draft")
  async saveDraft(
    @Body(new ZodValidationPipe(listingDraftSchema)) dto: ListingDraftDto,
    @CurrentUser() user: User,
  ) {
    return this.drafts.save(user.id, dto);
  }

  @Delete("draft")
  @HttpCode(204)
  async discardDraft(@CurrentUser() user: User) {
    await this.drafts.discard(user.id);
  }

  @Get(":id")
  async byId(@Param("id") id: string, @CurrentUser() user: User) {
    return this.listings.getOwned(id, user);
  }

  @ThrottleListingCreate()
  @Post()
  @UsePipes(new ZodValidationPipe(createListingSchema))
  async create(@Body() dto: CreateListingDto, @CurrentUser() user: User) {
    return this.listings.create(dto, user);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateListingSchema)) dto: UpdateListingDto,
    @CurrentUser() user: User,
  ) {
    return this.listings.update(id, dto, user);
  }

  @Post(":id/taken")
  @HttpCode(200)
  async markTaken(@Param("id") id: string, @CurrentUser() user: User) {
    return this.listings.markTaken(id, user);
  }

  @Post(":id/paused")
  @HttpCode(200)
  async pause(@Param("id") id: string, @CurrentUser() user: User) {
    return this.listings.pause(id, user);
  }

  @Post(":id/renew")
  @HttpCode(200)
  async renew(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(renewSchema)) dto: RenewDto,
    @CurrentUser() user: User,
  ) {
    return this.listings.renew(id, user, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string, @CurrentUser() user: User) {
    await this.listings.softDelete(id, user);
  }
}
