# Sprint 0 — Setup Inicial

## Ambiente Local

### NVM + Node.js
- NVM v0.39.7 instalado via script oficial
- Node.js v22 (default) + v20 disponíveis
- Comando para alternar: `nvm use 22` ou `nvm use 20`

### Monorepo
- Turborepo inicializado com `create-turbo`
- Package manager: npm
- Estrutura adaptada ao Capítulo XIV do documento fundacional

## Estrutura do Projeto
```
ww-defender/
├── apps/
│   ├── web/        → Next.js (dashboard)
│   └── api/        → NestJS (core system)
├── packages/
│   ├── contracts/  → DTOs + eventos
│   └── config/     → ESLint + TSConfig
├── infra/
│   └── docker/
├── docs/
├── package.json
├── turbo.json
└── README.md
```

## Infraestrutura Local

### Docker
- Docker v29.3.0
- Docker Compose v5.1.1
- Ficheiro: `infra/docker/docker-compose.yml`

### Serviços
| Serviço    | Imagem              | Porta |
|------------|---------------------|-------|
| PostgreSQL | postgres:16-alpine  | 5432  |
| Redis      | redis:7-alpine      | 6379  |

### Comandos úteis
```bash
# Subir serviços
docker compose -f infra/docker/docker-compose.yml up -d

# Parar serviços
docker compose -f infra/docker/docker-compose.yml down

# Ver estado
docker ps
```
