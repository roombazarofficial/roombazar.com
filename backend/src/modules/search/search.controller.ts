import { Controller, Get, Query } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "src/common/decorators/public.decorator";
import { CurrentUserOptional } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import type { User } from "src/domain/user.entity";
import { SearchService } from "./search.service";
import { searchQuerySchema, type SearchQueryDto } from "./dto/searchquery.dto";

@Controller("search")
export class SearchController {
  constructor(
    private readonly search: SearchService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get()
  async run(
    @Query(new ZodValidationPipe(searchQuerySchema)) query: SearchQueryDto,
    @CurrentUserOptional() viewer: User | null,
  ) {
    return this.search.search(
      query,
      viewer,
      this.config.get<string>("R2_PUBLIC_HOST") ?? "images.roombazar.com",
    );
  }
}
