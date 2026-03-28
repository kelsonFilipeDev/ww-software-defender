# Sprint 8 — Autenticação JWT + Rate Limiting + CORS

## Objetivo
Proteger a API com autenticação JWT, limitar abusos com rate limiting e configurar CORS — conforme Capítulo XIII do documento fundacional.

## Estrutura
```
modules/auth/
├── guards/
│   └── jwt-auth.guard.ts
├── strategies/
│   └── jwt.strategy.ts
├── auth.controller.ts
├── auth.module.ts
└── auth.service.ts
```

## JWT

### Geração de Token
```bash
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"clientId": "system-external-1"}'
# {"accessToken":"eyJ..."}
```

### Uso do Token
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"LoginFailed","entityId":"user-123"}'
```

### Endpoints Protegidos
| Endpoint | Protegido |
|----------|-----------|
| POST /api/auth/token | ❌ Público |
| POST /api/events | ✅ JWT |
| GET /api/events | ✅ JWT |
| GET /api/events/:id | ✅ JWT |
| POST /api/action/:id | ✅ JWT |

## Rate Limiting
- 30 requests por minuto por IP
- Configurado via `ThrottlerModule`
- Resposta: `429 Too Many Requests` quando excedido

## CORS
- Origem permitida: `http://localhost:3000` (dashboard Next.js)
- Métodos: GET, POST
- Headers: Content-Type, Authorization

## Variáveis de Ambiente
```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

## Decisões Técnicas
- JWT sobre OAuth2 — conforme documento: OAuth2 é overkill para MVP
- Token expira em 86400 segundos (24h)
- `JwtAuthGuard` aplicado por controller — controlo granular
- CORS restrito ao dashboard — sem wildcard em produção
