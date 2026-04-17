import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import KeyvRedis from '@keyv/redis';
import { JwtModule } from '@nestjs/jwt';
import { EventModule } from './modules/event/event.module';
import { RiskModule } from './modules/risk/risk.module';
import { StateModule } from './modules/state/state.module';
import { DecisionModule } from './modules/decision/decision.module';
import { ActionModule } from './modules/action/action.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApiKeyModule } from './modules/api-keys/api-key.module';
import { WebhookModule } from './modules/webhooks/webhook.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { TenantContextModule } from './common/tenant-context/tenant-context.module';
import { TenantMiddleware } from './common/tenant-context/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        schema: 'tenant_default',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [
          new KeyvRedis(
            `redis://${config.get<string>('REDIS_HOST')}:${config.get<number>('REDIS_PORT')}`,
          ),
        ],
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') as string,
      }),
    }),
    TenantsModule,
    TenantContextModule,
    EventModule,
    RiskModule,
    StateModule,
    DecisionModule,
    ActionModule,
    AuditModule,
    AuthModule,
    ApiKeyModule,
    WebhookModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).exclude('auth/*path').forRoutes('*path');
  }
}
