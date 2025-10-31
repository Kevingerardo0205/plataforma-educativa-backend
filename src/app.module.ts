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
  password: 'root', // vacío en XAMPP por defecto
  database: 'plataforma_educativa',
  entities: [User, Task, Notification],
  synchronize: false,
}),
    
    // Solo estos 4 módulos
    AuthModule,
    PublisherModule, 
    NotificationsModule,
    SubscriberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 