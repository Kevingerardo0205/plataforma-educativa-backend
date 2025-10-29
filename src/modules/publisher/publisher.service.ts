import { Inject, Injectable, NotFoundException } from '@nestjs/common'; // ← Asegúrate de tener NotFoundException
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../notifications/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Task } from './entities/task.entity';

@Injectable()
export class PublisherService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  // Método existente para notificaciones genéricas
  async publishNotification(payload: {
    titulo: string;
    contenido: string;
    estudianteId?: string;
  }) {
    const notificacionGuardada = await this.notificationsService.crearNotificacion(payload);
    
    console.log('💾 Notificación guardada en BD con ID:', notificacionGuardada.id);

    await this.client.emit('notificacion_estudiante', {
      ...payload,
      id: notificacionGuardada.id,
      fechaCreacion: notificacionGuardada.fechaCreacion,
    }).toPromise();

    return { 
      mensaje: 'Notificación publicada y guardada', 
      notificacionId: notificacionGuardada.id,
    };
  }

  // NUEVO: Método para publicar tareas
  async publishTask(tareaData: {
    titulo: string;
    descripcion: string;
    fechaLimite: Date;
    horaLimite?: string;
    enlace?: string;
    permitirSubidaArchivos?: boolean;
    cursoId?: string;
    docenteId?: string;
  }) {
    // 1. Guardar tarea en BD
    const tarea = this.taskRepository.create(tareaData);
    const tareaGuardada = await this.taskRepository.save(tarea);
    
    console.log('💾 Tarea guardada en BD con ID:', tareaGuardada.id);

    // 2. Crear y publicar notificación automática
    const notificacionPayload = {
      titulo: `📚 Nueva Tarea: ${tareaData.titulo}`,
      contenido: tareaData.descripcion,
      estudianteId: tareaData.cursoId,
    };

    const notificacionGuardada = await this.notificationsService.crearNotificacion(notificacionPayload);

    // 3. Publicar evento Redis
    await this.client.emit('notificacion_estudiante', {
      ...notificacionPayload,
      id: notificacionGuardada.id,
      fechaCreacion: notificacionGuardada.fechaCreacion,
    }).toPromise();

    console.log('📢 Tarea publicada via Redis');

    return { 
      mensaje: 'Tarea publicada y notificada',
      tareaId: tareaGuardada.id,
      notificacionId: notificacionGuardada.id,
    };
  }

  // Métodos para gestionar tareas
  async obtenerTareasPorCurso(cursoId?: string): Promise<Task[]> {
    const where = cursoId ? { cursoId, activa: true } : { activa: true };
    return await this.taskRepository.find({
      where,
      order: { fechaCreacion: 'DESC' },
    });
  }

  async obtenerTareaPorId(id: number): Promise<Task> {
    const tarea = await this.taskRepository.findOne({ 
      where: { id, activa: true } 
    });
    
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }
    
    return tarea;
  }

  async actualizarTarea(id: number, tareaData: Partial<Task>): Promise<Task> {
    const updateData = {
      ...tareaData,
      fechaActualizacion: new Date()
    };
    
    await this.taskRepository.update(id, updateData);
    
    return await this.obtenerTareaPorId(id);
  }

  async desactivarTarea(id: number): Promise<Task> {
    return await this.actualizarTarea(id, { activa: false } as Partial<Task>);
  }
}