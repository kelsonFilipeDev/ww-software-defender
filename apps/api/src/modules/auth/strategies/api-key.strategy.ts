import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ApiKeyService } from '../../api-keys/api-key.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const passportCustom = require('passport-custom');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const CustomStrategy = passportCustom.Strategy as new () => {
  authenticate: () => void;
};

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  CustomStrategy,
  'api-key',
) {
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
