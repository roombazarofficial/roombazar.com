import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
} from "@nestjs/common";
import { z } from "zod";
import {
  CurrentUser,
  CurrentUserOptional,
} from "src/common/decorators/currentuser.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import { NotFound } from "src/common/errors/domain.errors";
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from "src/persistence/ports/users.repository";
import {
  LISTINGS_REPOSITORY,
  type ListingsRepository,
} from "src/persistence/ports/listings.repository";
import {
  CONVERSATIONS_REPOSITORY,
  type ConversationsRepository,
} from "src/persistence/ports/conversations.repository";
import {
  presentPublicUser,
  type PublicUserStats,
} from "src/modules/listings/listings.presenter";
import { policyFor } from "src/common/trustlevels";
import type { User } from "src/domain/user.entity";

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

@Controller("users")
export class UsersController {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(LISTINGS_REPOSITORY) private readonly listings: ListingsRepository,
    @Inject(CONVERSATIONS_REPOSITORY)
    private readonly conversations: ConversationsRepository,
  ) {}

  @Public()
  @Get("me")
  async me(@CurrentUserOptional() user: User | null) {
    if (!user) return null;

    const stats = await this.statsFor(user.id);

    return {
      ...presentPublicUser(user, stats),
      publicPhone: user.phone,
      email: user.email,
      role: user.role,
      limits: policyFor(user.trustLevel),
    };
  }

  @Patch("me")
  async updateMe(
    @Body(new ZodValidationPipe(updateProfileSchema))
    dto: z.infer<typeof updateProfileSchema>,
    @CurrentUser() user: User,
  ) {
    const updated = await this.users.update(user.id, dto);
    return presentPublicUser(updated, await this.statsFor(user.id));
  }

  @Delete("me")
  @HttpCode(204)
  async deleteMe(@CurrentUser() user: User) {
    await this.users.softDelete(user.id);
  }

  @Public()
  @Get(":id")
  async publicProfile(@Param("id") id: string) {
    const user = await this.users.findById(id);
    if (!user || user.deletedAt) throw new NotFound("User");

    return presentPublicUser(user, await this.statsFor(user.id));
  }

  private async statsFor(userId: string): Promise<PublicUserStats> {
    const [activeListingCount, typicalReplyHours] = await Promise.all([
      this.listings.countActiveByOwner(userId),
      this.conversations.medianReplyHours(userId),
    ]);

    return { activeListingCount, typicalReplyHours };
  }
}
