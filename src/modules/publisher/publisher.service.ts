// src/modules/publisher/publisher.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PublisherService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  // ✅ Método para notificaciones genéricas
  async publishNotification(payload: {
    mensaje: string;
    id_estudiante?: number;
    id_tarea?: number;
  }) {
    const notificacionGuardada = await this.notificationsService.crearNotificacion({
      mensaje: payload.mensaje,
      id_tarea: payload.id_tarea || 0, // Valor por defecto
      id_estudiante: payload.id_estudiante || 0, // Valor por defecto
    });
    
    console.log('💾 Notificación guardada en BD con ID:', notificacionGuardada.id_notificacion);

    await this.client.emit('notificacion_estudiante', {
      ...payload,
      id: notificacionGuardada.id_notificacion,
      fechaCreacion: notificacionGuardada.fecha_envio,
    }).toPromise();

    return { 
      mensaje: 'Notificación publicada y guardada', 
      notificacionId: notificacionGuardada.id_notificacion,
    };
  }

  // ✅ Método para publicar tareas
  async publishTask(tareaData: {
    titulo: string;
    descripcion: string;
    fecha_limite: Date;
    hora_limite?: string;
    archivo_material?: string;
    id_curso: number;
  }) {
    // 1. Guardar tarea en BD
    const tarea = this.taskRepository.create(tareaData);
    const tareaGuardada = await this.taskRepository.save(tarea);
    
    console.log('💾 Tarea guardada en BD con ID:', tareaGuardada.id_tarea);

    // 2. Crear y publicar notificación automática
    const notificacionPayload = {
      mensaje: `📚 Nueva Tarea: ${tareaData.titulo}`,
      id_tarea: tareaGuardada.id_tarea,
      id_estudiante: 0, // Esto debería enviarse a todos los estudiantes del curso
    };

    const notificacionGuardada = await this.notificationsService.crearNotificacion(notificacionPayload);

    // 3. Publicar evento Redis
    await this.client.emit('notificacion_estudiante', {
      ...notificacionPayload,
      id: notificacionGuardada.id_notificacion,
      fechaCreacion: notificacionGuardada.fecha_envio,
    }).toPromise();

    console.log('📢 Tarea publicada via Redis');

    return { 
      mensaje: 'Tarea publicada y notificada',
      tareaId: tareaGuardada.id_tarea,
      notificacionId: notificacionGuardada.id_notificacion,
    };
  }

  // ✅ Método para obtener tareas por curso
  async obtenerTareasPorCurso(id_curso: number): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { id_curso, activa: true },
      order: { fecha_publicacion: 'DESC' }, // Usa el nombre real
    });
  }

  // ✅ Método para obtener tarea por ID
  async obtenerTareaPorId(id_tarea: number): Promise<Task> {
    const tarea = await this.taskRepository.findOne({ 
      where: { id_tarea, activa: true } 
    });
    
    if (!tarea) {
      throw new Error(`Tarea con ID ${id_tarea} no encontrada`);
    }
    
    return tarea;
  }

  // ✅ Método para obtener tareas por docente (necesitarías una relación)
  async obtenerTareasPorDocente(id_docente: number): Promise<Task[]> {
    // Esto asume que tienes una relación entre tareas y docente a través del curso
    return await this.taskRepository
      .createQueryBuilder('tarea')
      .innerJoin('tarea.curso', 'curso')
      .where('curso.id_docente = :id_docente', { id_docente })
      .andWhere('tarea.activa = :activa', { activa: true })
      .orderBy('tarea.fecha_publicacion', 'DESC')
      .getMany();
  }
}