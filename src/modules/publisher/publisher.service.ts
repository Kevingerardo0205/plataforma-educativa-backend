import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { DataSource } from 'typeorm';

@Injectable()
export class PublisherService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource, 

  ) {}

  async publishNotification(payload: {
  mensaje: string;
  id_estudiante: number;
  id_tarea: number;
}) {
  // ✅ Validar que existen ambos valores requeridos
  if (!payload.id_estudiante || !payload.id_tarea) {
    throw new HttpException(
      'id_estudiante y id_tarea son requeridos y deben existir',
      HttpStatus.BAD_REQUEST
    );
  }

  // ✅ 1. Verificar existencia reales en la BD
  const tareaExiste = await this.taskRepository.findOne({
    where: { id_tarea: payload.id_tarea }
  });

  if (!tareaExiste) {
    throw new HttpException(
      `La tarea con id ${payload.id_tarea} no existe`,
      HttpStatus.BAD_REQUEST
    );
  }

  const estudianteExiste = await this.dataSource.query(
    'SELECT id_usuario FROM Usuarios WHERE id_usuario = ? LIMIT 1', 
    [payload.id_estudiante]
  );

  if (estudianteExiste.length === 0) {
    throw new HttpException(
      `El estudiante con id ${payload.id_estudiante} no existe`,
      HttpStatus.BAD_REQUEST
    );
  }

  // ✅ 2. Guardar notificación en BD
  const notificacionGuardada = await this.notificationsService.crearNotificacion({
    mensaje: payload.mensaje,
    id_tarea: payload.id_tarea,
    id_estudiante: payload.id_estudiante,
  });

  console.log('💾 Notificación guardada:', notificacionGuardada);

  // ✅ 3. Publicar evento en Redis
  await this.client.emit('notificacion_estudiante', {
    ...payload,
    id_notificacion: notificacionGuardada.id_notificacion,
    fecha_envio: notificacionGuardada.fecha_envio,
  }).toPromise();

  return {
    success: true,
    mensaje: 'Notificación publicada y guardada correctamente',
    datos: notificacionGuardada
  };
}


async publishTask(tareaData: {
  titulo: string;
  descripcion: string;
  fecha_limite: Date;
  hora_limite?: string;
  archivo_material?: string;
  id_curso: number;
}) {

  console.log('🚨 INICIANDO PUBLISH TASK - CREAR NUEVA TAREA');

  // ✅ 1. Guardar primero la tarea en BD
  const tarea = this.taskRepository.create(tareaData);
  const tareaGuardada = await this.taskRepository.save(tarea);

  console.log('💾 Tarea guardada en BD con ID:', tareaGuardada.id_tarea);

  // ✅ 2. Buscar estudiantes inscritos en este curso
  const estudiantes = await this.obtenerEstudiantesDelCurso(tareaGuardada.id_curso);

  console.log('📡 Estudiantes inscritos a este curso:', estudiantes);

  // ✅ 3. Publicar la tarea al canal del curso
  const canalCurso = `curso_${tareaGuardada.id_curso}`;

  try {
    await this.client.emit(canalCurso, {
      id_tarea: tareaGuardada.id_tarea,
      titulo: tareaGuardada.titulo,
      id_curso: tareaGuardada.id_curso,
      fecha_publicacion: tareaGuardada.fecha_publicacion,
      estudiantes: estudiantes.map(e => e.id_estudiante)
    }).toPromise();

    console.log(`📡 Evento publicado correctamente en canal ${canalCurso}`);

  } catch (error) {
    console.error('❌ Error publicando evento tarea_creada:', error);
    throw new HttpException('Error enviando evento Redis', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  return {
    mensaje: 'Tarea creada y notificada',
    tareaId: tareaGuardada.id_tarea
  };
}

private async obtenerEstudiantesDelCurso(idCurso: number): Promise<any[]> {
  try {
    const estudiantes = await this.dataSource.query(`
      SELECT id_estudiante
      FROM inscripciones 
      WHERE id_curso = ?
    `, [idCurso]);

    return estudiantes;

  } catch (error) {
    console.error('❌ Error obteniendo estudiantes del curso:', error);
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