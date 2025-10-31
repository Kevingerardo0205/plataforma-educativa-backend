import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend - ACTUALIZADO
  app.enableCors({
    origin: [
      'http://localhost:3000', // Frontend en desarrollo
      'http://192.168.100.41:3000', // Tu IP local para frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });

  await app.startAllMicroservices();
  
  const port = 3002;
  await app.listen(port);
  console.log(`🚀 Backend NestJS ejecutándose en: http://172.25.224.152:${port}`);
  console.log(`📱 API disponible en: http://172.25.224.152:${port}/api/v1`);
}
bootstrap();