# WW Software Defender — Overview Final v1.0

## Estado
Produto: **MVP Completo**
Branch: `main`
Versão: `1.0`
Data: Abril 2026

## O que foi construído

Sistema de Monitorização Forense Inteligente — motor de decisão de segurança
que observa eventos, correlaciona comportamentos, calcula risco e executa
respostas defensivas de forma automática, auditável e explicável.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Monorepo | Turborepo + npm |
| Backend | NestJS + TypeORM + PostgreSQL |
| Cache | Redis + Keyv |
| Auth | JWT + Passport |
| Rate Limiting | @nestjs/throttler |
| Frontend | Next.js 16 + Framer Motion |
| Infra local | Docker Compose |
| CI/CD | GitHub Actions |
| Qualidade | ESLint + Husky + Commitlint |

## Arquitectura
```
ww-defender/
├── apps/
│   ├── api/     → NestJS (core engine)
│   └── web/     → Next.js (dashboard)
├── packages/
│   ├── contracts/
│   └── config/
├── infra/docker/
├── docs/
└── .github/workflows/
```

## Módulos — Backend

| Módulo | Rotas | Testes |
|--------|-------|--------|
| Auth | POST /api/auth/token | ✅ |
| Event | POST /api/events, GET /api/events, GET /api/events/:id | ✅ 3 |
| Risk | GET /api/risk/:id | ✅ 5 |
| State | GET /api/state/:id | ✅ 7 |
| Decision | GET /api/decision/:id | ✅ 6 |
| Action | POST /api/action/:id | ✅ 6 |
| Audit | GET /api/audit, GET /api/audit/:id | ✅ 3 |

**Total: 31 testes unitários — 100% cobertura nos services**
**Total: 12 testes e2e — fluxo completo validado**

## Fluxo Central
```
POST /api/auth/token     → gerar JWT
POST /api/events         → registar evento (autenticado)
GET  /api/risk/:id       → calcular score (0–100)
GET  /api/state/:id      → NORMAL|SUSPEITO|ALERTA|CRÍTICO|BLOQUEADO
GET  /api/decision/:id   → ALLOW|THROTTLE|CHALLENGE|BLOCK
POST /api/action/:id     → executar acção + auditar automaticamente
GET  /api/audit/:id      → reconstruir histórico forense
```

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

## Dashboard

| Página | Funcionalidades |
|--------|----------------|
| /dashboard | KPIs, Risk Timeline SVG, Pie Charts, Audit Logs, Auto-refresh 30s |
| /events | Stream de eventos com filtro em tempo real |
| /audit | Trail forense completo com filtro |

Design: Mr Robot / Black Hat — Share Tech Mono + Rajdhani, preto e vermelho.

## CI/CD Pipeline
```
Push ou PR → develop ou main
  ↓
Job 1: Lint + Unit Tests
  ↓
Job 2: E2E Tests (PostgreSQL + Redis)
  ↓
Verde → merge autorizado
```

## Documentação

| Ficheiro | Conteúdo |
|----------|----------|
| docs/setup.md | Sprint 0 — ambiente local |
| docs/sprint-1-environment.md | TypeORM, Redis, ConfigModule |
| docs/sprint-2-event-module.md | Módulo Event |
| docs/sprint-3-risk-module.md | Módulo Risk |
| docs/sprint-4-state-module.md | Módulo State |
| docs/sprint-5-decision-module.md | Módulo Decision |
| docs/sprint-6-action-module.md | Módulo Action |
| docs/sprint-7-audit-module.md | Módulo Audit |
| docs/sprint-8-auth-jwt.md | Auth + JWT + Rate Limiting |
| docs/sprint-9-dashboard.md | Dashboard Next.js |
| docs/sprint-10-e2e-cicd.md | Testes E2E + CI/CD |
| docs/code-quality.md | Qualidade de código |

## Princípios aplicados

- KISS → YAGNI → SOLID (ordem obrigatória)
- Clean Code em todo o codebase
- Documentação contínua por funcionalidade
- Um problema por vez
- Desenvolvimento ágil com foco em velocidade
- Auditabilidade e explicabilidade por design

## Comandos essenciais
```bash
# Ambiente
docker compose -f infra/docker/docker-compose.yml up -d

# Desenvolvimento
npm run dev

# Testes unitários
cd apps/api && npm run test

# Testes e2e
cd apps/api && npm run test:e2e

# Migrations
cd apps/api && npm run migration:run
```

## Próximas evoluções (pós-MVP)

- Drill-down por entidade no dashboard
- Timeline forense detalhada
- Replay de decisão
- Rate limiting por entidade via Redis
- Machine learning para ajuste de thresholds
- Multi-tenancy
- Deploy cloud (Railway / Render / AWS)
