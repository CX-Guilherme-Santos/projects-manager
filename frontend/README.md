# Frontend: Nuxt

SPA do Gerenciador de Projetos, em Nuxt 4 com TypeScript, Bootstrap 5 (só pelo SCSS) e VeeValidate + Zod. Setup e variáveis de ambiente estão no [README da raiz](../README.md), e o porquê de cada escolha está em [`docs/DECISIONS.md`](../docs/DECISIONS.md).

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento em http://localhost:3001 (ou `bin/dev` na raiz, junto com a API) |
| `npm run generate` | Build estático em `dist/` |
| `npm run generate:pages` | O mesmo build, preparado para o modo SPA do Cloudflare Pages |
| `npm run lint` / `npm run typecheck` | ESLint e vue-tsc |
| `npm run test` / `npm run test:watch` | Vitest |

## Estrutura (`app/`)

O código segue camadas: plugin, service, composable e componente ([seção 19](../docs/DECISIONS.md#19-frontend-em-camadas-plugin-service-composable-componente)).

| Pasta | O que tem |
|---|---|
| `plugins/api.ts` | `$api`: o `$fetch` com a URL base da API |
| `services/projects.ts` | Chamadas à API, sem estado. Lê a paginação dos headers |
| `composables/` | Estado das telas: `useProjectList` (lista, scroll infinito, favorito otimista, remoção), `useProjectCount` e `useSearchHistory` |
| `pages/` | `index` (lista), `search` (resultado da busca), `projects/new` e `projects/[id]/edit` |
| `components/base/` | Componentes genéricos: botão, modal, select, switch, campo de formulário, campo de data |
| `components/project/` | Card, menu do card, grid com scroll infinito, formulário, input de capa, modal de remoção, skeletons e empty state |
| `components/search/` | Barra de busca e histórico |
| `schemas/project.ts` | Validação do formulário (Zod), com as mesmas regras e mensagens da API |
| `utils/` | Funções puras: datas, destaque do termo buscado, `FormData`, erros da API |
| `assets/scss/` | Tokens de cor e tipografia tirados do Figma, Bootstrap e o skeleton global |

## Testes

| Pasta | Cobre |
|---|---|
| `test/unit/` | Funções, schema e utilitários, sem o Nuxt |
| `test/nuxt/` | Componentes e composables com o Nuxt. A API é simulada na fronteira HTTP (`support/fakeApi.ts`) |

Os testes no navegador, contra a API de verdade, ficam em [`e2e/`](../e2e).
