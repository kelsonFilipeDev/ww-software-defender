import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateTokenDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  generateToken(@Body() dto: GenerateTokenDto) {
    return this.authService.generateToken(dto.clientId);
  }
}
