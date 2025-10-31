import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SubscriberService } from './subscriber.service';
import { SubscriberController } from './subscriber.controller';

@Module({
  imports: [
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
})
export class SubscriberModule {}
