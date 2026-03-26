# Sprint 1 — Environment & Infrastructure Config

## Objetivo
Configurar variáveis de ambiente e ligar o NestJS ao PostgreSQL e Redis.

## Dependências Instaladas

### apps/api
- `@nestjs/config` → carregamento de variáveis de ambiente
- `@nestjs/typeorm` + `typeorm` + `pg` → ligação ao PostgreSQL
- `@nestjs/cache-manager` + `cache-manager` + `@keyv/redis` → ligação ao Redis

## Configuração

### Variáveis de Ambiente
Ficheiro: `apps/api/.env`
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=ww_user
DB_PASSWORD=ww_password
DB_NAME=ww_defender
REDIS_HOST=localhost
REDIS_PORT=6379
```

> ⚠️ O ficheiro `.env` está no `.gitignore` — nunca vai para o repositório.

### AppModule
Ficheiro: `apps/api/src/app.module.ts`

Módulos configurados:
- `ConfigModule` → global, carrega `.env`
- `TypeOrmModule` → ligação ao PostgreSQL via variáveis de ambiente
- `CacheModule` → ligação ao Redis via `@keyv/redis`

### Decisões Técnicas
- `synchronize: true` apenas em `development` — nunca em produção
- `entities` carregadas dinamicamente via glob pattern
- Cache global disponível em todos os módulos

## Serviços em execução
| Serviço    | URL                   |
|------------|-----------------------|
| Next.js    | http://localhost:3000 |
| NestJS API | http://localhost:3001 |
| PostgreSQL | localhost:5432        |
| Redis      | localhost:6379        |

## Comandos
```bash
# Arrancar API em modo desenvolvimento
cd apps/api
npm run start:dev

# Arrancar tudo via Turbo
npm run dev
```
