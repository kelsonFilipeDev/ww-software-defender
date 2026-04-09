# Sprint 13 — Rate Limiting por Entidade via Redis

## Objectivo
Limitar o número de eventos por entidade por minuto via Redis — mais preciso que limitação por IP para o modelo de segurança do sistema.

## Alterações
Alteração cirúrgica no `EventService` — sem novo módulo.
modules/event/
├── event.service.ts     → lógica de rate limiting adicionada
└── event.service.spec.ts → testes actualizados

## Lógica
Antes de criar um evento, o sistema verifica o contador Redis para a entidade:
chave Redis: rate:{entityId}
TTL: 60 segundos
limite: MAX_EVENTS_PER_MINUTE (padrão: 30)

- Contador inexistente → inicializa em 1
- Contador abaixo do limite → incrementa
- Contador igual ou acima do limite → lança HTTP 429

## Variável de Ambiente
```env
MAX_EVENTS_PER_MINUTE=30
```

## Comportamento
| Situação | Resposta |
|---|---|
| Primeiro evento da entidade no minuto | 201 Created |
| Eventos dentro do limite | 201 Created |
| Limite excedido | 429 Too Many Requests |
| Novo minuto (TTL expirado) | Contador reinicia |

## Testes
5 testes unitários no `EventService`:
- Criar e guardar evento com contador a null
- Incrementar contador em eventos subsequentes
- Lançar 429 quando limite é excedido
- Listar todos os eventos
- Listar eventos por entityId

## Decisões Técnicas
- `CACHE_MANAGER` injectado no `EventService` — Redis já configurado globalmente no `AppModule`
- TTL de 60000ms (60 segundos) — janela deslizante por minuto
- Limite configurável por variável de ambiente — sem hardcode
- Sem novo módulo — alteração cirúrgica conforme arquitectura definida
