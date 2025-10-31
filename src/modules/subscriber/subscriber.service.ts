// src/modules/subscriber/subscriber.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Injectable()
export class SubscriberService implements OnModuleInit {
  private readonly logger = new Logger(SubscriberService.name);

  onModuleInit() {
    this.logger.log('👂 Subscriber inicializado y escuchando eventos Redis...');
  }

  // Este decorador escucha los mensajes del canal Redis
  @MessagePattern('notificacion_estudiante')
  handleNotificacion(@Payload() data: any) {
    this.logger.log(`📬 Mensaje recibido desde Redis: ${JSON.stringify(data)}`);

    // Aquí puedes agregar lógica personalizada, por ejemplo:
    // - Enviar notificación a WebSocket (frontend)
    // - Actualizar estado en BD
    // - Registrar en logs

    this.logger.log(`🔔 Notificación recibida: "${data.mensaje}" para estudiante ${data.id_estudiante}`);
    return { ok: true, recibido: data };
  }
}
