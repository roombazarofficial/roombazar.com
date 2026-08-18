import { Global, Module } from "@nestjs/common";
import { LISTINGS_REPOSITORY } from "src/persistence/ports/listings.repository";
import { USERS_REPOSITORY } from "src/persistence/ports/users.repository";
import { CONVERSATIONS_REPOSITORY } from "src/persistence/ports/conversations.repository";
import { GEOGRAPHY_REPOSITORY } from "src/persistence/ports/geography.repository";
import { REPORTS_REPOSITORY } from "src/persistence/ports/reports.repository";
import { SAVED_REPOSITORY } from "src/persistence/ports/saved.repository";
import { AUTH_REPOSITORY } from "src/persistence/ports/auth.repository";
import { LISTING_DRAFT_REPOSITORY } from "src/persistence/ports/listingdraft.repository";
import { MemoryListingDraftRepository } from "./listingdraft.memory";
import { MemoryListingsRepository } from "./listings.memory";
import { MemoryUsersRepository } from "./users.memory";
import { MemoryConversationsRepository } from "./conversations.memory";
import { MemoryGeographyRepository } from "./geography.memory";
import { MemoryReportsRepository } from "./reports.memory";
import { MemorySavedRepository } from "./saved.memory";
import { MemoryAuthRepository } from "./auth.memory";

@Global()
@Module({
  providers: [
    { provide: LISTINGS_REPOSITORY, useClass: MemoryListingsRepository },
    { provide: USERS_REPOSITORY, useClass: MemoryUsersRepository },
    { provide: CONVERSATIONS_REPOSITORY, useClass: MemoryConversationsRepository },
    { provide: GEOGRAPHY_REPOSITORY, useClass: MemoryGeographyRepository },
    { provide: REPORTS_REPOSITORY, useClass: MemoryReportsRepository },
    { provide: SAVED_REPOSITORY, useClass: MemorySavedRepository },
    { provide: AUTH_REPOSITORY, useClass: MemoryAuthRepository },
    {
      provide: LISTING_DRAFT_REPOSITORY,
      useClass: MemoryListingDraftRepository,
    },
  ],
  exports: [
    LISTINGS_REPOSITORY,
    USERS_REPOSITORY,
    CONVERSATIONS_REPOSITORY,
    GEOGRAPHY_REPOSITORY,
    REPORTS_REPOSITORY,
    SAVED_REPOSITORY,
    AUTH_REPOSITORY,
    LISTING_DRAFT_REPOSITORY,
  ],
})
export class MemoryPersistenceModule {}
