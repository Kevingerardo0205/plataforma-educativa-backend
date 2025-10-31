// src/modules/auth/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('usuarios') // Nombre exacto de tu tabla en la BD
export class User {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Column()
  contrasena: string;

  @Column({ type: 'enum', enum: ['Docente', 'Estudiante'] })
  rol: string;

  @CreateDateColumn()
  fecha_registro: Date;
}