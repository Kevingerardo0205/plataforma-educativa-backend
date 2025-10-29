import { Controller, Get, Put, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async obtenerNotificaciones(@Query('estudianteId') estudianteId?: string) {
    return await this.notificationsService.obtenerNotificacionesPorEstudiante(estudianteId);
  }

  @Get('noleidas')
  async obtenerNoLeidas(@Query('estudianteId') estudianteId?: string) {
    return await this.notificationsService.obtenerNoLeidasPorEstudiante(estudianteId);
  }

  @Put(':id/leer')
  async marcarComoLeido(@Param('id') id: number) {
    return await this.notificationsService.marcarComoLeido(id);
  }
}