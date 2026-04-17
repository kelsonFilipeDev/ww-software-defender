import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CombinedAuthGuard } from '../../shared/guards/combined-auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ApiKeyModule } from '../api-keys/api-key.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    PassportModule,
    ApiKeyModule,
    TenantsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') as string,
        signOptions: {
          expiresIn: 86400,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ApiKeyStrategy,
    JwtAuthGuard,
    CombinedAuthGuard,
  ],
  exports: [JwtAuthGuard, CombinedAuthGuard],
})
export class AuthModule {}
