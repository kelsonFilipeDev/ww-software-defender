# Code Quality — Melhorias de Qualidade

## Objetivo
Resolver débito técnico antes de avançar para os módulos restantes.

## Melhorias Implementadas

### 1. Prefixo Global `/api`
- Todas as rotas passaram a ter o prefixo `/api`
- Configurado em `main.ts` via `app.setGlobalPrefix('api')`

### Rotas actuais
| Método | Rota                        |
|--------|-----------------------------|
| POST   | /api/events                 |
| GET    | /api/events                 |
| GET    | /api/events/:entityId       |
| GET    | /api/risk/:entityId         |
| GET    | /api/state/:entityId        |

### 2. Validação de Input
- `class-validator` + `class-transformer` instalados
- `ValidationPipe` global com `whitelist` e `forbidNonWhitelisted`
- DTO `CreateEventDto` com validações explícitas

### 3. Testes Unitários
- 16 testes passados com 100% de cobertura nos services
- `EventService` — 3 testes
- `RiskService` — 5 testes
- `StateService` — 7 testes

### 4. Migrations TypeORM
- `synchronize: false` em todos os ambientes
- DataSource configurado em `src/infrastructure/database/data-source.ts`
- Migration inicial criada e executada
- Scripts disponíveis: `migration:generate`, `migration:run`, `migration:revert`

## Comandos
```bash
# Gerar migration
npm run migration:generate -- src/infrastructure/database/migrations/NomeDaMigration

# Executar migrations
npm run migration:run

# Reverter última migration
npm run migration:revert
```
