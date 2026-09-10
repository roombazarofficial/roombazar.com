import { Module } from "@nestjs/common";
import { NotificationsModule } from "src/modules/notifications/notifications.module";
import { SuperAdminController } from "./superadmin.controller";
import { ApprovalsController } from "./approvals.controller";
import { ApprovalsService } from "./approvals.service";
import { AdminUsersController } from "./adminusers.controller";
import { AdminListingsController } from "./adminlistings.controller";
import { AdminGeographyController } from "./admingeography.controller";
import { AdminVerificationController } from "./adminverification.controller";
import { AdminLocalityRequestsController } from "./adminlocalityrequests.controller";

@Module({
  imports: [NotificationsModule],
  controllers: [
    SuperAdminController,
    ApprovalsController,
    AdminUsersController,
    AdminListingsController,
    AdminGeographyController,
    AdminVerificationController,
    AdminLocalityRequestsController,
  ],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class SuperAdminModule {}
