# WW Software Defender — Overview Final v1.1

## Estado
Produto: **v1.1 — Multi-Tenant Ready**
Branch: `main`
Versão: `1.1`
Data: Abril 2026
URL de Produção: https://ww-software-defender-production.up.railway.app

## O que foi construído na v1.1

Quatro sprints sobre a base sólida da v1.0 — drill-down forense, autenticação por API Key para sistemas externos, rate limiting por entidade, webhooks com retry, deploy em produção e fundação de multi-tenancy com isolamento por schema PostgreSQL.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Monorepo | Turborepo + npm workspaces |
| Backend | NestJS + TypeORM + PostgreSQL |
| Cache / Rate Limiting | Redis + @keyv/redis + @nestjs/cache-manager |
| Auth | JWT + Passport + API Keys (passport-custom) |
| Rate Limiting Global | @nestjs/throttler |
| Frontend | Next.js 16 + Framer Motion |
| Infra local | Docker Compose |
| Infra produção | Railway (API + PostgreSQL + Redis) |
| CI/CD | GitHub Actions |
| Qualidade | ESLint + Husky + Commitlint |

## Arquitectura
ww-software-defender/
├── apps/
│   ├── api/                         → NestJS (core engine)
│   │   └── src/
│   │       ├── common/
│   │       │   └── tenant-context/  → ALS + TenantMiddleware
│   │       ├── infrastructure/
│   │       │   └── database/
│   │       │       ├── data-source.ts
│   │       │       └── migrations/
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   ├── api-keys/
│   │       │   ├── tenants/
│   │       │   ├── event/
│   │       │   ├── risk/
│   │       │   ├── state/
│   │       │   ├── decision/
│   │       │   ├── action/
│   │       │   ├── audit/
│   │       │   └── webhooks/
│   │       └── shared/
│   │           ├── guards/
│   │           └── interceptors/
│   └── web/                         → Next.js (dashboard)
│       └── app/
│           ├── dashboard/
│           ├── events/
│           ├── audit/
│           └── entity/[id]/
├── docs/
│   ├── sprints/
│   ├── incidents/
│   └── infrastructure.md
├── infra/docker/
└── .github/workflows/

## Módulos — Backend

| Módulo | Rotas | Auth | Testes |
|--------|-------|------|--------|
| Auth | POST /api/auth/token | Público | ✅ |
| API Keys | POST /api/keys, DELETE /api/keys/:id | JWT | ✅ 5 |
| Tenants | — (interno) | — | — |
| Event | POST /api/events, GET /api/events, GET /api/events/:entityId | JWT ou API Key | ✅ 5 |
| Risk | GET /api/risk/:entityId | JWT ou API Key | ✅ 5 |
| State | GET /api/state/:entityId | JWT ou API Key | ✅ 7 |
| Decision | GET /api/decision/:entityId | JWT ou API Key | ✅ 6 |
| Action | POST /api/action/:entityId | JWT ou API Key | ✅ 6 |
| Audit | GET /api/audit, GET /api/audit/:entityId | JWT ou API Key | ✅ 3 |
| Webhooks | POST /api/webhooks, GET /api/webhooks | JWT | ✅ 5 |

**Total: 31 testes unitários — 100% cobertura nos services**
**Total: 12 testes E2E — fluxo completo validado**

## Fluxo Central
POST /api/auth/token { clientId, apiKey }  → JWT { tenantId, tenantSlug, schemaName }
POST /api/events                            → registar evento (JWT ou API Key)
GET  /api/risk/:entityId                   → calcular score (0–100)
GET  /api/state/:entityId                  → NORMAL|SUSPEITO|ALERTA|CRÍTICO|BLOQUEADO
GET  /api/decision/:entityId               → ALLOW|THROTTLE|CHALLENGE|BLOCK
POST /api/action/:entityId                 → executar acção + auditar + disparar webhook
GET  /api/audit/:entityId                  → reconstruir histórico forense

## Fluxo de Autenticação v1.1
POST /api/auth/token { clientId: "default", apiKey: "<raw-key>" }
→ TenantsService.findBySlug("default") → Tenant
→ ApiKeyService.validate(rawKey, tenant.id) → ApiKey
→ JWT { sub, tenantId, tenantSlug, schemaName }

Sistemas externos podem autenticar via header `x-api-key: <raw-key>` em vez de JWT.

## Schema da Base de Dados

### Schema `public` (Global)
| Tabela | Colunas principais |
|--------|-------------------|
| `tenants` | id, name, slug, schema_name, status, created_at |
| `migrations` | controlo TypeORM |

### Schema `tenant_default` (Operacional)
| Tabela | Colunas principais |
|--------|-------------------|
| `events` | id, type, entityId, payload, correlationId, createdAt |
| `audit_logs` | id, entityId, score, state, action, status, correlationId, createdAt |
| `api_keys` | id, key, tenantId (FK), active, createdAt |
| `webhooks` | id, url, clientId, secret, active, createdAt |

