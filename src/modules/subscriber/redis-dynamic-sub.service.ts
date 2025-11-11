import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class SubscriberDynamicService implements OnModuleInit {
  private redis: Redis;

  async onModuleInit() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
    });

    console.log("✅ Subscriber dinámico conectado a Redis");
  }

  async subscribeToCourse(courseId: number) {
    const channel = `curso_${courseId}`;

    this.redis.subscribe(channel, (err) => {
      if (err) {
        console.error(`❌ Error al suscribirse a canal ${channel}:`, err);
      } else {
        console.log(`📡 Suscrito dinámicamente al canal ${channel}`);
      }
    });

    this.redis.on("message", (chan, message) => {
      if (chan === channel) {
        console.log(`📨 Mensaje recibido en ${chan}:`, message);
        // Aquí emitimos al frontend
      }
    });
  }
}
