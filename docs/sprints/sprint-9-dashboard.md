# Sprint 9 — Dashboard Next.js

## Objetivo
Implementar o dashboard de monitorização com identidade visual Mr Robot / Black Hat — conforme Capítulo XIV do documento fundacional.

## Estrutura
```
apps/web/
├── app/
│   ├── dashboard/page.tsx  → visão geral + métricas + gráficos
│   ├── events/page.tsx     → stream de eventos forenses
│   ├── audit/page.tsx      → trail de auditoria completo
│   └── layout.tsx          → layout com sidebar + bootscreen
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx       → navegação lateral
│   │   ├── BootScreen.tsx    → ecrã de inicialização terminal
│   │   ├── PieChart.tsx      → gráfico pizza SVG animado
│   │   └── ScoreTimeline.tsx → timeline de risk score SVG
│   └── services/
│       └── api.ts            → cliente axios com JWT
```

## Design System

### Paleta de cores
| Variável | Valor | Uso |
|----------|-------|-----|
| `--bg-primary` | `#0a0a0a` | Fundo principal |
| `--red-primary` | `#cc0000` | Cor de destaque |
| `--risk-low` | `#00ff41` | NORMAL / ALLOW |
| `--risk-medium` | `#ffcc00` | SUSPEITO / THROTTLE |
| `--risk-high` | `#ff6600` | ALERTA / CHALLENGE |
| `--risk-critical` | `#cc0000` | CRÍTICO / BLOCK |
| `--risk-blocked` | `#ff1111` | BLOQUEADO |

### Tipografia
- `Share Tech Mono` → dados, logs, IDs, terminal text
- `Rajdhani` → headers, labels, métricas

### Efeitos visuais
- Scanline CRT (opacidade reduzida)
- Noise overlay (opacidade reduzida)
- Glitch animation nos títulos
- Cursor piscante
- Badges com pulse em estados críticos

## Páginas

### Dashboard (`/dashboard`)
- KPIs: Entidades, Suspeitas, Em Alerta, Bloqueadas
- Métricas secundárias: Normais, Total de Eventos
- Risk Score Timeline (SVG animado)
- Pie charts: Estados e Acções
- Recent Audit Logs
- Auto-refresh a cada 30 segundos

### Eventos (`/events`)
- Cards de contagem por tipo de evento
- Filtro em tempo real por entidade/tipo
- Tabela com cores por tipo de evento
- Auto-refresh a cada 30 segundos

### Auditoria (`/audit`)
- Cards: Total, Bloqueadas, Throttled, Permitidas
- Filtro em tempo real
- Score colorido por nível de risco
- Badges de estado e acção
- Auto-refresh a cada 30 segundos

## Dependências instaladas
- `axios` — cliente HTTP
- `framer-motion` — animações
- `recharts` — (instalado, substituído por SVG nativo por compatibilidade com Turbopack)

## Decisões Técnicas
- Gráficos em SVG puro — sem conflito com Turbopack
- Animações com `requestAnimationFrame` — performance máxima
- `useRef` para controlar animações one-shot
- Polling simples (30s) em vez de WebSockets — KISS para MVP
- Token JWT gerado automaticamente pelo dashboard com clientId 'dashboard'
