import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { validateEnv } from "./config/env";
import { SessionGuard } from "./common/guards/session.guard";
import { HttpExceptionFilter } from "./common/filters/httpexception.filter";
import { SerializeInterceptor } from "./common/interceptors/serialize.interceptor";
import { RequestLoggingInterceptor } from "./common/interceptors/requestlogging.interceptor";
import { PrismaPersistenceModule } from "./persistence/prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { MailModule } from "./modules/mail/mail.module";
import { ListingsModule } from "./modules/listings/listings.module";
import { SearchModule } from "./modules/search/search.module";
import { GeographyModule } from "./modules/geography/geography.module";
import { UsersModule } from "./modules/users/users.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";
import { SavedModule } from "./modules/saved/saved.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { VerificationModule } from "./modules/verification/verification.module";
import { UploadsModule } from "./modules/uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),

    PrismaPersistenceModule,

    MailModule,
    AuthModule,
    HealthModule,
    ListingsModule,
    SearchModule,
    GeographyModule,
    UsersModule,
    ConversationsModule,
    SavedModule,
    ReportsModule,
    ModerationModule,
    VerificationModule,
    UploadsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    { provide: APP_GUARD, useClass: SessionGuard },

    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },

    { provide: APP_INTERCEPTOR, useClass: SerializeInterceptor },

    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
