import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PublisherService } from './publisher.service';

@Controller('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  // Endpoint para notificaciones genéricas
  @Post('notificacion')
  async enviarNotificacion(@Body() body: { 
    mensaje: string;  // Cambiado de 'titulo' y 'contenido' a 'mensaje'
    id_estudiante?: number;  // Cambiado a number
    id_tarea?: number;  // Cambiado a number (opcional)
  }) {
    return this.publisherService.publishNotification(body);
  }

  // Endpoint para crear tarea
  @Post('tarea')
  async crearTarea(@Body() body: {
    titulo: string;
    descripcion: string;
    fecha_limite: string;  // Cambiado a fecha_limite
    hora_limite?: string;  // Cambiado a hora_limite
    archivo_material?: string;  // Cambiado de 'enlace' a 'archivo_material'
    id_curso: number;  // Cambiado a number
  }) {
    const fecha_limite = new Date(body.fecha_limite);
    
    return await this.publisherService.publishTask({
      ...body,
      fecha_limite,
      id_curso: body.id_curso
    });
  }

  // Endpoint para obtener tareas (por curso o docente)
  @Get('tareas')
  async obtenerTareas(
    @Query('cursoId') cursoId?: string,
    @Query('docenteId') docenteId?: string
  ) {
    if (cursoId) {
      // Convertir string a number
      return await this.publisherService.obtenerTareasPorCurso(parseInt(cursoId));
    }
    if (docenteId) {
      // Convertir string a number
      return await this.publisherService.obtenerTareasPorDocente(parseInt(docenteId));
    }
    return [];
  }

  // Endpoint para obtener tarea específica
  @Get('tarea/:id')
  async obtenerTarea(@Param('id') id: string) {  // Cambiado a string y luego convertir
    return await this.publisherService.obtenerTareaPorId(parseInt(id));
  }

  @Post('consultar')
async consultarTareas(@Body() body: { id_curso?: number; id_tarea?: number }) {
  return await this.publisherService.consultarTareas(body);
}
// En publisher.controller.ts - agregar este endpoint
@Get('estudiante/cursos')
async obtenerCursosDelEstudiante(@Query('estudianteId') estudianteId: string) {
  return await this.publisherService.obtenerCursosDelEstudiante(parseInt(estudianteId));
}

}

