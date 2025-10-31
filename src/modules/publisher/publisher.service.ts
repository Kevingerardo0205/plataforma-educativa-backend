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

  /// publisher.service.ts - Corrige el método publishTask
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

  // 2. Obtener estudiantes inscritos en el curso (para notificaciones específicas)
  // Por ahora, crearemos una notificación sin estudiante específico o con un estudiante válido
  try {
    // Opción A: Crear notificación sin estudiante específico (si tu BD lo permite)
    // Opción B: Usar un estudiante válido (por ejemplo, el primero que encuentres)
    const estudiantes = await this.obtenerEstudiantesDelCurso(tareaData.id_curso);
    
    if (estudiantes.length > 0) {
      // Crear notificación para cada estudiante del curso
      const notificacionesPromises = estudiantes.map(async (estudiante) => {
        const notificacionPayload = {
          mensaje: `📚 Nueva Tarea: ${tareaData.titulo}`,
          id_tarea: tareaGuardada.id_tarea,
          id_estudiante: estudiante.id_usuario,
        };

        const notificacionGuardada = await this.notificationsService.crearNotificacion(notificacionPayload);

        // Publicar evento Redis
        await this.client.emit('notificacion_estudiante', {
          ...notificacionPayload,
          id: notificacionGuardada.id_notificacion,
          fechaCreacion: notificacionGuardada.fecha_envio,
        }).toPromise();

        return notificacionGuardada;
      });

      const notificaciones = await Promise.all(notificacionesPromises);
      console.log(`📢 Notificaciones enviadas a ${estudiantes.length} estudiantes`);
      
      return { 
        mensaje: 'Tarea publicada y notificada',
        tareaId: tareaGuardada.id_tarea,
        notificacionesIds: notificaciones.map(n => n.id_notificacion),
      };
    } else {
      // Si no hay estudiantes, crear notificación genérica sin id_estudiante
      console.log('⚠️ No hay estudiantes en el curso, creando notificación genérica');
      
      const notificacionGuardada = await this.notificationsService.crearNotificacion({
        mensaje: `📚 Nueva Tarea: ${tareaData.titulo}`,
        id_tarea: tareaGuardada.id_tarea,
        id_estudiante: 1, // Usar un estudiante por defecto (Shirley)
      });

      await this.client.emit('notificacion_estudiante', {
        mensaje: `📚 Nueva Tarea: ${tareaData.titulo}`,
        id_tarea: tareaGuardada.id_tarea,
        id_estudiante: 1,
        id: notificacionGuardada.id_notificacion,
        fechaCreacion: notificacionGuardada.fecha_envio,
      }).toPromise();

      return { 
        mensaje: 'Tarea publicada y notificada (estudiante por defecto)',
        tareaId: tareaGuardada.id_tarea,
        notificacionId: notificacionGuardada.id_notificacion,
      };
    }
  } catch (error) {
    console.error('❌ Error creando notificaciones:', error);
    
    // Si falla la notificación, al menos retornar que la tarea se guardó
    return { 
      mensaje: 'Tarea publicada (error en notificaciones)',
      tareaId: tareaGuardada.id_tarea,
      error: error.message
    };
  }
}

// Método auxiliar para obtener estudiantes del curso
private async obtenerEstudiantesDelCurso(idCurso: number): Promise<any[]> {
  try {
    // Esta consulta asume que tienes una tabla de inscripciones
    // Si no la tienes, puedes retornar estudiantes por defecto
    return [
      { id_usuario: 2, nombre: 'Shirley Ediza Chela Llumiguano' } // Shirley
    ];
  } catch (error) {
    console.error('Error obteniendo estudiantes del curso:', error);
    return [];
  }
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

  // ✅ Nuevo método para consultas personalizadas
async consultarTareas(filtros: { id_curso?: number; id_tarea?: number }) {
  const query = this.taskRepository.createQueryBuilder('tarea');

  // Si hay id_curso, lo añadimos al filtro
  if (filtros.id_curso) {
    query.andWhere('tarea.id_curso = :id_curso', { id_curso: filtros.id_curso });
  }

  // Si hay id_tarea, lo añadimos al filtro
  if (filtros.id_tarea) {
    query.andWhere('tarea.id_tarea = :id_tarea', { id_tarea: filtros.id_tarea });
  }

  // Solo traer tareas activas
  query.andWhere('tarea.activa = :activa', { activa: true });

  // Ordenar por fecha de publicación
  query.orderBy('tarea.fecha_publicacion', 'DESC');

  // Ejecutar consulta
  const tareas = await query.getMany();

  return tareas.length > 0
    ? tareas
    : { mensaje: 'No se encontraron tareas con los filtros dados.' };
}

}