export interface CreateNotificationDTO {
  mensaje: string;
  id_tarea: number;
  id_estudiante: number;
  fecha_envio?: Date;
}
