# Gerenciador de Projetos

Monorepo com a API em Rails e o frontend em Nuxt.

| Pasta | Stack | Porta |
|---|---|---|
| [`backend/`](backend) | Ruby 4.0, Rails 8.1 (API only), PostgreSQL | 3000 |
| [`frontend/`](frontend) | Node 26, Nuxt 4 (TypeScript), Bootstrap 5, VeeValidate + Zod | 3001 |
| [`e2e/`](e2e) | Playwright: testa o frontend e a API juntos | - |

## Requisitos

- Ruby e Node nas versões do [`.tool-versions`](.tool-versions) (com asdf: `asdf install`)
- PostgreSQL 17 rodando localmente

## Setup

```bash
# backend
cd backend
cp .env.example .env   # preencha com as credenciais do seu PostgreSQL
bundle install
bin/rails db:prepare

# frontend
cd ../frontend
npm install

# e2e (opcional)
cd ../e2e
npm install
npx playwright install chromium
```

O Rails lê as credenciais do banco de `backend/.env` (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`).
Sem `DB_HOST`, ele conecta pelo socket local com o seu usuário do sistema.

## Rodando

```bash
bin/dev
```

Sobe a API em http://localhost:3000 e o frontend em http://localhost:3001. `Ctrl+C` para os dois.

## Variáveis de ambiente

| Variável | Onde | Padrão |
|---|---|---|
| `FRONTEND_ORIGIN` | backend (CORS) | `http://localhost:3001` |
| `NUXT_PUBLIC_API_BASE` | frontend | `http://localhost:3000` |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` | backend | socket local, porta 5432 |

## Testes e lint

| Camada | Ferramenta | Comando |
|---|---|---|
| Backend | Minitest, RuboCop, Brakeman | `cd backend && bin/rails test && bin/rubocop && bin/brakeman` |
| Frontend | ESLint, vue-tsc, Vitest | `cd frontend && npm run lint && npm run typecheck && npm run test` |
| Ponta a ponta | Playwright | `cd e2e && npm test` |

No frontend, os testes ficam em duas pastas:

- `test/unit/`: funções, schemas e utilitários, sem o Nuxt (rápido)
- `test/nuxt/`: componentes e composables que precisam do Nuxt (auto-imports, `runtimeConfig`, rotas)

O Playwright sobe o Rails (em `RAILS_ENV=test`) e o Nuxt sozinho. Se o `bin/dev` já estiver rodando, ele reaproveita os servidores.
Antes da primeira vez, crie o banco de teste: `cd backend && RAILS_ENV=test bin/rails db:prepare`.

O CI (GitHub Actions) tem três workflows: backend e frontend rodam só quando a sua pasta muda; o E2E roda em todo push e PR.
