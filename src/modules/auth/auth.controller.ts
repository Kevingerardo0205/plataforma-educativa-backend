import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: { correo: string; contrasena: string }) {
    console.log('Datos de login recibidos:', loginData); // Debug
    
    const user = await this.authService.validateUser(
      loginData.correo, 
      loginData.contrasena
    );
    
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    
    return this.authService.login(user);
  }
}