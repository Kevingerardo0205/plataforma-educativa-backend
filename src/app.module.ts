import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublisherModule } from './modules/publisher/publisher.module';
import { SubscriberModule } from './modules/subscriber/subscriber.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
// ELIMINAR estas líneas:
// import { TasksModule } from './modules/tasks/tasks.module'; 
// import { Task } from './modules/tasks/task.entity';
import { Notification } from './modules/notifications/notification.entity';
import { Task } from './modules/publisher/entities/task.entity'; // ← NUEVA RUTA

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'notifications.db',
      entities: [Notification, Task], // ← Task desde publisher
      synchronize: true,
    }),
    PublisherModule,
    SubscriberModule,
    NotificationsModule,
    // ELIMINAR: TasksModule, // ← Ya no existe
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}