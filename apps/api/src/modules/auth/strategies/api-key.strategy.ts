import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { ApiKeyService } from '../../api-keys/api-key.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private readonly apiKeyService: ApiKeyService) {
    super();
  }

  async validate(req: Request): Promise<{ clientId: string }> {
    const rawKey = req.headers['x-api-key'] as string;
    if (!rawKey) throw new UnauthorizedException('API Key missing');

    const apiKey = await this.apiKeyService.validate(rawKey);
    if (!apiKey) throw new UnauthorizedException('Invalid or inactive API Key');

    return { clientId: apiKey.clientId };
  }
}
