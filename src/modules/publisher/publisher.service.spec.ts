import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationsService } from '../notifications/notifications.service'; // ← Agregar

@Injectable()
export class PublisherService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy,
    private readonly notificationsService: NotificationsService, // ← Inyectar
  ) {}

  async publishNotification(payload: {
    titulo: string;
    contenido: string;
    estudianteId?: string;
  }) {
    // 1. PRIMERO guardar en BD
    const notificacionGuardada = await this.notificationsService.crearNotificacion(payload);
    
    console.log('💾 Notificación guardada en BD con ID:', notificacionGuardada.id);

    // 2. LUEGO publicar evento Redis
    await this.client.emit('notificacion_estudiante', {
      ...payload,
      id: notificacionGuardada.id,
      fechaCreacion: notificacionGuardada.fechaCreacion,
    }).toPromise();

    return { 
      mensaje: 'Notificación publicada y guardada', 
      notificacionId: notificacionGuardada.id,
      data: payload
    };
  }
}