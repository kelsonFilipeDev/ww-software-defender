# Sprint 10 — Testes E2E + CI/CD

## Objetivo
Implementar testes end-to-end do fluxo completo e pipeline CI/CD — conforme Capítulo XV do documento fundacional.

## Testes E2E

### Ficheiro
`apps/api/test/app.e2e-spec.ts`

### Fluxo testado
```
Auth → Events → Risk → State → Decision → Action → Audit
```

### Cobertura — 12 testes

| Módulo | Teste | Resultado |
|--------|-------|-----------|
| Auth | Gerar token JWT | ✅ |
| Auth | Rejeitar clientId vazio | ✅ |
| Events | Rejeitar sem token | ✅ |
| Events | Criar evento com token | ✅ |
| Events | Rejeitar payload inválido | ✅ |
| Risk | Calcular score por entidade | ✅ |
| State | Retornar estado baseado em score | ✅ |
| Decision | Retornar decisão baseada em estado | ✅ |
| Action | Rejeitar sem token | ✅ |
| Action | Executar acção e criar audit log | ✅ |
| Audit | Rejeitar sem token | ✅ |
| Audit | Retornar logs de auditoria | ✅ |

### Comando
```bash
cd apps/api && npm run test:e2e
```

## CI/CD Pipeline

### Ficheiro
`.github/workflows/ci.yml`

### Triggers
- Push para `develop` ou `main`
- Pull Request para `develop` ou `main`

### Jobs

**1. lint-and-test**
- Checkout do código
- Setup Node.js v22
- Install dependencies
- Lint (turbo run lint)
- Unit tests (31 testes)

**2. e2e** (depende de lint-and-test)
- Serviços: PostgreSQL 16 + Redis 7
- Migrations
- E2E tests (12 testes)

## Limpeza

### Ficheiros removidos
- `apps/api/src/app.controller.ts`
- `apps/api/src/app.service.ts`
- `apps/api/src/app.controller.spec.ts`

### Segurança reforçada
- `GET /api/audit` protegido com JwtAuthGuard
- `GET /api/audit/:entityId` protegido com JwtAuthGuard
