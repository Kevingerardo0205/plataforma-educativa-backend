import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column('text')
  contenido: string;

  @Column({ default: false })
  leido: boolean;

  @Column({ nullable: true })
  estudianteId: string;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaEnvio: Date;
}