## Guia de Manutenção (README.md Local)

## Operações de Produção

### Migrações
Em produção (Railway), as migrações correm automaticamente antes do startup da aplicação através do comando definido no Dockerfile:
`npx typeorm migration:run -d dist/infrastructure/database/data-source.js`

### Troubleshoot de Memória
Se o container apresentar o status `Killed`:
1. Verifique se não há nenhum processo tentando compilar `.ts` em runtime.
2. Certifique-se de que o comando `npm run build` foi executado com sucesso no estágio de build do Docker.
```