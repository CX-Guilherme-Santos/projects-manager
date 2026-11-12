# Backend: API Rails

API JSON do Gerenciador de Projetos, em Rails 8.1 (API only) com PostgreSQL. Setup, rotas e variáveis de ambiente estão no [README da raiz](../README.md), e o porquê de cada escolha está em [`docs/DECISIONS.md`](../docs/DECISIONS.md).

## Estrutura

| Caminho | O que tem |
|---|---|
| `app/controllers/api/v1/` | `ProjectsController` (listagem com `has_scope` e Pagy, `count`, CRUD) e o `BaseController`, com as respostas de erro (404, 400 e 422) e os headers de paginação |
| `app/models/project.rb` | Validações (palavras, datas, capa, tamanho), escopos de filtro, busca e ordenação, e a capa (`has_one_attached :cover`) |
| `app/services/projects/` | Criação, edição e remoção. A escrita fica nos services, e a leitura no controller ([seção 14](../docs/DECISIONS.md#14-escrita-em-service-objects)) |
| `app/serializers/api/v1/` | `ProjectSerializer`, com a URL da capa |
| `config/initializers/` | CORS (`FRONTEND_ORIGIN`), Pagy (10 por página, máximo 50) e serializers |
| `config/storage.yml` | Disk em desenvolvimento e testes, Cloudflare R2 em produção |
| `config/locales/pt-BR.yml` | Mensagens de validação |
| `db/seeds.rb` | 12 projetos de exemplo (só em `development`) |
| `lib/tasks/e2e.rake` | `e2e:reset`: limpa o banco antes de cada teste E2E (só roda em `RAILS_ENV=test`) |

## Testes

```bash
bundle exec rspec   # specs de model, services e requests
bin/rubocop         # estilo
bin/brakeman        # análise de segurança
```

| Pasta | Cobre |
|---|---|
| `spec/models/` | Validações e escopos do `Project` |
| `spec/services/projects/` | Regras de criação, edição e remoção |
| `spec/requests/api/v1/` | Os endpoints de ponta a ponta: status, corpo, headers de paginação e erros |
