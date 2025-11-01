// src/modules/publisher/publisher.controller.ts
import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common';
import { PublisherService } from './publisher.service';

@Controller('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Post('notificacion')
  async enviarNotificacion(@Body() body: { 
    mensaje: string;
    id_estudiante?: number;
    id_tarea?: number;
  }) {
    return this.publisherService.publishNotification(body);
  }

  @Post('tarea')
  async crearTarea(@Body() body: {
    titulo: string;
    descripcion: string;
    fecha_limite: string;
    hora_limite?: string;
    archivo_material?: string;
    id_curso: number;
  }) {
    const fecha_limite = new Date(body.fecha_limite);
    return await this.publisherService.publishTask({
      ...body,
      fecha_limite,
      id_curso: body.id_curso
    });
  }

  @Get('tareas')
  async obtenerTareas(
    @Query('cursoId') cursoId?: string,
    @Query('docenteId') docenteId?: string
  ) {
    if (cursoId) {
      return await this.publisherService.obtenerTareasPorCurso(parseInt(cursoId));
    }
    if (docenteId) {
      return await this.publisherService.obtenerTareasPorDocente(parseInt(docenteId));
    }
    return [];
  }

  @Get('tarea/:id')
  async obtenerTarea(@Param('id') id: string) {
    return await this.publisherService.obtenerTareaPorId(parseInt(id));
  }

  @Post('consultar')
  async consultarTareas(@Body() body: { id_curso?: number; id_tarea?: number }) {
    return await this.publisherService.consultarTareas(body);
  }

  @Get('estudiante/cursos')
  async obtenerCursosDelEstudiante(@Query('estudianteId') estudianteId: string) {
    return await this.publisherService.obtenerCursosDelEstudiante(parseInt(estudianteId));
  }

 // En publisher.controller.ts
@Put('tarea/:id')
async actualizarTarea(
  @Param('id') id: string,
  @Body() tareaData: {
    titulo?: string;
    descripcion?: string;
    fecha_limite?: string;
    hora_limite?: string;
    archivo_material?: string;
  }
) {
  console.log('🔄 Controller: Actualizando tarea ID:', id, 'Datos:', tareaData);
  return await this.publisherService.actualizarTarea(parseInt(id), tareaData);
}

@Delete('tarea/:id')
async eliminarTarea(@Param('id') id: string) {
  console.log('🗑️ Controller: Eliminación FÍSICA tarea ID:', id);
  return await this.publisherService.eliminarTarea(parseInt(id));
}

}
