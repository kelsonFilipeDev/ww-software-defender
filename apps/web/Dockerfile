FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/ ./packages/
RUN npm ci --workspace=apps/web --include-workspace-root

FROM base AS build
COPY apps/web/ ./apps/web/
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/web

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["node_modules/.bin/next", "start", "--prefix", "apps/web", "-p", "3000"]
