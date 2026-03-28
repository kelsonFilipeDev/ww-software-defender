# Sprint 6 — Módulo Action

## Objetivo
Implementar o executor de respostas defensivas — conforme Capítulo XI do documento fundacional.

## Estrutura
```
modules/action/
├── dto/
│   └── action-result.dto.ts
├── enums/
│   └── action-status.enum.ts
├── action.controller.ts
├── action.module.ts
├── action.service.spec.ts
└── action.service.ts
```

## Comportamento por Acção

| Acção     | Comportamento                        | Log Level |
|-----------|--------------------------------------|-----------|
| ALLOW     | Acesso permitido                     | LOG       |
| THROTTLE  | Limitação de acesso                  | WARN      |
| CHALLENGE | Validação adicional requerida        | WARN      |
| BLOCK     | Acesso bloqueado                     | ERROR     |

## API

| Método | Rota                   | Descrição                        |
|--------|------------------------|----------------------------------|
| POST   | /api/action/:entityId  | Executar acção para uma entidade |

## Exemplo
```bash
curl -X POST http://localhost:3001/api/action/user-123
# {"entityId":"user-123","action":"ALLOW","status":"EXECUTED","executedAt":"2026-03-28T09:12:17.101Z"}
```

## Testes
- 5 testes unitários — cobertura de todas as acções
- Validação de `status`, `action` e `executedAt`

## Decisões Técnicas
- Logger do NestJS com níveis adequados por acção
- `ActionModule` importa `DecisionModule` — segue a cadeia de responsabilidade
- `executedAt` com timestamp real — auditável
- MVP: acções registadas via Logger — futuro: persistência no módulo Audit