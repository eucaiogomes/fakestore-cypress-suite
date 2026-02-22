# 🧪 FakeStore API — Cypress Test Suite

Suite completa de testes automatizados para a [FakeStore API](https://fakestoreapi.com), com análise inteligente de falhas via **Grok AI** e relatório HTML interativo.

---

## 📁 Estrutura do Projeto

```
automacao-ecomerce/
├── cypress/
│   ├── e2e/
│   │   ├── 01-auth.cy.js        # Autenticação (Login JWT)
│   │   ├── 02-products.cy.js    # CRUD completo de Produtos
│   │   ├── 03-cart.cy.js        # CRUD completo de Carrinho
│   │   └── 04-users.cy.js       # CRUD completo de Usuários
│   ├── fixtures/
│   │   └── data.json            # Dados de teste centralizados
│   └── support/
│       ├── commands.js          # Comandos customizados
│       └── e2e.js               # Setup global + coleta de falhas
├── scripts/
│   └── generate-report.js      # Gerador de relatório + Grok AI
├── report/                      # Relatórios gerados (git ignored)
├── cypress.config.js
├── package.json
└── README.md
```

---

## 🚀 Como executar

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure a chave do Grok AI (opcional)

```bash
set GROK_API_KEY=sua_chave_aqui
```

> Obtenha sua chave em: [console.x.ai](https://console.x.ai)

### 3. Rode os testes

```bash
# Rodar todos os testes
npm test

# Rodar e gerar relatório HTML
npm run test:full

# Abrir interface visual do Cypress
npm run test:open

# Rodar suite específica
npm run test:auth
npm run test:products
npm run test:cart
npm run test:users
```

### 4. Visualizar relatório

```bash
# Gerar relatório sem rodar os testes (usa resultados anteriores)
npm run report
```

Abra `report/index.html` no navegador.

---

## ✅ Cobertura de Testes

| Suite | Endpoints | Testes |
|-------|-----------|--------|
| 🔐 Autenticação | `POST /auth/login` | Login válido, inválido, token JWT, tempo de resposta |
| 🛍️ Produtos | `GET/POST/PUT/PATCH/DELETE /products` | CRUD completo, filtros, ordenação, categorias, schema |
| 🛒 Carrinho | `GET/POST/PUT/DELETE /carts` | CRUD completo, filtro por usuário, datas, validações |
| 👤 Usuários | `GET/POST/PUT/DELETE /users` | CRUD completo, validações de negócio, unicidade |

**Total: 62 testes automatizados**

---

## 🤖 Integração Grok AI

Quando testes falham, o `generate-report.js` envia automaticamente os erros para a API do **Grok (xAI)**, que retorna:

- Diagnóstico de cada falha
- Possíveis causas raiz
- Sugestões de correção

Tudo exibido no relatório HTML final.

---

## 📊 Relatório HTML

O relatório gerado inclui:

- Dashboard com totais e taxa de aprovação
- Barra de progresso visual
- Cards por suite com todos os testes
- Seção de análise do Grok AI

---

## 🛠️ Tecnologias

- [Cypress 13](https://www.cypress.io/)
- [FakeStore API](https://fakestoreapi.com)
- [Grok AI (xAI)](https://x.ai)
- Node.js (sem dependências externas no relatório)
"# fakestore-cypress-suite" 
