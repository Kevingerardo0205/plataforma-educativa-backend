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
    mensaje: string; // Cambiado de 'titulo' y 'contenido' a 'mensaje'
    id_tarea: number;
    id_estudiante: number;
  }): Promise<Notification> {
    const notificacion = this.notificationRepository.create({
      ...notificacionData,
      estado: 'Pendiente'
    });
    return await this.notificationRepository.save(notificacion);
  }

  async obtenerNotificacionesPorEstudiante(id_estudiante?: number): Promise<Notification[]> {
    const where: any = {};
    if (id_estudiante) {
      where.id_estudiante = id_estudiante;
    }
    
    return await this.notificationRepository.find({
      where,
      order: { fecha_envio: 'DESC' }, // Usa el nombre real de la columna
    });
  }

  async obtenerNoLeidasPorEstudiante(id_estudiante?: number): Promise<Notification[]> {
    const where: any = { estado: 'Pendiente' };
    if (id_estudiante) {
      where.id_estudiante = id_estudiante;
    }
    
    return await this.notificationRepository.find({
      where,
      order: { fecha_envio: 'DESC' }, // Usa el nombre real de la columna
    });
  }

  async marcarComoLeido(id_notificacion: number): Promise<Notification> {
    await this.notificationRepository.update(id_notificacion, { 
      estado: 'Leida' 
    });
    
    const notificacion = await this.notificationRepository.findOne({ 
      where: { id_notificacion } 
    });
    
    if (!notificacion) {
      throw new NotFoundException(`Notificación con ID ${id_notificacion} no encontrada`);
    }
    
    return notificacion;
  }
    async findByStudentId(idEstudiante: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { id_estudiante: idEstudiante },
      order: { fecha_envio: 'DESC' },
    });
  }
}