# Sprint 0 — Setup Inicial

## Ambiente Local

### NVM + Node.js
- NVM v0.39.7 instalado via script oficial
- Node.js v22 (default) + v20 disponíveis
- Alternar versões: `nvm use 22` ou `nvm use 20`

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
│   └── config/
│       ├── eslint-config/
│       └── typescript-config/
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
| Serviço    | Imagem             | Porta |
|------------|--------------------|-------|
| PostgreSQL | postgres:16-alpine | 5432  |
| Redis      | redis:7-alpine     | 6379  |

### Comandos úteis
```bash
# Subir serviços
docker compose -f infra/docker/docker-compose.yml up -d

# Parar serviços
docker compose -f infra/docker/docker-compose.yml down

# Ver estado
docker ps
```

## Git e GitHub

### Repositório
- URL: https://github.com/kelsonFilipeDev/ww-software-defender
- Visibilidade: Público
- Autenticação: SSH (ed25519)

### Branches
| Branch    | Função                        |
|-----------|-------------------------------|
| `main`    | Sempre estável, sempre deployável |
| `develop` | Integração de features        |

### Proteções
- `main`: push direto proibido, PR obrigatório

## Qualidade de Código

### Husky + Commitlint
- Commitlint com `@commitlint/config-conventional`
- Hook `pre-commit`: executa lint
- Hook `commit-msg`: valida formato do commit

### Formato de commits
```
type(scope): descrição

Exemplos:
feat(risk): add risk calculation engine
fix(api): resolve floating promise in bootstrap
chore: initial project setup
```

### Tipos válidos
- `feat` → nova funcionalidade
- `fix` → correção
- `refactor` → melhoria interna
- `chore` → config / infra
- `test` → testes
