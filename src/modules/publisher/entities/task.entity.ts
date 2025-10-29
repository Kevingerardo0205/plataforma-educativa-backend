import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column('text')
  descripcion: string;

  @Column({ type: 'date' })
  fechaLimite: Date;

  @Column({ type: 'time', nullable: true })
  horaLimite: string;

  @Column({ nullable: true })
  enlace: string;

  @Column({ default: false })
  permitirSubidaArchivos: boolean;

  @Column({ default: true })
  activa: boolean;

  @Column({ nullable: true })
  cursoId: string;

  @Column({ nullable: true })
  docenteId: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaActualizacion: Date;
}