import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Módulos ESENCIALES para Pub/Sub
import { AuthModule } from './modules/auth/auth.module';
import { PublisherModule } from './modules/publisher/publisher.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriberModule } from './modules/subscriber/subscriber.module';

// Entidades SIMPLIFICADAS
import { User } from './modules/auth/user.entity';
import { Task } from './modules/publisher/entities/task.entity';
import { Notification } from './modules/notifications/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: 'root',
      database: 'plataforma_educativa',
      entities: [User, Task, Notification],
      synchronize: false,
      logging: true, 
    }),
    
    // El orden puede ser importante para las dependencias
    AuthModule,
    NotificationsModule, // Este debe ir antes de SubscriberModule
    PublisherModule,
    SubscriberModule, // Depende de NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}