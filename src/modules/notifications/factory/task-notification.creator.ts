import { Notification } from '../notification.entity';
import { NotificationCreator } from './notification.creator';
import { CreateNotificationDTO } from '../dto/create-notification.dto';

export class TaskNotificationCreator extends NotificationCreator {

  crear(data: CreateNotificationDTO): Notification {
    const n = new Notification();
    n.mensaje = `📘 Nueva tarea: ${data.mensaje}`;
    n.id_tarea = data.id_tarea;
    n.id_estudiante = data.id_estudiante;
    n.estado = 'Pendiente';
    return n;
  }
}
