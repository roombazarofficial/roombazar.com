import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { z } from "zod";
import { Public } from "src/common/decorators/public.decorator";
import { CurrentUser, CurrentUserOptional } from "src/common/decorators/currentuser.decorator";
import { ThrottleFeedback, ThrottleReview } from "src/common/decorators/throttle.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import {
  REVIEWS_REPOSITORY,
  type ReviewsRepository,
  type ReviewSort,
} from "src/persistence/ports/reviews.repository";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
} from "src/persistence/ports/listings.repository";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import type { User } from "src/domain/user.entity";

const ratingSchema = z.number().int().min(1).max(5);

const submitReviewSchema = z.object({
  overallRating: ratingSchema,
  cleanliness: ratingSchema.nullable().default(null),
  locationScore: ratingSchema.nullable().default(null),
  valueForMoney: ratingSchema.nullable().default(null),
  accuracy: ratingSchema.nullable().default(null),
  hostBehavior: ratingSchema.nullable().default(null),
  body: z.string().trim().min(1).max(2000),
  photos: z.array(z.string().url()).max(6).default([]),
});

const sortSchema = z
  .enum(["relevant", "newest", "highest", "lowest"])
  .default("relevant");

const feedbackSchema = z.object({
  sentiment: z.enum(["loved", "good", "okay", "couldbebetter", "notsatisfied"]),
  category: z
    .enum([
      "search",
      "listings",
      "propertyinfo",
      "contactingowner",
      "bookinginquiry",
      "websiteexperience",
      "other",
    ])
    .nullable()
    .default(null),
  message: z.string().trim().max(1000).nullable().default(null),
});

@Controller()
export class ReviewsController {
  constructor(
    @Inject(REVIEWS_REPOSITORY) private readonly reviews: ReviewsRepository,
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {}

  @Public()
  @Get("listings/:listingId/reviews")
  async listForListing(
    @Param("listingId") listingId: string,
    @Query("sort", new ZodValidationPipe(sortSchema)) sort: ReviewSort,
  ) {
    const [summary, rows] = await Promise.all([
      this.reviews.summaryForListing(listingId),
      this.reviews.listForListing(listingId, sort),
    ]);

    const authorIds = rows.map((r) => r.userId);
    const authorById = await this.users.findManyByIds(authorIds);

    const items = rows.map((r) => {
      const author = authorById.get(r.userId);
      return {
        id: r.id,
        overallRating: r.overallRating,
        cleanliness: r.cleanliness,
        locationScore: r.locationScore,
        valueForMoney: r.valueForMoney,
        accuracy: r.accuracy,
        hostBehavior: r.hostBehavior,
        body: r.body,
        photos: r.photos,
        createdAt: r.createdAt,
        author: author
          ? { id: author.id, name: author.name, avatarUrl: author.avatarUrl }
          : { id: r.userId, name: "RoomBazar user", avatarUrl: null },
      };
    });

    return { summary, items };
  }

  @Get("me/reviews")
  async myReviews(@CurrentUser() user: User) {
    const rows = await this.reviews.listByUser(user.id);

    const listings = await Promise.all(
      rows.map((r) => this.listings.findById(r.listingId)),
    );

    return rows.map((r, i) => {
      const listing = listings[i];
      return {
        id: r.id,
        listingId: r.listingId,
        listingSlug: listing?.slug ?? null,
        listingTitle: listing?.title ?? "A property you reviewed",
        overallRating: r.overallRating,
        body: r.body,
        createdAt: r.createdAt,
      };
    });
  }

  @Public()
  @Get("listings/:listingId/reviews/mine")
  async mine(
    @Param("listingId") listingId: string,
    @CurrentUserOptional() user: User | null,
  ) {
    if (!user) return null;
    return this.reviews.findByUserAndListing(user.id, listingId);
  }

  @ThrottleReview()
  @Post("listings/:listingId/reviews")
  async submit(
    @Param("listingId") listingId: string,
    @Body(new ZodValidationPipe(submitReviewSchema))
    dto: z.infer<typeof submitReviewSchema>,
    @CurrentUser() user: User,
  ) {
    const listing = await this.listings.findById(listingId);
    if (!listing) throw new NotFoundException("Listing not found");

    if (listing.ownerId === user.id) {
      throw new BadRequestException("You can't review your own listing");
    }

    return this.reviews.upsert({ listingId, userId: user.id, ...dto });
  }

  @Public()
  @ThrottleFeedback()
  @Post("feedback")
  async submitFeedback(
    @Body(new ZodValidationPipe(feedbackSchema))
    dto: z.infer<typeof feedbackSchema>,
    @CurrentUserOptional() user: User | null,
  ) {
    return this.reviews.createFeedback({ userId: user?.id ?? null, ...dto });
  }
}
