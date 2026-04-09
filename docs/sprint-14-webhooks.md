# Sprint 14 — Webhooks

## Objectivo
Notificar sistemas externos via webhook quando uma entidade é bloqueada — fechando o ciclo de integração.

## Estrutura
modules/webhooks/
├── dto/
│   └── create-webhook.dto.ts
├── webhook.controller.ts
├── webhook.entity.ts
├── webhook.module.ts
├── webhook.service.spec.ts
└── webhook.service.ts

## Entidade
Tabela: `webhooks`

| Campo     | Tipo      | Descrição                          |
|-----------|-----------|------------------------------------|
| id        | uuid      | Identificador único                |
| url       | string    | URL de destino do webhook          |
| clientId  | string    | Cliente associado                  |
| secret    | string    | Segredo para validação (opcional)  |
| active    | boolean   | Se o webhook está activo           |
| createdAt | timestamp | Data de criação (automática)       |

## API
| Método | Rota             | Descrição                  |
|--------|------------------|----------------------------|
| POST   | /api/webhooks    | Registar novo webhook      |
| GET    | /api/webhooks    | Listar todos os webhooks   |

## Fluxo
1. Sistema externo regista webhook via `POST /api/webhooks`
2. Quando `ActionService` executa acção `BLOCK`, dispara `WebhookService.deliver()`
3. `WebhookService` busca todos os webhooks activos e entrega o payload
4. Em caso de falha, retentar até 3 vezes com backoff progressivo

## Payload entregue
```json
{
  "event": "entity.blocked",
  "entityId": "user-123",
  "score": 100,
  "timestamp": "2026-04-09T11:00:00.000Z"
}
```

## Segurança
- Header `x-webhook-secret` enviado se o webhook tiver `secret` configurado
- Apenas JWT pode registar e listar webhooks

## Retry
- Máximo 3 tentativas
- Backoff progressivo: 1s, 2s
- Falha silenciosa após 3 tentativas — registo no logger

## Testes
5 testes unitários no `WebhookService`:
- Registar webhook
- Listar webhooks ordenados por createdAt DESC
- Entregar payload a webhooks activos
- Não entregar quando não há webhooks activos
- Retentar 3 vezes em caso de falha

## Decisões Técnicas
- `fetch` nativo do Node.js — sem dependência extra
- Integração no `ActionService` apenas para acção `BLOCK`
- `WebhookModule` exporta `WebhookService` para uso no `ActionModule`
- Migration gerada via TypeORM CLI — `synchronize: false` respeitado
