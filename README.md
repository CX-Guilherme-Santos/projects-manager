# Gerenciador de Projetos

Aplicação para cadastrar e acompanhar projetos: lista com favoritos, ordenação e busca, formulários de criação e edição com capa, e remoção com confirmação. Monorepo com a API em Rails e o frontend em Nuxt.

| | |
|---|---|
| **Aplicação em produção** | https://projects-manager.pages.dev |
| **API em produção** | https://projects-manager-api-499ef87f8334.herokuapp.com/api/v1/projects |
| **Decisões técnicas** | [`docs/DECISIONS.md`](docs/DECISIONS.md): o que foi escolhido, o que foi descartado e por quê |
| **Versões** | [`v1.0.0`](https://github.com/CX-Guilherme-Santos/projects-manager/tree/v1.0.0) e [`v1.0.1`](https://github.com/CX-Guilherme-Santos/projects-manager/tree/v1.0.1) (correção do upload de capas no R2) |

| Pasta | Stack | Porta |
|---|---|---|
| [`backend/`](backend) | Ruby 4.0, Rails 8.1 (API only), PostgreSQL | 3000 |
| [`frontend/`](frontend) | Node 26, Nuxt 4 (TypeScript, SPA), Bootstrap 5, VeeValidate + Zod | 3001 |
| [`e2e/`](e2e) | Playwright: testa o frontend e a API juntos | - |

## Funcionalidades

Requisitos do enunciado:

- [x] Listagem vazia conforme o design, só depois de os dados chegarem (com skeleton durante o carregamento)
- [x] Título da página com o total de projetos cadastrados
- [x] Filtro "Apenas Favoritos"
- [x] Ordenação: alfabética (padrão), iniciados mais recentes e prazo mais próximo
- [x] Páginas de criação e edição, com validação nos campos e upload de capa com prévia
- [x] Modal de confirmação para remover
- [x] Favoritar e desfavoritar direto no card
- [x] Busca por nome ou cliente a partir de 3 caracteres

Opcionais:

- [x] Histórico das últimas 5 buscas
- [x] Destaque do termo buscado nos resultados

Além do enunciado: scroll infinito, filtros e ordenação guardados na URL (o link pode ser compartilhado), campo de data dd/mm/aaaa com calendário, layout responsivo e navegação por teclado.

## Rodando com Docker

O jeito mais rápido: não precisa instalar Ruby, Node nem PostgreSQL, só o Docker.

```bash
docker compose up --build
```

| Serviço | Endereço | O que é |
|---|---|---|
| `web` | http://localhost:3001 | Frontend: o mesmo build estático do Cloudflare Pages, servido pelo nginx |
| `api` | http://localhost:3000 | API Rails em `development` |
| `db` | (só na rede interna) | PostgreSQL 17 |

Na primeira subida, a API cria o banco e carrega os 12 projetos de exemplo dos seeds. Os dados e as capas enviadas ficam em volumes do Docker: `docker compose down` mantém tudo, e `docker compose down -v` apaga.

O endereço da API é embutido no build do frontend. Por isso, depois de mudar o código ou a porta da API, rode de novo com `--build`. As portas 3000 e 3001 são as mesmas do `bin/dev`, então pare um antes de subir o outro.

## Rodando localmente

### Requisitos

- Ruby e Node nas versões do [`.tool-versions`](.tool-versions) (com asdf: `asdf install`)
- PostgreSQL 17 rodando localmente

### Setup

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

### Subindo

```bash
bin/dev
```

Sobe a API em http://localhost:3000 e o frontend em http://localhost:3001. `Ctrl+C` para os dois.

## API

Base: `/api/v1`. Respostas em JSON, mensagens de erro em pt-BR.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/projects` | Lista paginada. Parâmetros: `favorite=true`, `q` (3+ caracteres, busca no nome e no cliente), `sort` (`name` (padrão), `recent_start` ou `nearest_end`), `page` e `limit` (padrão 10, máximo 50) |
| `GET` | `/projects/count` | Total de projetos cadastrados, sem filtros: `{ "count": 12 }` |
| `GET` | `/projects/:id` | Um projeto |
| `POST` | `/projects` | Cria. Corpo `multipart/form-data` com `project[name]`, `project[client]`, `project[start_date]`, `project[end_date]` e `project[cover]` (opcional) |
| `PATCH` | `/projects/:id` | Edita, favorita (`project[favorite]`) ou remove a capa (`project[remove_cover]=true`) |
| `DELETE` | `/projects/:id` | Remove definitivamente |

A listagem devolve um array de projetos no corpo e a paginação nos headers: `link` (com `rel="next"` enquanto houver mais páginas), `current-page`, `page-limit`, `total-count` (projetos que atendem aos filtros) e `total-pages`. Os demais endpoints devolvem o projeto como um objeto, sem chave raiz.

Erros de validação voltam com status `422` no formato `{ "errors": { "name": ["..."] } }`, com as mesmas chaves dos campos do formulário.

## Testes e lint

| Camada | Ferramenta | Comando |
|---|---|---|
| Backend | RSpec (FactoryBot, shoulda-matchers), RuboCop, Brakeman | `cd backend && bundle exec rspec && bin/rubocop && bin/brakeman` |
| Frontend | ESLint, vue-tsc, Vitest | `cd frontend && npm run lint && npm run typecheck && npm run test` |
| Ponta a ponta | Playwright | `cd e2e && npm test` |

No frontend, os testes ficam em duas pastas:

- `test/unit/`: funções, schemas e utilitários, sem o Nuxt (rápido)
- `test/nuxt/`: componentes e composables que precisam do Nuxt (auto-imports, `runtimeConfig`, rotas)

O E2E cobre o caminho feliz de cada requisito no navegador, contra a API de verdade. O Playwright sobe sozinho o Rails (em `RAILS_ENV=test`) e o build de produção do frontend (`nuxt generate` servido na porta 3001). Pare o `bin/dev` ou o `docker compose` antes, porque eles ocupam as mesmas portas com o banco de desenvolvimento.
Antes da primeira vez, crie o banco de teste: `cd backend && RAILS_ENV=test bin/rails db:prepare`.

Quando um teste falha, o trace e o screenshot ficam em `e2e/test-results/`. Para abrir o relatório, rode `cd e2e && npm run report`. Para abrir o trace de um teste só, rode `npx playwright show-trace test-results/<teste>/trace.zip`. No CI, o relatório vai como artefato `playwright-report` do job.

O CI (GitHub Actions) tem três workflows, e cada um roda só quando a sua parte muda: o backend quando `backend/` muda, o frontend quando `frontend/` muda, e o E2E quando qualquer uma das três pastas muda. O Dependabot abre, uma vez por mês, um PR agrupado por ecossistema (gems, npm de cada pasta e GitHub Actions) contra o `develop`.

## Deploy

| Parte | Onde | Como |
|---|---|---|
| API | Heroku | Todo push no `main` roda o CI do backend e, se passar, o job "Backend · deploy (Heroku)" publica só a pasta `backend/` (`git subtree split`) e confere o `/up` |
| Frontend | Cloudflare Pages | O Pages builda `frontend/` com `npm run generate:pages` a cada push. O `main` vai para produção, e os outros branches ganham uma URL de prévia |
| Capas | Cloudflare R2 | O Active Storage usa o serviço `S3` apontando para o R2. As URLs das imagens são assinadas e valem por 1 hora |

Por que essa combinação está na [seção 6 do DECISIONS](docs/DECISIONS.md#6-hospedagem-heroku--cloudflare-pages--cloudflare-r2).

## Variáveis de ambiente

| Variável | Onde | Padrão |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` | backend, local | socket local, porta 5432 |
| `FRONTEND_ORIGIN` | backend (CORS) | `http://localhost:3001` |
| `NUXT_PUBLIC_API_BASE` | frontend, no build | `http://localhost:3000` |
| `DATABASE_URL` | backend, produção (o Heroku Postgres define) | - |
| `RAILS_MASTER_KEY` | backend, produção | - |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET` | backend, produção (capas no R2) | - |

## Fluxo de trabalho (GitFlow)

| Branch | Para quê | Sai de | Volta para |
|---|---|---|---|
| `main` | Produção. Cada merge é uma versão com tag (`v1.0.0`) e dispara o deploy do backend | — | — |
| `develop` | Integração. É o branch padrão do repositório | `main` | — |
| `feature/*` | Uma funcionalidade (`feature/project-list`) | `develop` | `develop`, por PR |
| `release/*` | Fechamento de uma versão (`release/1.0.0`) | `develop` | `main` (com tag) e `develop` |
| `hotfix/*` | Correção urgente em produção (`hotfix/1.0.1`) | `main` | `main` (com tag) e `develop` |

Os PRs entram com commit de merge (sem squash), para o histórico mostrar cada branch. O CI roda em todo PR e nos pushes para `main` e `develop`.

As mensagens de commit seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat(api): ...`, `fix(frontend): ...`, `refactor:`, `docs:`, `ci:`, `chore:`.
