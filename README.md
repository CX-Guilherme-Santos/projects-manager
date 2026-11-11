# Gerenciador de Projetos

Monorepo com a API em Rails e o frontend em Nuxt.

As decisões técnicas, com o que foi considerado e descartado, estão em [`docs/DECISIONS.md`](docs/DECISIONS.md).

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
bin/rails db:seed      # opcional: 12 projetos de exemplo (só em development)

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

## Fluxo de trabalho (GitFlow)

| Branch | Para quê | Sai de | Volta para |
|---|---|---|---|
| `main` | Produção. Cada merge é uma versão com tag (`v1.0.0`) e dispara o deploy do backend | — | — |
| `develop` | Integração. É o branch padrão do repositório | `main` | — |
| `feature/*` | Uma funcionalidade (`feature/project-list`) | `develop` | `develop`, por PR |
| `release/*` | Fechamento de uma versão (`release/1.0.0`) | `develop` | `main` (com tag) e `develop` |
| `hotfix/*` | Correção urgente em produção | `main` | `main` (com tag) e `develop` |

Os PRs entram com commit de merge (sem squash), para o histórico mostrar cada branch. O CI roda em todo PR e nos pushes para `main` e `develop`.

As mensagens de commit seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat(api): ...`, `fix(frontend): ...`, `refactor:`, `docs:`, `ci:`, `chore:`.

## API

Base: `/api/v1`. Respostas em JSON, mensagens de erro em pt-BR.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/projects` | Lista paginada. Parâmetros: `favorite=true`, `q` (3+ caracteres, busca no nome e no cliente), `sort` (`name` (padrão), `recent_start` ou `nearest_end`), `page` e `limit` (padrão 10, máximo 50) |
| `GET` | `/projects/:id` | Um projeto |
| `POST` | `/projects` | Cria. Corpo `multipart/form-data` com `project[name]`, `project[client]`, `project[start_date]`, `project[end_date]` e `project[cover]` (opcional) |
| `PATCH` | `/projects/:id` | Edita, favorita (`project[favorite]`) ou remove a capa (`project[remove_cover]=true`) |
| `DELETE` | `/projects/:id` | Remove definitivamente |

A listagem devolve um array de projetos no corpo e a paginação nos headers: `link` (com `rel="next"` enquanto houver mais páginas), `current-page`, `page-limit`, `total-count` (projetos que atendem aos filtros) e `total-pages`. Os demais endpoints devolvem o projeto como um objeto, sem chave raiz.

Erros de validação voltam com status `422` no formato `{ "errors": { "name": ["..."] } }`, com as mesmas chaves dos campos do formulário.

## Variáveis de ambiente

| Variável | Onde | Padrão |
|---|---|---|
| `FRONTEND_ORIGIN` | backend (CORS) | `http://localhost:3001` |
| `NUXT_PUBLIC_API_BASE` | frontend | `http://localhost:3000` |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` | backend | socket local, porta 5432 |

## Testes e lint

| Camada | Ferramenta | Comando |
|---|---|---|
| Backend | RSpec (FactoryBot, shoulda-matchers), RuboCop, Brakeman | `cd backend && bundle exec rspec && bin/rubocop && bin/brakeman` |
| Frontend | ESLint, vue-tsc, Vitest | `cd frontend && npm run lint && npm run typecheck && npm run test` |
| Ponta a ponta | Playwright | `cd e2e && npm test` |

No frontend, os testes ficam em duas pastas:

- `test/unit/`: funções, schemas e utilitários, sem o Nuxt (rápido)
- `test/nuxt/`: componentes e composables que precisam do Nuxt (auto-imports, `runtimeConfig`, rotas)

O Playwright sobe o Rails (em `RAILS_ENV=test`) e o Nuxt sozinho. Se o `bin/dev` já estiver rodando, ele reaproveita os servidores.
Antes da primeira vez, crie o banco de teste: `cd backend && RAILS_ENV=test bin/rails db:prepare`.

O CI (GitHub Actions) tem três workflows: backend e frontend rodam só quando a sua pasta muda; o E2E roda em todo push e PR.
