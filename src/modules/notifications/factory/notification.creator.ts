import { Notification } from '../notification.entity';
import { CreateNotificationDTO } from '../dto/create-notification.dto';


export abstract class NotificationCreator {

    abstract crear(data: CreateNotificationDTO): Notification;
}
