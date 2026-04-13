## 1. Relatório de Incidente (Post-Mortem)

**Data:** 12 de Abril de 2026
**Incidente:** Crash cíclico no startup do container (OOM Killed / Module Not Found).
**Causa Raiz:**
* **OOM (Out of Memory):** O uso de `ts-node` em produção consumia mais de 512MB de RAM ao compilar TypeScript em runtime.
* **Path Resolution:** A estrutura de monorepo causava desencontros entre o binário do TypeORM e os ficheiros compilados em `dist/`.

**Resolução:**
* Migração da execução de comandos de infraestrutura para JavaScript puro (`node` + `dist/`).
* Unificação de `node_modules` no estágio final do Docker e configuração de `NODE_PATH=/app/node_modules`.