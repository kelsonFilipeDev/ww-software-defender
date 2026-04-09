# Sprint 11 — Entity Drill-Down + UI Translation

## Objetivo
Transformar o dashboard num instrumento forense real — permitir clicar numa entidade e ver o histórico completo de eventos, decisões e estado actual. Traduzir toda a UI para inglês com suporte a tradução automática pelo browser.

## Estrutura
apps/web/app/entity/[id]/
└── page.tsx
apps/web/src/services/
└── api.ts               → riskService adicionado

## Nova Página — Entity Forensic View
Rota: `/entity/[id]`

| Secção           | Conteúdo                                              |
|------------------|-------------------------------------------------------|
| Header           | ID da entidade com efeito glitch + botão BACK         |
| State & Score    | Estado actual, Risk Score, Total de eventos           |
| Event Timeline   | Tabela com tipo, IP e timestamp de cada evento        |
| Decision History | Tabela com score, estado, acção, status e timestamp   |

## API utilizada
| Método | Rota                    | Serviço                    |
|--------|-------------------------|----------------------------|
| GET    | /api/events/:entityId   | `eventsService.getByEntityId` |
| GET    | /api/audit/:entityId    | `auditService.getByEntityId`  |
| GET    | /api/risk/:entityId     | `riskService.getByEntityId`   |
| GET    | /api/state/:entityId    | `stateService.getByEntityId`  |

## Alterações ao Dashboard
- Coluna de acção adicionada à tabela de audit logs
- Ícone de olho (SVG inline) na última coluna — navega para `/entity/[entityId]`
- Célula da entidade sem link — navegação exclusiva pelo ícone

## Internacionalização
- `lang="en"` definido no `layout.tsx`
- Todas as páginas traduzidas para inglês: `dashboard`, `events`, `audit`, `entity/[id]`
- Browser oferece tradução automática para qualquer língua

## Fix incluído
- `BootScreen.tsx` — corrigido valor possivelmente `undefined` com `?? ''`

## Commits
feat(entity): add entity drill-down page and riskService
feat(dashboard): make entity rows clickable for drill-down navigation
feat(dashboard): replace clickable row with eye icon, translate UI to English
feat(i18n): set lang to en, translate entity page to English
feat(i18n): translate events and audit pages to English
fix(bootscreen): handle possible undefined line value

## Decisões Técnicas
- Sem biblioteca de ícones — SVG inline para não introduzir dependência desnecessária (KISS)
- Todas as chamadas à API em `Promise.all` — carregamento paralelo, sem waterfalls
- `router.back()` no botão BACK — preserva histórico de navegação
