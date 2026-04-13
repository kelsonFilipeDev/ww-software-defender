# Sprint 5 — Módulo Decision

## Objetivo
Implementar o motor de decisão — ponto onde estados se transformam em comportamento real, conforme Capítulo IX do documento fundacional.

## Estrutura
```
modules/decision/
├── dto/
│   └── decision-result.dto.ts
├── enums/
│   └── decision-action.enum.ts
├── decision.controller.ts
├── decision.module.ts
├── decision.service.spec.ts
└── decision.service.ts
```

## Mapa de Decisão

| Estado    | Acção     |
|-----------|-----------|
| NORMAL    | ALLOW     |
| SUSPEITO  | THROTTLE  |
| ALERTA    | CHALLENGE |
| CRÍTICO   | BLOCK     |
| BLOQUEADO | BLOCK     |

## API

| Método | Rota                    | Descrição                      |
|--------|-------------------------|--------------------------------|
| GET    | /api/decision/:entityId | Obter decisão para uma entidade |

## Exemplo
```bash
curl http://localhost:3001/api/decision/user-123
# {"entityId":"user-123","score":20,"state":"NORMAL","action":"ALLOW"}
```

## Testes
- 6 testes unitários — cobertura de todos os estados
- Cada estado mapeado para a acção correcta
- Validação do resultado completo

## Decisões Técnicas
- `STATE_TO_ACTION` como constante imutável — mapa explícito e auditável
- `DecisionResultDto` exportado — tipo público e reutilizável
- `DecisionModule` exporta `DecisionService` para uso no módulo Action
- Lógica simples mas crítica — zero ambiguidade no mapeamento
