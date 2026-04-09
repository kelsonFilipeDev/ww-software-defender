# Sprint 15 — Deploy Railway

## Objectivo
Colocar o WW Software Defender online com um URL real — API e frontend acessíveis publicamente.

## Estrutura
apps/api/Dockerfile
apps/web/Dockerfile
apps/api/.env.example     → actualizado com MAX_EVENTS_PER_MINUTE
apps/web/.env.example     → criado com NEXT_PUBLIC_API_URL
railway.json
.github/workflows/ci.yml  → job deploy adicionado

## Plataforma
Railway — escolhido pela simplicidade, custo baixo e suporte nativo a Docker e PostgreSQL/Redis como plugins.

## Serviços no Railway
| Serviço    | Tecnologia       | Porta |
|------------|------------------|-------|
| api        | NestJS (Docker)  | 3001  |
| web        | Next.js (Docker) | 3000  |
| postgres   | PostgreSQL plugin | 5432  |
| redis      | Redis plugin      | 6379  |

## Dockerfiles
- Multi-stage build — imagem de produção leve
- `base` → instala dependências
- `build` → compila o código
- `production` → apenas o necessário para correr

## CI/CD
Job `deploy` adicionado ao `ci.yml`:
- Corre apenas em push para `main`
- Depende do job `e2e` — deploy só acontece com testes verdes
- Usa `RAILWAY_TOKEN` como secret do GitHub Actions

## Variáveis de Ambiente no Railway
Configurar no Railway dashboard para cada serviço:

**API:**
- `PORT`, `NODE_ENV`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `MAX_EVENTS_PER_MINUTE`

**Web:**
- `NEXT_PUBLIC_API_URL` → URL pública da API no Railway

## Decisões Técnicas
- Dockerfiles em vez de Nixpacks — monorepo Turborepo não é bem suportado pelo buildpack automático
- `railway up --detach` no CI — deploy assíncrono, não bloqueia o pipeline
- `.env.example` para ambos os serviços — documentação das variáveis necessárias
