import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async crearNotificacion(notificacionData: {
    titulo: string;
    contenido: string;
    estudianteId?: string;
  }): Promise<Notification> {
    const notificacion = this.notificationRepository.create(notificacionData);
    return await this.notificationRepository.save(notificacion);
  }

  async obtenerNotificacionesPorEstudiante(estudianteId?: string): Promise<Notification[]> {
    const where = estudianteId ? { estudianteId } : {};
    return await this.notificationRepository.find({
      where,
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerNoLeidasPorEstudiante(estudianteId?: string): Promise<Notification[]> {
    const where = estudianteId ? { estudianteId, leido: false } : { leido: false };
    return await this.notificationRepository.find({
      where,
      order: { fechaCreacion: 'DESC' },
    });
  }

  async marcarComoLeido(id: number): Promise<Notification> {
    await this.notificationRepository.update(id, { leido: true });
    
    const notificacion = await this.notificationRepository.findOne({ where: { id } });
    
    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id} no encontrada`);
    }
    
    return notificacion;
  }
}