## Modelo de Risco

| Evento | Peso |
|--------|------|
| LoginFailed | +5 |
| LoginFailedRepeat | +10 |
| SuspiciousIp | +20 |
| PasswordReset | +25 |

| Score | Estado | Acção |
|-------|--------|-------|
| 0–20 | NORMAL | ALLOW |
| 21–40 | SUSPEITO | THROTTLE |
| 41–60 | ALERTA | CHALLENGE |
| 61–80 | CRÍTICO | BLOCK |
| 81–100 | BLOQUEADO | BLOCK |

## Frontend — Dashboard

| Página | Rota | Funcionalidades |
|--------|------|----------------|
| Home | / | Boot screen animada |
| Dashboard | /dashboard | KPIs, Risk Timeline SVG, Pie Charts, Audit Logs, Auto-refresh 30s |
| Events | /events | Stream de eventos com filtro em tempo real |
| Audit | /audit | Trail forense completo com filtro |
| Entity Drill-Down | /entity/[id] | Estado actual, Risk Score, Event Timeline, Decision History |

UI em inglês. Design: Mr Robot / Black Hat — Share Tech Mono + Rajdhani, preto e vermelho.

## Multi-Tenancy — Estado Actual

Isolamento estrutural implementado. Switching dinâmico adiado intencionalmente (YAGNI) até existir um segundo cliente real.

| Componente | Estado |
|---|---|
| Schema `tenant_default` criado | ✅ |
| Tabelas operacionais isoladas | ✅ |
| Tenant entity + TenantsService | ✅ |
| TenantContext via AsyncLocalStorage | ✅ |
| TenantMiddleware (excluindo /auth) | ✅ |
| JWT com tenantId + schemaName | ✅ |
| Switching dinâmico por request | ⏳ Sprint futuro |

## Migrations

| Migration | Descrição |
|-----------|-----------|
| `1774646631477-InitialSchema` | Schema inicial |
| `1774691055808-AddAuditLogs` | Tabela audit_logs |
| `1774993306699-CreateAllTables` | Tabelas core + ENUMs |
| `1775443673804-CreateApiKeysTable` | Tabela api_keys |
| `1775731454973-CreateWebhooksTable` | Tabela webhooks |
| `1776000000000-MultiTenancyZero` | Tabela tenants + backfill api_keys |
| `1776000000001-MoveToTenantDefaultSchema` | Schema tenant_default + mover tabelas |
| `1776000000002-AddCreatedAtToTenants` | Coluna created_at em tenants |

## CI/CD Pipeline
Push ou PR → develop ou main
↓
Job 1: Lint + Unit Tests (31 testes)
↓
Job 2: E2E Tests — PostgreSQL 16 + Redis 7 (12 testes)
→ seed tenant_default + API Key
→ fluxo completo Auth → Events → Risk → State → Decision → Action → Audit
↓
Verde → merge autorizado → Railway deploy automático

## Infra Produção — Railway

| Serviço | Tecnologia | Estado |
|---------|------------|--------|
| ww-software-defender | NestJS (Docker) | Online |
| Postgres | PostgreSQL plugin | Online |
| Redis | Redis plugin | Online |

Migrations em produção via TCP Proxy:
```bash
cd apps/api && DB_HOST=maglev.proxy.rlwy.net DB_PORT=35612 \
DB_USER=postgres DB_PASSWORD=<PGPASSWORD> DB_NAME=railway \
npm run migration:run
```

## Comandos Essenciais

```bash
# Ambiente local
docker compose -f infra/docker/docker-compose.yml up -d
npm run dev

# Testes unitários
cd apps/api && npm run test

# Testes E2E
cd apps/api && npm run test:e2e

# Migrations local
cd apps/api && npm run migration:run

# Migrations produção
cd apps/api && DB_HOST=maglev.proxy.rlwy.net DB_PORT=35612 \
DB_USER=postgres DB_PASSWORD=<PGPASSWORD> DB_NAME=railway \
npm run migration:run
```

## Sprints v1.1

| Sprint | Feature | Estado |
|--------|---------|--------|
| Sprint 11 | Entity Drill-Down + UI Translation | ✅ |
| Sprint 12 | API Keys para sistemas externos | ✅ |
| Sprint 13 | Rate Limiting por entidade via Redis | ✅ |
| Sprint 14 | Webhooks com retry | ✅ |
| Sprint 15 | Deploy Railway | ✅ |
| Sprint 16 | Multi-Tenancy (isolamento estrutural) | ✅ |

## Próximas Evoluções (pós-v1.1)

- Switching dinâmico de schema por request (Sprint 17)
- Gestão de tenants via API (criar, suspender, listar)
- Dashboard por tenant — métricas isoladas
- Field Level Encryption (AES-256-GCM) em campos sensíveis
- Machine learning para ajuste dinâmico de thresholds
- SDK cliente para integração simplificada
