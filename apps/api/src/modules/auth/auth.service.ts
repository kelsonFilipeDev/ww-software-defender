import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface TokenPayload {
  clientId: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(clientId: string): { accessToken: string } {
    const payload = { sub: clientId, clientId };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
