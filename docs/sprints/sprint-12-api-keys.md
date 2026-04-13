# Sprint 12 — API Keys para Sistemas Externos

## Objectivo
Permitir que sistemas externos se autentiquem com API Keys persistentes em vez de tokens JWT gerados na hora.

## Estrutura
modules/api-keys/
├── dto/
│   └── create-api-key.dto.ts
├── api-key.controller.ts
├── api-key.entity.ts
├── api-key.module.ts
├── api-key.service.spec.ts
└── api-key.service.ts
modules/auth/strategies/
└── api-key.strategy.ts
shared/guards/
└── combined-auth.guard.ts

## Entidade
Tabela: `api_keys`

| Campo     | Tipo      | Descrição                              |
|-----------|-----------|----------------------------------------|
| id        | uuid      | Identificador único                    |
| key       | string    | Chave em SHA-256 (única)               |
| clientId  | string    | Cliente associado                      |
| active    | boolean   | Se a chave está activa                 |
| createdAt | timestamp | Data de criação (automática)           |

## API
| Método | Rota             | Descrição              |
|--------|------------------|------------------------|
| POST   | /api/keys        | Criar nova API Key     |
| DELETE | /api/keys/:id    | Revogar API Key        |

## Fluxo de Autenticação
- Sistema externo envia header `x-api-key: <raw_key>`
- `ApiKeyStrategy` faz hash SHA-256 da chave e consulta a base de dados
- `CombinedAuthGuard` aceita JWT (`Authorization: Bearer`) ou API Key (`x-api-key`)
- A chave em texto claro é retornada apenas uma vez na criação — nunca armazenada

## Segurança
- Chaves armazenadas como SHA-256 — nunca em texto claro
- Revogação define `active = false` — chave invalidada imediatamente
- `CombinedAuthGuard` substitui `JwtAuthGuard` onde acesso externo é necessário

## Testes
- 5 testes unitários no `ApiKeyService`
  - Criar chave e retornar chave em texto claro
  - Validar chave inválida retorna null
  - Validar chave válida retorna entidade
  - Revogar chave existente
  - Revogar chave inexistente lança NotFoundException

## Decisões Técnicas
- `passport-custom` usado para a Passport strategy de API Key
- Hash SHA-256 via módulo nativo `crypto` do Node.js — sem dependências extra
- Chave gerada com `randomBytes(32)` — 64 caracteres hexadecimais
- Migration gerada via TypeORM CLI — `synchronize: false` respeitado