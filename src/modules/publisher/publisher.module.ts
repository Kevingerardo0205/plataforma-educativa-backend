import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublisherService } from './publisher.service';
import { PublisherController } from './publisher.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsModule } from '../notifications/notifications.module';
import { Task } from './entities/task.entity';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REDIS_CLIENT',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT ?? '6379'),
        },
      },
    ]),
    TypeOrmModule.forFeature([Task]),
    NotificationsModule, // ← Importar NotificationsModule
  ],
  controllers: [PublisherController],
  providers: [PublisherService],
  exports: [PublisherService],
})
export class PublisherModule {}