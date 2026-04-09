FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/ ./packages/
RUN npm ci --workspace=apps/api --include-workspace-root

FROM base AS build
COPY apps/api/ ./apps/api/
RUN npm run build --workspace=apps/api

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./package.json
EXPOSE 3001
CMD ["node", "dist/main.js"]
