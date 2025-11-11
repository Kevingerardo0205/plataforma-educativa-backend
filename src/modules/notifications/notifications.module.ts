import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './notification.entity';
import { NotificationsGateway } from './notifications.gateway'; // ✅ IMPORTA EL GATEWAY

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification])   
  ],
  providers: [
    NotificationsService,NotificationsGateway ],
  controllers: [NotificationsController],
  exports: [
    NotificationsGateway, // ✅ EXPORTA EL GATEWAY
    NotificationsService
  ],
})
export class NotificationsModule {}
