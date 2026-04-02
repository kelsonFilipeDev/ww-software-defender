# WW Software Defender

**Sistema de Monitorização Forense Inteligente**

Motor de decisão de segurança que analisa eventos em tempo real, calcula risco comportamental, define estado, toma decisões automáticas e executa ações defensivas — tudo auditável e rastreável.

Em vez de apenas registar alertas, o WW **fecha o ciclo completo**: deteta → avalia → decide → age → audita. Sem intervenção humana constante.

---

## Recursos e Demonstração

### Funcionalidades principais

- **Motor completo de decisão** — Evento → Risco → Estado → Decisão → Ação
- **Cálculo de Risk Score** (0-100) com regras comportamentais
- **Estados automáticos**: `NORMAL` | `SUSPEITO` | `ALERTA` | `CRÍTICO` | `BLOQUEADO`
- **Decisões defensivas**: `ALLOW` | `THROTTLE` | `CHALLENGE` | `BLOCK`
- **Execução automática de ações** com auditoria forense
- **API REST autenticada** com JWT
- **Dashboard em tempo real** com KPIs, timeline, gráficos e logs
- **Auditoria completa** — rastreabilidade total de todas as decisões
- **Pipeline CI/CD profissional** com testes unitários e E2E

### Demonstração

![Dashboard Overview](screenshots/dashboard.png)
*Dashboard principal com KPIs, timeline de risco e logs em tempo real*

![Events Stream](screenshots/events-stream.png)
*Stream de eventos com filtro e auto-refresh*

![Audit Trail](screenshots/audit-trail.png)
*Trail forense completo com rastreabilidade*

---

## Guia de Início Rápido

### Pré-requisitos

- Git
- Node.js (v20 ou superior)
- Docker e Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

### Instalação

```bash
# 1. Clona o repositório
git clone https://github.com/kelsonFilipeDev/ww-software-defender.git
cd ww-software-defender

# 2. Copia as variáveis de ambiente
cp .env.example .env

# 3. Sobe os serviços (PostgreSQL + Redis)
docker compose up -d

# 4. Instala dependências
npm install

# 5. Inicia o projeto em modo desenvolvimento
npm run dev
