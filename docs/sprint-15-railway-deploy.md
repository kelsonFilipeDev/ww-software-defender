# Sprint 15 — Deploy Railway

## Objectivo
Colocar o WW Software Defender online com um URL real — API acessível publicamente em produção.

## URL de Produção
https://ww-software-defender-production.up.railway.app

## Estrutura
apps/api/Dockerfile           → multi-stage build corrigido para monorepo
apps/web/Dockerfile           → preparado para deploy futuro
apps/api/.env.example         → actualizado com MAX_EVENTS_PER_MINUTE
apps/web/.env.example         → criado com NEXT_PUBLIC_API_URL
railway.json
.github/workflows/ci.yml      → job deploy removido (Railway usa integração GitHub directa)
apps/api/src/main.ts          → bind em 0.0.0.0 para compatibilidade Railway

## Plataforma
Railway — escolhido pela simplicidade, custo baixo e suporte nativo a Docker, PostgreSQL e Redis como plugins.

## Serviços no Railway
| Serviço              | Tecnologia        | Porta |
|----------------------|-------------------|-------|
| ww-software-defender | NestJS (Docker)   | 3001  |
| Postgres             | PostgreSQL plugin  | 5432  |
| Redis                | Redis plugin       | 6379  |

## Dockerfile — Solução Final
O monorepo com npm workspaces exige copiar `node_modules` de dois níveis:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/ ./packages/
RUN npm ci --ignore-scripts
RUN cd apps/api && npm ci --ignore-scripts
COPY apps/api/ ./apps/api/
RUN cd apps/api && npx tsc -p tsconfig.build.json

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/src/infrastructure/database ./src/infrastructure/database
COPY --from=build /app/apps/api/package.json ./package.json
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

## Variáveis de Ambiente no Railway
| Variável               | Valor                        | Função                          |
|------------------------|------------------------------|---------------------------------|
| PORT                   | 3001                         | Porta do servidor NestJS        |
| NODE_ENV               | production                   | Ambiente                        |
| JWT_SECRET             | (gerado com randomBytes(64)) | Assinar tokens JWT              |
| JWT_EXPIRES_IN         | 24h                          | Expiração do token              |
| MAX_EVENTS_PER_MINUTE  | 30                           | Rate limiting por entidade      |
| DB_HOST                | ${{Postgres.PGHOST}}         | Host da base de dados           |
| DB_PORT                | ${{Postgres.PGPORT}}         | Porta da base de dados          |
| DB_USER                | ${{Postgres.PGUSER}}         | Utilizador da base de dados     |
| DB_PASSWORD            | ${{Postgres.PGPASSWORD}}     | Password da base de dados       |
| DB_NAME                | ${{Postgres.PGDATABASE}}     | Nome da base de dados           |
| REDIS_HOST             | ${{Redis.REDISHOST}}         | Host do Redis                   |
| REDIS_PORT             | ${{Redis.REDISPORT}}         | Porta do Redis                  |

## Migrations em Produção
As migrations são corridas manualmente via TCP Proxy do Railway:

```bash
DB_HOST=maglev.proxy.rlwy.net DB_PORT=35612 \
DB_USER=postgres DB_PASSWORD=<PGPASSWORD> DB_NAME=railway \
npm run migration:run
```

## Incidentes e Resoluções
| Problema | Causa | Resolução |
|---|---|---|
| Error creating build plan with Railpack | Railway usava Nixpacks em vez do Dockerfile | Configurar Builder como Dockerfile nas Settings |
| Cannot find module '@nestjs/typeorm' | node_modules do monorepo não copiados correctamente | Copiar node_modules da raiz e de apps/api |
| 502 Bad Gateway | Port mismatch — PORT da base de dados sobrescrevia a porta da API | Segregar DB_PORT e PORT, bind em 0.0.0.0 |
| Internal server error nos endpoints | Migrations não executadas em produção | Correr migrations via TCP Proxy |

## CI/CD
O deploy automático é feito via integração GitHub directa no Railway:
- Branch `main` ligado ao serviço
- Railway faz build e deploy automaticamente após push
- `Wait for CI` activo — deploy só ocorre após CI verde

## Decisões Técnicas
- Dockerfiles em vez de Nixpacks — monorepo Turborepo não suportado pelo buildpack automático
- Integração GitHub directa em vez de `railway up` no CI — mais estável e sem conflitos
- `main.ts` com bind `0.0.0.0` — obrigatório para Railway Edge Proxy
- TCP Proxy para acesso externo ao PostgreSQL — necessário para migrations locais
