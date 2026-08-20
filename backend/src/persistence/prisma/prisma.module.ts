import { Global, Module } from "@nestjs/common";
import { LISTINGS_REPOSITORY } from "src/persistence/ports/listings.repository";
import { USERS_REPOSITORY } from "src/persistence/ports/users.repository";
import { CONVERSATIONS_REPOSITORY } from "src/persistence/ports/conversations.repository";
import { GEOGRAPHY_REPOSITORY } from "src/persistence/ports/geography.repository";
import { REPORTS_REPOSITORY } from "src/persistence/ports/reports.repository";
import { SAVED_REPOSITORY } from "src/persistence/ports/saved.repository";
import { AUTH_REPOSITORY } from "src/persistence/ports/auth.repository";
import { LISTING_DRAFT_REPOSITORY } from "src/persistence/ports/listingdraft.repository";
import { PrismaService } from "./prisma.service";
import { PrismaListingDraftRepository } from "./listingdraft.prisma";
import { PrismaListingsRepository } from "./listings.prisma";
import { PrismaUsersRepository } from "./users.prisma";
import { PrismaConversationsRepository } from "./conversations.prisma";
import { PrismaGeographyRepository } from "./geography.prisma";
import { PrismaReportsRepository } from "./reports.prisma";
import { PrismaSavedRepository } from "./saved.prisma";
import { PrismaAuthRepository } from "./auth.prisma";

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: LISTINGS_REPOSITORY, useClass: PrismaListingsRepository },
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
    { provide: CONVERSATIONS_REPOSITORY, useClass: PrismaConversationsRepository },
    { provide: GEOGRAPHY_REPOSITORY, useClass: PrismaGeographyRepository },
    { provide: REPORTS_REPOSITORY, useClass: PrismaReportsRepository },
    { provide: SAVED_REPOSITORY, useClass: PrismaSavedRepository },
    { provide: AUTH_REPOSITORY, useClass: PrismaAuthRepository },
    {
      provide: LISTING_DRAFT_REPOSITORY,
      useClass: PrismaListingDraftRepository,
    },
  ],
  exports: [
    PrismaService,
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
export class PrismaPersistenceModule {}
