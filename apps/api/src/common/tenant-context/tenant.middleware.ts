import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { tenantStorage } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const tenantId = this.extractTenantId(req);
    if (!tenantId) throw new UnauthorizedException('Tenant not identified');

    tenantStorage.run({ tenantId }, () => next());
  }

  private extractTenantId(req: Request): string | undefined {
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const decoded = this.jwtService.decode<{ tenantId?: string }>(token);
        if (
          decoded &&
          typeof decoded === 'object' &&
          typeof decoded.tenantId === 'string'
        ) {
          return decoded.tenantId;
        }
      } catch {
        // fall through
      }
    }

    const tenantHeader = req.headers['x-tenant-id'];
    if (typeof tenantHeader === 'string' && tenantHeader) return tenantHeader;

    return undefined;
  }
}
