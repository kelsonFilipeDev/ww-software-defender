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
CMD ["sh", "-c", "npm run migration:run && node dist/main.js"]