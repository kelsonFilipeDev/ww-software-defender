# Sprint 2 — Módulo Event

## Objetivo
Implementar o primeiro módulo de domínio — ingestão e persistência de eventos no sistema.

## Estrutura
```
modules/event/
├── dto/
│   └── create-event.dto.ts
├── event.controller.ts
├── event.entity.ts
├── event.module.ts
└── event.service.ts
```

## Entidade

Tabela: `events`

| Campo         | Tipo      | Descrição                        |
|---------------|-----------|----------------------------------|
| id            | uuid      | Identificador único              |
| type          | string    | Tipo do evento (ex: LoginFailed) |
| entityId      | string    | Entidade associada               |
| payload       | jsonb     | Dados adicionais do evento       |
| correlationId | string    | Correlação entre eventos         |
| createdAt     | timestamp | Data de criação (automática)     |

## API

| Método | Rota                  | Descrição                        |
|--------|-----------------------|----------------------------------|
| POST   | /events               | Criar novo evento                |
| GET    | /events               | Listar todos os eventos          |
| GET    | /events/:entityId     | Listar eventos por entidade      |

## Exemplo
```bash
# Criar evento
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "LoginFailed",
    "entityId": "user-123",
    "payload": { "ip": "192.168.1.1", "attempts": 1 }
  }'

# Listar eventos
curl http://localhost:3001/events

# Eventos por entidade
curl http://localhost:3001/events/user-123
```

## Decisões Técnicas
- DTO separado do service para evitar erro TS1272 com isolatedModules
- payload como jsonb — flexível para qualquer tipo de evento
- Ordenação por createdAt DESC — eventos mais recentes primeiro
