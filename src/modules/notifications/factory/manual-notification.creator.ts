import { Notification } from '../notification.entity';
import { NotificationCreator } from './notification.creator';
import { CreateNotificationDTO } from '../dto/create-notification.dto';


export class ManualNotificationCreator extends NotificationCreator {

  crear(data: CreateNotificationDTO): Notification {
    const n = new Notification();
    n.mensaje = data.mensaje;
    n.id_tarea = data.id_tarea;
    n.id_estudiante = data.id_estudiante;
    n.estado = 'Pendiente';
    return n;
  }
}
