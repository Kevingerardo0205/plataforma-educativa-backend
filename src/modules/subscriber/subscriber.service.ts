import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class SubscriberService implements OnModuleInit {

  private redis: Redis;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async onModuleInit() {
    console.log(" SubscriberService inicializado correctamente");

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
    });

    //  SUSCRIBIRSE AL CANAL
    this.redis.subscribe('notificacion_estudiante', (err, count) => {
      if (err) {
        console.error("❌ Error al suscribirse a canal Redis:", err);
      } else {
        console.log("🔔 Suscrito al canal: notificacion_estudiante");
      }
    });

    //  escucha DEL CANAL
    this.redis.on('message', async (channel, message) => {
      console.log(`📩 Mensaje recibido en canal ${channel}: ${message}`);

 
  try {
    const payload = JSON.parse(message);
    const data = payload.data || payload; //  EXTRAE CORRECTAMENTE

    await this.notificationsService.createFromRedis(data);

    this.gateway.emitToFrontend(data);

    
  }  catch (error) {
        console.error("❌ Error procesando mensaje de Redis:", error);
      }
    });
  }
}
