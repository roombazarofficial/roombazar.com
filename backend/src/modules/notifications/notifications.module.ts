import { Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { NotificationService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { AdminNotificationsController } from "./admin-notifications.controller";

/**
 * Firebase Cloud Messaging for RoomBazar.
 *
 * Exports {@link NotificationService} so feature modules (chat, listing
 * approvals) can trigger notifications without depending on Firebase directly.
 */
@Module({
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [FirebaseService, NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
