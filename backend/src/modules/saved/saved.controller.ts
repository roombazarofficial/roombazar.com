import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
} from "@nestjs/common";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import {
  SAVED_REPOSITORY,
  type SavedRepository,
} from "src/persistence/ports/saved.repository";
import type { User } from "src/domain/user.entity";

const createSearchSchema = z.object({
  label: z.string().trim().min(1).max(120),
  query: z.string().trim().min(1).max(500),
  notifyFrequency: z.enum(["off", "daily", "instant"]).default("daily"),
});

@Controller("saved")
export class SavedController {
  constructor(
    @Inject(SAVED_REPOSITORY) private readonly saved: SavedRepository,
  ) {}

  @Get("listings")
  async listings(@CurrentUser() user: User) {
    return this.saved.listSavedListingIds(user.id);
  }

  @Post("listings/:id")
  @HttpCode(204)
  async save(@Param("id") id: string, @CurrentUser() user: User) {
    await this.saved.saveListing(user.id, id);
  }

  @Delete("listings/:id")
  @HttpCode(204)
  async unsave(@Param("id") id: string, @CurrentUser() user: User) {
    await this.saved.unsaveListing(user.id, id);
  }

  @Get("searches")
  async searches(@CurrentUser() user: User) {
    return this.saved.listSearches(user.id);
  }

  @Post("searches")
  async createSearch(
    @Body(new ZodValidationPipe(createSearchSchema))
    dto: z.infer<typeof createSearchSchema>,
    @CurrentUser() user: User,
  ) {
    return this.saved.createSearch({
      id: randomUUID(),
      userId: user.id,
      label: dto.label,
      query: dto.query,
      notifyFrequency: dto.notifyFrequency,
      createdAt: new Date().toISOString(),
    });
  }

  @Delete("searches/:id")
  @HttpCode(204)
  async deleteSearch(@Param("id") id: string, @CurrentUser() user: User) {
    await this.saved.deleteSearch(user.id, id);
  }
}
