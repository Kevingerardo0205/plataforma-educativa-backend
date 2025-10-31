// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(correo: string, contrasena: string): Promise<any> {
    console.log('Validando usuario:', correo); // Debug
    
    const user = await this.userRepository.findOne({
      where: { correo }
    });

    console.log('Usuario encontrado:', user); // Debug

    if (user && user.contrasena === contrasena) {
      const { contrasena, ...result } = user;
      return result;
    }
    
    console.log('Credenciales incorrectas'); // Debug
    return null;
  }

  async login(user: any) {
    return {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
    };
  }
}