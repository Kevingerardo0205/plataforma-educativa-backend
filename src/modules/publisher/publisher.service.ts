import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
      id_tarea: payload.id_tarea || 0,
      id_estudiante: payload.id_estudiante || 0,
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
// En publisher.service.ts - Agrega logs al publishTask
async publishTask(tareaData: {
  titulo: string;
  descripcion: string;
  fecha_limite: Date;
  hora_limite?: string;
  archivo_material?: string;
  id_curso: number;
}) {
  console.log('🚨 INICIANDO PUBLISH TASK - CREAR NUEVA TAREA');
  console.log('🚨 Stack trace publishTask:', new Error().stack);
  console.log('📤 Datos para nueva tarea:', tareaData);
  
  // 1. Guardar tarea en BD
  const tarea = this.taskRepository.create(tareaData);
  const tareaGuardada = await this.taskRepository.save(tarea);
  
  console.log('💾 Tarea guardada en BD con ID:', tareaGuardada.id_tarea);
  
  // ... resto del código igual
}
 
  // ✅ CONSULTA DIRECTA a la base de datos para obtener estudiantes
  private async obtenerEstudiantesDelCurso(idCurso: number): Promise<any[]> {
    try {
      console.log(`🔍 Buscando estudiantes para curso: ${idCurso}`);
      
      // Consulta directa a la base de datos
      const estudiantes = await this.taskRepository.query(`
        SELECT id_estudiante
        FROM inscripciones 
        WHERE id_curso = ?
      `, [idCurso]);

      console.log(`✅ Estudiantes encontrados en curso ${idCurso}:`, estudiantes);
      
      // Verificar que tenemos datos válidos
      const estudiantesValidos = estudiantes.filter(est => 
        est && est.id_estudiante && !isNaN(est.id_estudiante)
      );

      console.log(`📊 Total de estudiantes válidos: ${estudiantesValidos.length}`);

      return estudiantesValidos;

    } catch (error) {
      console.error('❌ Error obteniendo estudiantes del curso:', error);
      
      // En caso de error, retornar array vacío
      return [];
    }
  }

  // ✅ Método para obtener tareas por curso
  async obtenerTareasPorCurso(id_curso: number): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { id_curso, activa: true },
      order: { fecha_publicacion: 'DESC' },
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

  // En publisher.service.ts
// En publisher.service.ts - actualiza consultarTareas si quieres ver todas
async consultarTareas(filtros: { id_curso?: number; id_tarea?: number }) {
  console.log('🔍 Consultando tareas con filtros:', filtros);
  
  const query = this.taskRepository.createQueryBuilder('tarea');

  // Si hay id_curso, lo añadimos al filtro
  if (filtros.id_curso) {
    query.andWhere('tarea.id_curso = :id_curso', { id_curso: filtros.id_curso });
  }

  // Si hay id_tarea, lo añadimos al filtro
  if (filtros.id_tarea) {
    query.andWhere('tarea.id_tarea = :id_tarea', { id_tarea: filtros.id_tarea });
  }

  // ❌ REMOVER este filtro si quieres ver TODAS las tareas (incluyendo inactivas)
  // query.andWhere('tarea.activa = :activa', { activa: true });

  // Ordenar por fecha de publicación
  query.orderBy('tarea.fecha_publicacion', 'DESC');

  // Ejecutar consulta
  const tareas = await query.getMany();

  console.log(`📊 Tareas encontradas: ${tareas.length}`);
  tareas.forEach(t => console.log(`   - ID: ${t.id_tarea}, Título: ${t.titulo}, Activa: ${t.activa}`));

  return tareas.length > 0
    ? tareas
    : [];
}
async obtenerCursosDelEstudiante(id_estudiante: number): Promise<any[]> {
  try {
    console.log(`🔍 Buscando cursos para estudiante: ${id_estudiante}`);
    
    const cursos = await this.taskRepository.query(`
      SELECT c.id_curso, c.nombre_curso, c.descripcion
      FROM cursos c
      INNER JOIN inscripciones i ON c.id_curso = i.id_curso
      WHERE i.id_estudiante = ?
    `, [id_estudiante]);

    console.log(`✅ Cursos encontrados para estudiante ${id_estudiante}:`, cursos);
    return cursos;

  } catch (error) {
    console.error('❌ Error obteniendo cursos del estudiante:', error);
    return [];
  }
}

