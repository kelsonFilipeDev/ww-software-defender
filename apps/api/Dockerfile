FROM node:22-alpine AS build
WORKDIR /app

# Instalação de dependências para build
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/ ./packages/
RUN npm ci --ignore-scripts
RUN cd apps/api && npm ci --ignore-scripts

# Build da aplicação
COPY apps/api/ ./apps/api/
RUN cd apps/api && npx tsc -p tsconfig.build.json

FROM node:22-alpine AS production
WORKDIR /app

# 1. Unifica todos os node_modules na raiz de produção para evitar erros de path
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./node_modules

# 2. Copia apenas o necessário para correr (dist e package.json)
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json

# 3. Força o Node a procurar módulos na pasta unificada
ENV NODE_PATH=/app/node_modules

EXPOSE 3001

# 4. Executa a migração via JS (leve) e inicia a app
CMD ["sh", "-c", "npx typeorm migration:run -d dist/infrastructure/database/data-source.js && node dist/main.js"]