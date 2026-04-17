# Sprint 16 — Multi-Tenancy (Isolamento Estrutural)

## Objectivo
Transformar o WW Software Defender numa plataforma multi-tenant com isolamento de dados por schema PostgreSQL, preservando a base existente e preparando o terreno para switching dinâmico futuro.

## Decisões de Arquitectura

### Estratégia de Isolamento
- **Schema por tenant** — cada tenant tem o seu próprio schema PostgreSQL (`tenant_xxx`)
- **Schema `public`** — tabelas globais: `tenants`, `migrations`
- **Schema `tenant_default`** — schema operacional do tenant inicial

### Performance — AsyncLocalStorage em vez de Request Scope
O `Request Scope` do NestJS cria instâncias por request e provoca overhead de GC inaceitável num motor de decisão em tempo real. A solução adoptada usa `AsyncLocalStorage` (ALS) para propagar o `tenantId` de forma transparente, mantendo todos os services como **Singletons**.

### Isolamento de Schema — Estático por agora (YAGNI)
O switching dinâmico por request via `QueryRunner` foi adiado intencionalmente — não há múltiplos clientes simultâneos. O TypeORM aponta para `tenant_default` estaticamente. Quando houver um segundo cliente real, o switching dinâmico será implementado via `EntityManager` dinâmico sem poluir os services existentes.

### Auth — Slug como identificador único
O `clientId` foi substituído pelo `slug` do tenant. O JWT passa a carregar `tenantId`, `tenantSlug` e `schemaName`. A validação usa `slug` (lookup) + API Key (autenticação).

## Ficheiros Criados

### TenantContext (ALS)
| Ficheiro | Descrição |
|---|---|
| `apps/api/src/common/tenant-context/tenant.context.ts` | Store ALS + `getTenantId()` helper |
| `apps/api/src/common/tenant-context/tenant.middleware.ts` | Extrai `tenantId` do JWT/header e popula o ALS |
| `apps/api/src/common/tenant-context/tenant-context.module.ts` | Módulo exportável com `JwtModule` |

### Tenants
| Ficheiro | Descrição |
|---|---|
| `apps/api/src/modules/tenants/tenant.entity.ts` | Entidade Tenant no schema `public` |
| `apps/api/src/modules/tenants/tenants.service.ts` | `findBySlug()` + `findById()` |
| `apps/api/src/modules/tenants/tenants.module.ts` | Módulo com TypeORM + exports |

### Migrations
| Ficheiro | Descrição |
|---|---|
| `apps/api/src/infrastructure/database/migrations/1776000000000-MultiTenancyZero.ts` | Cria tabela `tenants`, insere `tenant_default`, adiciona `tenantId` FK em `api_keys`, remove `clientId` |
| `apps/api/src/infrastructure/database/migrations/1776000000001-MoveToTenantDefaultSchema.ts` | Cria schema `tenant_default`, move ENUMs e tabelas operacionais |

## Ficheiros Alterados

| Ficheiro | Alteração |
|---|---|
| `apps/api/src/app.module.ts` | Regista `TenantsModule`, `TenantContextModule`, `JwtModule`; aplica `TenantMiddleware` excluindo `/auth/*path` ; define `schema: 'tenant_default'` no TypeORM |
| `apps/api/src/modules/api-keys/api-key.entity.ts` | Remove `clientId`, adiciona `tenantId` (FK → `tenants.id`) |
| `apps/api/src/modules/api-keys/api-key.service.ts` | `create()` usa `tenantId`; `validate()` aceita `tenantId` como filtro |
| `apps/api/src/modules/api-keys/dto/create-api-key.dto.ts` | Substitui `clientId` por `tenantId` (UUID) + `name` |
| `apps/api/src/modules/api-keys/api-key.service.spec.ts` | Testes actualizados para `tenantId` |
| `apps/api/src/modules/auth/auth.service.ts` | Recebe `slug` + `rawKey`; busca tenant; valida API Key; JWT com `tenantId`/`tenantSlug`/`schemaName` |
| `apps/api/src/modules/auth/auth.controller.ts` | DTO actualizado com `clientId` (slug) + `apiKey` |
| `apps/api/src/modules/auth/auth.module.ts` | Importa `TenantsModule` |
| `apps/api/src/modules/auth/strategies/jwt.strategy.ts` | `JwtPayload` actualizado com `tenantId`, `tenantSlug`, `schemaName` |
| `apps/api/src/modules/auth/strategies/api-key.strategy.ts` | Retorna `tenantId` em vez de `clientId` |

## Schema da Base de Dados

### Schema `public` (Global)
| Tabela | Descrição |
|---|---|
| `tenants` | id, name, slug, schema_name, status |
| `migrations` | controlo do TypeORM |

### Schema `tenant_default` (Operacional)
| Tabela | Descrição |
|---|---|
| `events` | eventos de segurança |
| `audit_logs` | trail forense |
| `api_keys` | chaves de autenticação (com FK para tenants) |
| `webhooks` | webhooks configurados |

## JWT Payload

```json
{
  "sub": "tenant-uuid",
  "tenantId": "tenant-uuid",
  "tenantSlug": "default",
  "schemaName": "tenant_default"
}
```

## Fluxo de Autenticação
POST /api/auth/token { clientId: "default", apiKey: "raw-key" }
→ TenantsService.findBySlug("default") → Tenant
→ ApiKeyService.validate(rawKey, tenant.id) → ApiKey
→ JWT { tenantId, tenantSlug, schemaName }

## Migrations Executadas

```bash
cd apps/api && npm run migration:run
```

Migrations aplicadas em ordem:
1. `MultiTenancyZero1776000000000` — fundação da tabela tenants + backfill api_keys
2. `MoveToTenantDefaultSchema1776000000001` — isolamento físico por schema

## Comandos

```bash
# Arrancar ambiente local
docker compose -f infra/docker/docker-compose.yml up -d
npm run dev

# Correr migrations
cd apps/api && npm run migration:run
```

## Próximo Sprint — Switching Dinâmico (quando houver múltiplos tenants)
Quando entrar o segundo cliente real, o switching dinâmico será implementado via `EntityManager` com `QueryRunner` dedicado por request, sem alterar os services existentes. O JWT já carrega `schemaName` — a infraestrutura está pronta.
