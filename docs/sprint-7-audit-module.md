# Sprint 7 — Módulo Audit

## Objetivo
Implementar rastreabilidade completa de decisões e acções — conforme Capítulos III e XII do documento fundacional.

## Estrutura
```
modules/audit/
├── dto/
│   └── create-audit.dto.ts
├── audit.controller.ts
├── audit.entity.ts
├── audit.module.ts
├── audit.service.spec.ts
└── audit.service.ts
```

## Entidade

Tabela: `audit_logs`

| Campo         | Tipo      | Descrição                        |
|---------------|-----------|----------------------------------|
| id            | uuid      | Identificador único              |
| entityId      | string    | Entidade auditada                |
| score         | integer   | Risk score no momento da decisão |
| state         | enum      | Estado da entidade               |
| action        | enum      | Acção executada                  |
| status        | enum      | Estado da execução               |
| correlationId | string    | Correlação entre registos        |
| createdAt     | timestamp | Data de criação (automática)     |

## API

| Método | Rota                    | Descrição                        |
|--------|-------------------------|----------------------------------|
| GET    | /api/audit              | Listar todos os registos         |
| GET    | /api/audit/:entityId    | Listar registos por entidade     |

## Integração

O `ActionService` chama `AuditService.log()` automaticamente após cada acção executada — garantindo rastreabilidade completa sem intervenção manual.

## Fluxo Completo
```
POST /api/events     → regista evento
POST /api/action/:id → executa acção + regista auditoria
GET  /api/audit/:id  → reconstrói histórico completo
```

## Exemplo
```bash
# Reconstruir histórico de uma entidade
curl http://localhost:3001/api/audit/user-456
# [{"id":"...","entityId":"user-456","score":5,"state":"NORMAL","action":"ALLOW","status":"EXECUTED","createdAt":"..."}]
```

## Testes
- 3 testes no AuditService
- 6 testes no ActionService — inclui verificação de chamada ao AuditService

## Decisões Técnicas
- Migration gerada automaticamente via TypeORM
- Enums PostgreSQL para state, action e status — integridade garantida
- AuditModule exporta AuditService para uso no ActionModule
