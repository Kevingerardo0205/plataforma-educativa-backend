import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './notification.entity';
import { ManualNotificationCreator } from './factory/manual-notification.creator';
import { TaskNotificationCreator } from './factory/task-notification.creator';


@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    NotificationsService,

    {
      provide: 'MANUAL_NOTIFICATION_CREATOR',
      useClass: ManualNotificationCreator,
    },
    {
      provide: 'TASK_NOTIFICATION_CREATOR',
      useClass: TaskNotificationCreator,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}