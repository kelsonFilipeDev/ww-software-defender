# Sprint 3 — Módulo Risk

## Objetivo
Implementar o cálculo de risco baseado em eventos — conforme Capítulo IX do documento fundacional.

## Estrutura
```
modules/risk/
├── dto/
│   └── calculate-risk.dto.ts
├── risk.controller.ts
├── risk.module.ts
└── risk.service.ts
```

## Lógica de Cálculo

Risk Score = soma ponderada dos eventos da entidade (limitado a 100).

| Evento           | Peso |
|------------------|------|
| LoginFailed      | +5   |
| LoginFailedRepeat| +10  |
| SuspiciousIp     | +20  |
| PasswordReset    | +25  |

## API

| Método | Rota              | Descrição                        |
|--------|-------------------|----------------------------------|
| GET    | /risk/:entityId   | Calcular risco de uma entidade   |

## Exemplo
```bash
curl http://localhost:3001/risk/user-123
# {"entityId":"user-123","score":20}
```

## Decisões Técnicas
- Pesos definidos como constante no service — simples e auditável
- Score limitado a 100 via Math.min
- RiskModule importa EventModule para aceder ao EventService
- Sem persistência no MVP — cálculo em tempo real
