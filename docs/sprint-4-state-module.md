# Sprint 4 — Módulo State

## Objetivo
Determinar o estado atual de uma entidade com base no Risk Score — conforme Capítulo IX do documento fundacional.

## Estrutura
```
modules/state/
├── enums/
│   └── entity-state.enum.ts
├── state.controller.ts
├── state.module.ts
└── state.service.ts
```

## Lógica de Estado

| Risk Score | Estado    |
|------------|-----------|
| 0 – 20     | NORMAL    |
| 21 – 40    | SUSPEITO  |
| 41 – 60    | ALERTA    |
| 61 – 80    | CRITICO   |
| 81 – 100   | BLOQUEADO |

## API

| Método | Rota                | Descrição                      |
|--------|---------------------|--------------------------------|
| GET    | /state/:entityId    | Obter estado atual da entidade |

## Exemplo
```bash
curl http://localhost:3001/state/user-123
# {"entityId":"user-123","score":20,"state":"NORMAL"}
```

## Decisões Técnicas
- Estado derivado do Risk Score em tempo real
- StateModule importa RiskModule
- Enum EntityState garante consistência em todo o sistema
- Resposta inclui score e state — auditável e explicável
