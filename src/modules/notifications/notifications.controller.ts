import { Controller, Get, Param, Query, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async obtenerNotificaciones(@Query('estudianteId') estudianteId?: string) {
    // Convertir string a number
    const id_estudiante = estudianteId ? parseInt(estudianteId) : undefined;
    return await this.notificationsService.obtenerNotificacionesPorEstudiante(id_estudiante);
  }

  @Get('no-leidas')
  async obtenerNoLeidas(@Query('estudianteId') estudianteId?: string) {
    // Convertir string a number
    const id_estudiante = estudianteId ? parseInt(estudianteId) : undefined;
    return await this.notificationsService.obtenerNoLeidasPorEstudiante(id_estudiante);
  }

  @Patch(':id/leer')
  async marcarComoLeido(@Param('id') id: string) {
    // Convertir string a number
    return await this.notificationsService.marcarComoLeido(parseInt(id));
  }
}