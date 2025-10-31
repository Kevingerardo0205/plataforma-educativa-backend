import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    try {
      console.log('🔐 Intento de login:', loginData.email);
      
      const user = await this.authService.validateUser(loginData.email, loginData.password);
      
      if (!user) {
        throw new HttpException('Credenciales incorrectas', HttpStatus.UNAUTHORIZED);
      }

      return {
        id: user.id_usuario,
        nombre: user.nombre,
        rol: user.rol,
        email: user.correo
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw new HttpException(
        error.message || 'Error del servidor', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}