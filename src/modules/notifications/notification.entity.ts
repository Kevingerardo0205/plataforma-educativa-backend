import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notificaciones') // Nombre exacto de la tabla en BD
export class Notification {
  @PrimaryGeneratedColumn()
  id_notificacion: number; // Coincide con BD

  @Column({ length: 255 })
  mensaje: string; // Coincide con BD

  @CreateDateColumn()
  fecha_envio: Date; // Coincide con BD

  @Column()
  id_tarea: number; // Coincide con BD

  @Column()
  id_estudiante: number; // Coincide con BD

  @Column({ 
    type: 'enum',
    enum: ['Pendiente', 'Leida'],
    default: 'Pendiente'
  })
  estado: string; // Coincide con BD

  // Campo virtual para compatibilidad
  get leido(): boolean {
    return this.estado === 'Leida';
  }

  // Campo virtual para compatibilidad
  get fechaCreacion(): Date {
    return this.fecha_envio;
  }
}