// En publisher.service.ts - Agrega esto temporalmente
async actualizarTarea(
  id_tarea: number, 
  tareaData: {
    titulo?: string;
    descripcion?: string;
    fecha_limite?: string;
    hora_limite?: string;
    archivo_material?: string;
  }
) {
  console.log('🚨 INICIANDO ACTUALIZAR TAREA - ID:', id_tarea);
  console.log('🚨 Stack trace completo:', new Error().stack);
  
  try {
    console.log(`✏️ Actualizando tarea ID: ${id_tarea}`, tareaData);

    // Buscar la tarea existente
    const tareaExistente = await this.taskRepository.findOne({
      where: { id_tarea, activa: true }
    });

    if (!tareaExistente) {
      throw new HttpException(
        {
          success: false,
          error: `Tarea con ID ${id_tarea} no encontrada`,
          tareaId: id_tarea,
          actualizado: false
        },
        HttpStatus.NOT_FOUND
      );
    }

    console.log('✅ Tarea existente encontrada:', tareaExistente);

    // Preparar datos para actualizar
    const datosActualizacion: any = {};
    
    if (tareaData.titulo !== undefined) datosActualizacion.titulo = tareaData.titulo;
    if (tareaData.descripcion !== undefined) datosActualizacion.descripcion = tareaData.descripcion;
    if (tareaData.fecha_limite !== undefined) datosActualizacion.fecha_limite = new Date(tareaData.fecha_limite);
    if (tareaData.hora_limite !== undefined) datosActualizacion.hora_limite = tareaData.hora_limite;
    if (tareaData.archivo_material !== undefined) datosActualizacion.archivo_material = tareaData.archivo_material;

    console.log('📝 Datos para actualizar:', datosActualizacion);

    // SOLO ACTUALIZAR - NO CREAR NUEVA TAREA
    const resultado = await this.taskRepository.update(
      { id_tarea },
      datosActualizacion
    );

    console.log('✅ Resultado de update:', resultado);

    if (resultado.affected === 0) {
      throw new HttpException(
        {
          success: false,
          error: 'No se pudo actualizar la tarea',
          tareaId: id_tarea,
          actualizado: false
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Obtener la tarea actualizada
    const tareaActualizada = await this.taskRepository.findOne({
      where: { id_tarea }
    });

    console.log('✅ Tarea actualizada correctamente:', tareaActualizada);

    // RETORNAR OBJETO JSON EXPLÍCITO
    return {
      success: true,
      mensaje: 'Tarea actualizada correctamente',
      tarea: tareaActualizada,
      actualizado: true,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error en actualizarTarea:', error);
    throw error;
  }
}
  // ✅ Método CORREGIDO para eliminar tarea (borrado lógico)

// En publisher.service.ts - REEMPLAZA completamente el método eliminarTarea
async eliminarTarea(id_tarea: number) {
  try {
    console.log(`🔥 ELIMINACIÓN FÍSICA - Tarea ID: ${id_tarea}`);

    // Buscar la tarea existente (sin filtrar por activa)
    const tareaExistente = await this.taskRepository.findOne({
      where: { id_tarea }
    });

    if (!tareaExistente) {
      throw new HttpException(
        {
          success: false,
          error: `Tarea con ID ${id_tarea} no encontrada`,
          tareaId: id_tarea,
          eliminado: false
        },
        HttpStatus.NOT_FOUND
      );
    }

    console.log('✅ Tarea encontrada para eliminación física:', tareaExistente);

    // ✅ BORRADO FÍSICO - ELIMINAR PERMANENTEMENTE
    const resultado = await this.taskRepository.delete(id_tarea);

    console.log('✅ Resultado de eliminación física:', resultado);

    if (resultado.affected === 0) {
      throw new HttpException(
        {
          success: false,
          error: 'No se pudo eliminar la tarea',
          tareaId: id_tarea,
          eliminado: false
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    console.log('🔥 Tarea ELIMINADA FÍSICAMENTE de la base de datos');

    // RETORNAR OBJETO JSON EXPLÍCITO
    return {
      success: true,
      mensaje: 'Tarea eliminada permanentemente de la base de datos',
      tareaId: id_tarea,
      eliminado: true,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error eliminando tarea físicamente:', error);
    
    // Si ya es una HttpException, relanzarla
    if (error instanceof HttpException) {
      throw error;
    }
    
    // Para otros errores, crear una HttpException
    throw new HttpException(
      {
        success: false,
        error: error.message,
        tareaId: id_tarea,
        eliminado: false
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

}