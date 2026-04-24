# Fix Report — Frontend Auth + API Key Pipeline

**Data:** 24 de Abril de 2026
**Branch:** `fix/frontend-auth-api-key`
**Commits:** `509a9dd`, `20b39a6`
**Issue origem:** Issue #4 — Post v1.1 Test Issues Report

---

## Causa Raiz

O `authService.getToken` no frontend enviava apenas `{ clientId }` para `POST /api/auth/token`. Após o Sprint 16, o endpoint passou a exigir `{ clientId, apiKey }`. Todas as páginas do frontend retornavam erro de ligação ao servidor.

Durante a resolução, foram descobertos três problemas colaterais que impediam o fluxo de autenticação mesmo após o fix do frontend.

---

## Problemas e Resolução

**1. CORS a bloquear o preflight**
O `enableCors` em `apps/api/src/main.ts` não incluía `OPTIONS` nos métodos nem `x-tenant-id` nos headers permitidos. O browser bloqueava o pedido no preflight antes de chegar ao backend. Adicionados `OPTIONS`, `x-tenant-id` e `credentials: true`. O `CORS_ORIGIN` passou a ser lido do `.env` para suportar produção sem alterar o código.

**2. `TenantMiddleware` a bloquear `/auth/token`**
O `exclude('auth/*path')` em `apps/api/src/app.module.ts` estava mal formado — o NestJS não reconhece este wildcard para exclusão de middleware. O middleware interceptava `POST /api/auth/token` e retornava 401 antes de chegar ao `AuthController`. Substituído por `{ path: 'auth/token', method: RequestMethod.POST }`.

**3. Tabela `api_keys` inexistente no schema operacional**
A migration `CreateApiKeysTable` criou a tabela em `public`. A migration `MoveToTenantDefaultSchema` moveu as tabelas operacionais para `tenant_default`. O ambiente local foi recriado após as migrations de produção, ficando num estado inconsistente — o registo de migrations dizia concluído mas a tabela não existia em `tenant_default`. Criada manualmente e feito seed da API key com hash SHA-256. Este é um problema de ambiente local — a BD de produção tem o schema correcto.

**4. Frontend não enviava `apiKey`**
`authService.getToken` em `apps/web/src/services/api.ts` actualizado para aceitar e enviar `apiKey`. As três páginas que chamavam `getToken` (`dashboard`, `events`, `audit`) actualizadas para ler as credenciais de `NEXT_PUBLIC_API_CLIENT_ID` e `NEXT_PUBLIC_API_KEY` via variáveis de ambiente. Variáveis adicionadas ao `apps/web/.env.local`.

---

## Nota para Onboarding Local

Após recreação dos containers Docker, o ambiente local requer seed manual da API key em `tenant_default.api_keys`:

```bash
RAW_KEY=$(openssl rand -hex 32)
HASHED=$(echo -n "$RAW_KEY" | sha256sum | awk '{print $1}')
docker exec -it ww-postgres psql -U ww_user -d ww_defender -c \
  "INSERT INTO tenant_default.api_keys (key, \"tenantId\", active) \
   VALUES ('$HASHED', '<tenant-uuid>', true);"
echo "RAW KEY: $RAW_KEY"
# Adicionar RAW_KEY ao apps/web/.env.local como NEXT_PUBLIC_API_KEY
```