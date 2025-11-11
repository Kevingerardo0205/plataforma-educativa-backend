import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriberService } from './subscriber.service';
import { SubscriberController } from './subscriber.controller';
import { Notification } from '../notifications/notification.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]), 
    NotificationsModule
  ],
  providers: [SubscriberService],
  controllers: [SubscriberController],
  exports: [SubscriberService],
})
export class SubscriberModule {}
