import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Comenta temporalmente el prefijo global para testing
  // app.setGlobalPrefix('api/v1');

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
  
  // COMENTA o ELIMINA este bloque problemático:
  // const server = app.getHttpServer();
  // const router = server._events.request._router;
  // console.log('=== RUTAS REGISTRADAS ===');
  // router.stack.forEach((layer: any) => {
  //   if (layer.route) {
  //     const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase()).join(', ');
  //     console.log(`${methods} ${layer.route.path}`);
  //   }
  // });
  // console.log('=========================');
  
  console.log(`🚀 Backend ejecutándose en el puerto ${port}`);
}
bootstrap();