## Documentação Técnica de Infraestrutura

### Estratégia de Docker (Multi-stage Build)
O nosso `Dockerfile` está otimizado para produção seguindo o princípio de **Flat Node Modules**.

* **Estágio de Build:** Compila o código NestJS e resolve dependências do workspace.
* **Estágio de Production:**
    * Utiliza `node:22-alpine` para manter a imagem leve.
    * **Importante:** Copiamos as dependências da raiz e da app para o mesmo nível. Isso garante que o `require('typeorm')` funcione independentemente de onde o ficheiro esteja na árvore de diretórios.
    * **Variável de Ambiente:** `NODE_PATH` é setado para `/app/node_modules` para garantir a resolução de módulos globais do container.

### Scripts de Migração
A gestão da base de dados é feita via TypeORM.

| Comando | Ambiente | Descrição |
| :--- | :--- | :--- |
| `npm run migration:run` | Dev | Executa via `ts-node` (lento, mas flexível). |
| `npm run migration:run:prod` | Prod | Executa via `node` (rápido e leve, usa `/dist`). |