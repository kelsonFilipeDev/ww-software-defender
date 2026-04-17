import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantsService } from '../tenants/tenants.service';
import { ApiKeyService } from '../api-keys/api-key.service';

export interface TokenPayload {
  sub: string;
  tenantId: string;
  tenantSlug: string;
  schemaName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantsService: TenantsService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async generateToken(
    slug: string,
    rawKey: string,
  ): Promise<{ accessToken: string }> {
    const tenant = await this.tenantsService.findBySlug(slug);
    const apiKey = await this.apiKeyService.validate(rawKey, tenant.id);
    if (!apiKey) throw new UnauthorizedException('Invalid or inactive API Key');

    const payload: TokenPayload = {
      sub: tenant.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      schemaName: tenant.schemaName,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }
}
