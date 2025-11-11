import { WebSocketGateway,WebSocketServer,OnGatewayConnection,} 
from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log(`Cliente conectado: ${client.id}`);

    // Importante: el cliente debe enviar su ID de estudiante cuando se conecte.
    client.on('registrar_estudiante', (idEstudiante) => {
      client.join(`estudiante_${idEstudiante}`);
      console.log(`✅ Estudiante ${idEstudiante} unido a sala estudiante_${idEstudiante}`);
    });
  }

  // ESTO ES LO QUE NECESITAS PARA EL PASO 2
  emitToFrontend(data: any) {
    const room = `estudiante_${data.id_estudiante}`;
    console.log(`📡 Enviando notificación al frontend -> ${room}`, data);

    this.server.to(room).emit('nueva_notificacion', data);
  }
}
