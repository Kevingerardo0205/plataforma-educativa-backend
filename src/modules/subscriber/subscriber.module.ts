import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriberService } from './subscriber.service';
import { SubscriberController } from './subscriber.controller';
import { Notification } from '../notifications/notification.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    // Importa TypeOrmModule para la entidad Notification
    TypeOrmModule.forFeature([Notification]),
    
    // Importa el NotificationsModule para tener acceso a sus servicios/repositorios
    NotificationsModule,
    
    ClientsModule.register([
      {
        name: 'REDIS_SUBSCRIBER',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT ?? '6379'),
        },
      },
    ]),
  ],
  controllers: [SubscriberController],
  providers: [SubscriberService],
  exports: [SubscriberService],
})
export class SubscriberModule {}