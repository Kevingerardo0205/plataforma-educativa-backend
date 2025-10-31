import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Notification } from '../notifications/notification.entity';

@Injectable()
export class SubscriberService implements OnModuleInit {
  private client: ClientProxy;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });
  }

  async onModuleInit() {
    await this.subscribeToNotifications();
  }

  private async subscribeToNotifications() {
    // Escuchar eventos de notificaciones
    this.client.connect().then(() => {
      this.client.emit('subscribe_notifications', { 
        subscriber: 'estudiantes',
        timestamp: new Date() 
      });
    });

    // Aquí puedes agregar más lógica de suscripción
    console.log('📥 Subscriber service iniciado y escuchando notificaciones...');
  }

  // Método para que los estudiantes se suscriban a notificaciones
  async suscribirEstudiante(idEstudiante: number) {
    // Lógica de suscripción para un estudiante específico
    return { mensaje: `Estudiante ${idEstudiante} suscrito a notificaciones` };
  }

  // Método para obtener notificaciones del estudiante
  async obtenerNotificacionesEstudiante(idEstudiante: number) {
    return await this.notificationRepository.find({
      where: { id_estudiante: idEstudiante },
      order: { fecha_envio: 'DESC' },
    });
  }
}