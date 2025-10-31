import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tareas') // Nombre exacto de la tabla en BD
export class Task {
  @PrimaryGeneratedColumn()
  id_tarea: number; // Coincide con BD

  @Column({ length: 200 })
  titulo: string; // Coincide con BD

  @Column('text')
  descripcion: string; // Coincide con BD

  @CreateDateColumn()
  fecha_publicacion: Date; // Coincide con BD

  @Column({ type: 'date' })
  fecha_limite: Date; // Coincide con BD

  @Column({ type: 'time', nullable: true })
  hora_limite: string; // Coincide con BD

  @Column({ length: 255, nullable: true })
  archivo_material: string; // Coincide con BD

  @Column()
  id_curso: number; // Coincide con BD

  // Campos adicionales para compatibilidad
  @Column({ default: true })
  activa: boolean;

  // Campo virtual para compatibilidad
  get fechaPublicacion(): Date {
    return this.fecha_publicacion;
  }

  // Campo virtual para compatibilidad con tu código
  get id(): number {
    return this.id_tarea;
  }
}