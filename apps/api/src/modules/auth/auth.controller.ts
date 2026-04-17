import { Controller, Post, Body } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { AuthService } from './auth.service';

export class GenerateTokenDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  generateToken(@Body() dto: GenerateTokenDto) {
    return this.authService.generateToken(dto.clientId, dto.apiKey);
  }
}
