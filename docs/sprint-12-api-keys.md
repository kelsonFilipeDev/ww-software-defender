# Sprint 12 — API Keys for External Systems

## Objective
Allow external systems to authenticate with persistent API Keys instead of JWT tokens generated on demand.

## Structure
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

## Entity
Table: `api_keys`

| Field     | Type      | Description                        |
|-----------|-----------|------------------------------------|
| id        | uuid      | Unique identifier                  |
| key       | string    | SHA-256 hashed key (unique)        |
| clientId  | string    | Associated client                  |
| active    | boolean   | Whether the key is active          |
| createdAt | timestamp | Creation date (automatic)          |

## API
| Method | Route            | Description         |
|--------|------------------|---------------------|
| POST   | /api/keys        | Create new API Key  |
| DELETE | /api/keys/:id    | Revoke API Key      |

## Authentication Flow
- External system sends `x-api-key: <raw_key>` header
- `ApiKeyStrategy` hashes the raw key with SHA-256 and looks up in database
- `CombinedAuthGuard` accepts either JWT (`Authorization: Bearer`) or API Key (`x-api-key`)
- Raw key is only returned once at creation — never stored in plain text

## Security
- Keys are stored as SHA-256 hashes — never in plain text
- Revocation sets `active = false` — key is immediately invalidated
- `CombinedAuthGuard` replaces `JwtAuthGuard` where external access is needed

## Tests
- 5 unit tests in `ApiKeyService`
  - Create key and return raw key
  - Validate invalid key returns null
  - Validate valid key returns entity
  - Revoke existing key
  - Revoke non-existent key throws NotFoundException

## Technical Decisions
- `passport-custom` used for API Key Passport strategy
- SHA-256 hashing via Node.js native `crypto` module — no extra dependencies
- Raw key generated with `randomBytes(32)` — 64 hex characters
- Migration generated via TypeORM CLI — `synchronize: false` respected
