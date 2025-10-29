import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query 
} from '@nestjs/common';
import { PublisherService } from './publisher.service';

@Controller('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  // Endpoint existente para notificaciones genéricas
  @Post('notificacion')
  async enviarNotificacion(@Body() body: { 
    titulo: string; 
    contenido: string; 
    estudianteId?: string; 
  }) {
    return this.publisherService.publishNotification(body);
  }

  // NUEVOS endpoints para tareas
  @Post('tarea')
  async crearTarea(@Body() body: {
    titulo: string;
    descripcion: string;
    fechaLimite: string;
    horaLimite?: string;
    enlace?: string;
    permitirSubidaArchivos?: boolean;
    cursoId?: string;
    docenteId?: string;
  }) {
    const fechaLimite = new Date(body.fechaLimite);
    return await this.publisherService.publishTask({
      ...body,
      fechaLimite
    });
  }

  @Get('tareas')
  async obtenerTareas(@Query('cursoId') cursoId?: string) {
    return await this.publisherService.obtenerTareasPorCurso(cursoId);
  }

  @Get('tarea/:id')
  async obtenerTarea(@Param('id') id: number) {
    return await this.publisherService.obtenerTareaPorId(id);
  }

  // Puedes agregar más endpoints para actualizar/eliminar tareas
}