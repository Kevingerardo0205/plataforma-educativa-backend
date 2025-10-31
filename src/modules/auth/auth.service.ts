import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('🔍 Buscando usuario:', email);
    
    const user = await this.userRepository.findOne({
      where: { correo: email, contrasena: password }
    });

    console.log('📋 Usuario encontrado:', user ? 'Sí' : 'No');
    
    if (user) {
      const { contrasena, ...result } = user;
      return result;
    }
    return null;
  }

  // Método para obtener todos los usuarios (para debugging)
  async getAllUsers() {
    return await this.userRepository.find();
  }
}