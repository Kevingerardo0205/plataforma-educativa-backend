import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './notification.entity';
import { NotificationCreator } from './factory/notification.creator';
import { CreateNotificationDTO } from './dto/create-notification.dto';



@Injectable()
export class NotificationsService {

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,

    @Inject('MANUAL_NOTIFICATION_CREATOR')
    private readonly manualCreator: NotificationCreator,

    @Inject('TASK_NOTIFICATION_CREATOR')
    private readonly taskCreator: NotificationCreator,
  ) {}

   async crearNotificacion(
    data: CreateNotificationDTO,
    tipo: 'MANUAL' | 'TASK'
  ): Promise<Notification> {

    const creator =
      tipo === 'MANUAL'
        ? this.manualCreator
        : this.taskCreator;

    return this.repo.save(creator.crear(data));
  }

  async obtenerNotificacionesPorEstudiante(
    id_estudiante?: number
  ): Promise<Notification[]> {

    const where: any = {};
    if (id_estudiante) {
      where.id_estudiante = id_estudiante;
    }

    return this.repo.find({
      where,
      order: { fecha_envio: 'DESC' },
    });
  }


  async obtenerNoLeidasPorEstudiante(id_estudiante?: number): Promise<Notification[]> {
    const where: any = { estado: 'Pendiente' };
    if (id_estudiante) {
      where.id_estudiante = id_estudiante;
    }
    
    return await this.repo.find({
      where,
      order: { fecha_envio: 'DESC' },
    });
  }

async createFromRedis(
  data: CreateNotificationDTO
): Promise<Notification> {
    const notificacion = this.taskCreator.crear({
      ...data,
    
     fecha_envio: data.fecha_envio
        ? new Date(data.fecha_envio)
        : new Date(),
    });

    return await this.repo.save(notificacion);  
}

async marcarComoLeido(id_notificacion: number): Promise<Notification> {
    await this.repo.update(id_notificacion, { estado: 'Leida' });

    const notificacion = await this.repo.findOne({
      where: { id_notificacion },
    });

    if (!notificacion) {
      throw new NotFoundException(
        `Notificación con ID ${id_notificacion} no encontrada`,
      );
    }

    return notificacion;
  }

  async findByStudentId(
    idEstudiante: number
  ): Promise<Notification[]> {

    return this.repo.find({
      where: { id_estudiante: idEstudiante },
      order: { fecha_envio: 'DESC' },
    });
  }

}