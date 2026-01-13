import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './notification.entity';
import { ManualNotificationCreator } from './factory/manual-notification.creator';
import { TaskNotificationCreator } from './factory/task-notification.creator';
import { NotificationsGateway } from './notifications.gateway';


@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    NotificationsService,
    NotificationsGateway,

    {
      provide: 'MANUAL_NOTIFICATION_CREATOR',
      useClass: ManualNotificationCreator,
    },
    {
      provide: 'TASK_NOTIFICATION_CREATOR',
      useClass: TaskNotificationCreator,
    },
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}