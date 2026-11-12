# Decisões técnicas

Registro das principais escolhas do projeto: o contexto, o que foi decidido, o que foi descartado e o custo de cada escolha. A ordem segue a sequência em que as decisões foram tomadas.

## Índice

1. [Monorepo](#1-monorepo)
2. [Frontend como SPA estática](#2-frontend-como-spa-estática)
3. [Bootstrap só pelo SCSS, sem biblioteca de componentes](#3-bootstrap-só-pelo-scss-sem-biblioteca-de-componentes)
4. [Validação de formulários com VeeValidate + Zod 3](#4-validação-de-formulários-com-veevalidate--zod-3)
5. [Ícones: Phosphor via `@nuxt/icon`, embutidos no build](#5-ícones-phosphor-via-nuxticon-embutidos-no-build)
6. [Hospedagem: Heroku + Cloudflare Pages + Cloudflare R2](#6-hospedagem-heroku--cloudflare-pages--cloudflare-r2)
7. [Jobs com `:async` e `purge_later`, sem Sidekiq](#7-jobs-com-async-e-purge_later-sem-sidekiq)
8. [Filtros da listagem com `has_scope`](#8-filtros-da-listagem-com-has_scope)
9. [Paginação com Pagy](#9-paginação-com-pagy)
10. [Serialização com Active Model Serializers](#10-serialização-com-active-model-serializers)
11. [Remoção definitiva, sem histórico de versões](#11-remoção-definitiva-sem-histórico-de-versões)
12. [Regras de negócio que o enunciado deixou em aberto](#12-regras-de-negócio-que-o-enunciado-deixou-em-aberto)
13. [Testes e CI](#13-testes-e-ci)
14. [Escrita em service objects](#14-escrita-em-service-objects)
15. [Um único idioma (pt-BR), sem suporte a vários idiomas](#15-um-único-idioma-pt-br-sem-suporte-a-vários-idiomas)
16. [Sem autenticação nem limite de requisições](#16-sem-autenticação-nem-limite-de-requisições)
17. [Possíveis evoluções](#17-possíveis-evoluções)
18. [GitFlow e Conventional Commits](#18-gitflow-e-conventional-commits)
19. [Frontend em camadas: plugin, service, composable, componente](#19-frontend-em-camadas-plugin-service-composable-componente)
20. [Filtros e ordenação na URL](#20-filtros-e-ordenação-na-url)
21. [Scroll infinito sobre paginação por offset](#21-scroll-infinito-sobre-paginação-por-offset)
22. [Favorito otimista, remoção confirmada](#22-favorito-otimista-remoção-confirmada)
23. [Busca: rota própria, histórico local e destaque sem `v-html`](#23-busca-rota-própria-histórico-local-e-destaque-sem-v-html)
24. [Estados de carregamento](#24-estados-de-carregamento)
25. [Fidelidade ao Figma sem o Dev Mode](#25-fidelidade-ao-figma-sem-o-dev-mode)
26. [Testes do frontend com TDD e E2E](#26-testes-do-frontend-com-tdd-e-e2e)

---

## 1. Monorepo

**Decisão:** API (`backend/`), frontend (`frontend/`) e testes ponta a ponta (`e2e/`) no mesmo repositório.

**Por quê:** uma mudança que atravessa API e tela (um campo novo, por exemplo) vira um único commit e um único PR. Os testes E2E, que dependem dos dois lados, ficam junto do código que testam.

**Custo:** o deploy precisa publicar só uma subpasta em cada serviço. O backend vai para o Heroku via `git subtree split --prefix backend`, e o Cloudflare Pages usa `frontend/` como diretório raiz.

## 2. Frontend como SPA estática

**Decisão:** Nuxt 4 com `ssr: false`, gerado com `nuxt generate` e servido como arquivos estáticos.

**Por quê:** todos os dados vêm da API Rails e a aplicação não precisa de SEO, então renderizar no servidor não traria ganho. Arquivos estáticos ficam num CDN, sem servidor Node para manter.

**Detalhe:** o Cloudflare Pages só entra em modo SPA (manda qualquer rota para o `index.html`) se o site **não** tiver `404.html`. O preset `cloudflare-pages-static` do Nitro gera um `404.html` e um `_redirects` que responde 404 em toda rota, então o script `generate:pages` remove os dois depois do build.

## 3. Bootstrap só pelo SCSS, sem biblioteca de componentes

**Decisão:** importar do Bootstrap 5 apenas o grid, os utilitários, os formulários, os botões e os cards, pelo SCSS, com as variáveis (`$primary` e outras) trocadas pelas do design. Os componentes visuais são próprios.

**Por quê:** o design tem identidade própria. Com uma biblioteca de componentes (Vuetify, PrimeVue), boa parte do trabalho seria sobrescrever estilos. O Bootstrap entra para o que é genérico: layout responsivo, espaçamentos e estados de formulário (`.is-invalid`).

**Utilitário ou CSS do componente:** o layout vai nas classes do Bootstrap no template (`d-flex`, `align-items-center`, `gap-3`, `position-absolute`, `sticky-top`, `p-0`, `fw-semibold`, `list-unstyled`). O `<style scoped>` fica só com o que é do design ou não tem classe: cores e tamanhos do Figma, bordas, sombras, valores fora da escala de espaçamento do Bootstrap (12, 32 e 40 px), `grid-template-columns`, regras responsivas, pseudo-elementos e tudo que muda com estado (`:hover`, selecionado). Esse último caso importa: os utilitários são `!important`, e um `bg-transparent` num item de menu anularia o fundo do hover.

**Descartado:** `bootstrap-vue-next` e o JS do Bootstrap. Os componentes interativos do design (modal de remoção, menu do card e o select de ordenação) são componentes Vue próprios, com teclado e ARIA. O select é um listbox próprio porque o design estiliza as opções abertas, o que um `<select>` nativo não permite.

## 4. Validação de formulários com VeeValidate + Zod 3

**Decisão:** VeeValidate para o estado do formulário e Zod para as regras.

**Por quê:** os formulários de criar e editar são iguais e precisam mostrar os erros que a API devolve (422) nos mesmos campos. O VeeValidate já resolve campos tocados, validação no envio, estado de envio e `setErrors`. O schema Zod vira a fonte única das regras no frontend e tipa os valores enviados.

**Restrição:** o `@vee-validate/zod` só aceita Zod 3, e o `vee-validate` 4.15 ainda não aceita schemas do Zod 4 diretamente. O Zod está fixado em `^3.25`, e o Dependabot ignora a versão major.

**A API valida de novo:** as mesmas regras existem no model `Project`, com as mensagens em pt-BR. A validação do frontend serve à experiência do usuário; a do backend garante a integridade dos dados.

## 5. Ícones: Phosphor via `@nuxt/icon`, embutidos no build

**Decisão:** ícones do Phosphor (peso Light) pelo `@nuxt/icon`, com `provider: 'none'` e `clientBundle.scan`.

**Por quê:** o design usa Font Awesome **Light**, que só existe na versão paga. O Phosphor Light é a alternativa gratuita mais parecida. Com o scan, só os ícones usados entram no bundle (cerca de 0,6 KB por ícone) e nenhuma requisição sai para a API do Iconify em tempo de execução.

**Exceção:** as estrelas de favorito e o logo foram exportados do Figma, porque têm cores próprias do design.

## 6. Hospedagem: Heroku + Cloudflare Pages + Cloudflare R2

| Parte | Serviço | Custo |
|---|---|---|
| API Rails | Heroku, dyno Basic | US$ 7/mês |
| Banco | Heroku Postgres Essential-0 | US$ 5/mês |
| Frontend | Cloudflare Pages | grátis |
| Capas dos projetos | Cloudflare R2 (compatível com S3) | grátis até 10 GB |

**Por quê:** o Heroku sobe Rails sem Docker e o dyno Basic não "dorme", então a primeira visita do avaliador não espera a aplicação acordar. O R2 fala a API do S3, então o Active Storage usa o serviço `S3` padrão apontando para outro endpoint, e não cobra transferência de saída.

**Ponto de atenção:** as versões recentes do `aws-sdk-s3` mandam um checksum CRC32 em todo upload, além do `Content-MD5` que o Active Storage já envia. O R2 recusa os dois juntos ("You can only specify one non-default checksum at a time"), e o upload de capa falhava em produção com erro 500. O serviço `r2` do `config/storage.yml` usa `request_checksum_calculation` e `response_checksum_validation` com `when_required`, como a Cloudflare recomenda. A integridade continua garantida pelo MD5. Os testes não pegaram o problema porque usam o serviço Disk.

**Descartado:**
- **Fly.io:** sem plano gratuito para contas novas e com Postgres gerenciado caro (a partir de ~US$ 38/mês).
- **Render free:** o servidor dorme (~50 s na primeira requisição) e o Postgres gratuito expira em 30 dias.
- **S3 + CloudFront para o frontend:** o mesmo resultado do Pages, mas com IAM, política de bucket e distribuição para configurar, e risco de cobrança.

## 7. Jobs com `:async` e `purge_later`, sem Sidekiq

### Quais jobs existem

O sistema não tem jobs próprios. Os únicos que rodam em segundo plano são do Active Storage:

| Job | Quando roda |
|---|---|
| `ActiveStorage::AnalyzeJob` | Depois do upload de uma capa: lê metadados da imagem (largura e altura) |
| `ActiveStorage::PurgeJob` | Ao remover a capa (`cover.purge_later` no `Projects::UpdateService`), ao trocar por outra e ao remover o projeto (o `has_one_attached` usa `dependent: :purge_later` por padrão) |

### Por que `purge_later` e não `purge`

O `purge` apaga o arquivo no R2 **dentro da requisição**: o usuário espera uma chamada HTTP ao R2 para ter a resposta, e se o R2 falhar naquele momento, a edição do projeto falha por um motivo que não tem nada a ver com ela. Com o `purge_later`, o vínculo com o projeto sai do banco na hora (a capa some da tela imediatamente), e só a exclusão do arquivo fica para depois.

### Por que o adapter `:async`

O `:async` roda os jobs num pool de threads dentro do próprio processo do Puma. Não precisa de infraestrutura nenhuma: nem Redis, nem tabela de fila, nem processo separado.

**O custo:** os jobs ficam só em memória. Se o dyno reiniciar com um job pendente (num deploy, ou no restart diário que o Heroku faz em todo dyno), ele se perde. Nos dois jobs acima, o efeito é:
- **`PurgeJob` perdido:** sobra um arquivo sem uso no R2. O usuário não vê nada, e o espaço gratuito é de 10 GB.
- **`AnalyzeJob` perdido:** a imagem fica sem largura e altura salvas. Nada no sistema usa esses dados.

Se isso passar a importar, dá para limpar os arquivos sem uso com uma tarefa periódica (por exemplo, no Heroku Scheduler) que apague os blobs sem anexo há mais de dois dias:

```ruby
ActiveStorage::Blob.unattached.where(created_at: ..2.days.ago).find_each(&:purge_later)
```

Essa tarefa não foi implementada, porque o volume não justifica.

### Por que não Sidekiq (ainda)

O Sidekiq brilha com volume alto, retentativas, agendamento e painel de acompanhamento. Hoje ele exigiria um Redis (o Key-Value Store do Heroku, cerca de US$ 3/mês) e um dyno `worker` (US$ 7/mês, ou o modo embutido no Puma), para dois jobs de milissegundos cuja perda não afeta o usuário.

**Seria o próximo passo** se aparecerem jobs que não podem se perder: envio de e-mails, chamadas a APIs externas com retentativa, tarefas agendadas. Os jobs passariam a ficar persistidos no Redis, com retentativa automática e um painel para acompanhar falhas. A troca no código é pequena: o adapter do Active Job (`config.active_job.queue_adapter = :sidekiq`) e um processo `worker` no `Procfile`.

### Outbox: considerado

O padrão **transactional outbox** grava o trabalho a fazer como uma linha numa tabela (`outbox`), **na mesma transação** da mudança no projeto, e um processo separado lê essa tabela e executa:
- **Atomicidade:** se a transação falhar, o trabalho nunca existiu. Se ela confirmar, ele está garantido.
- **Durabilidade:** a linha sobrevive a deploys e restarts.

O Sidekiq guarda os jobs no Redis, **fora** da transação do Postgres. Enfileirar o job só depois do commit (`after_commit`) evita o caso "enfileirou o job, mas o projeto não salvou". Mas ainda resta uma janela: se o processo cair entre o commit e o envio ao Redis, ou se o Redis estiver fora do ar naquele momento, o job se perde. O outbox fecha essa janela.

Para os jobs do Active Storage, essa janela não importa (os efeitos de um job perdido estão descritos acima). O outbox passa a valer a pena quando a mudança precisa ser **publicada para outros sistemas** (eventos para Kafka ou SNS, webhooks, outro serviço), em que a entrega precisa ser garantida. Nenhum requisito do projeto pede isso.

### Gems Solid do Rails 8, cache e Action Cable

O Rails 8 configura a produção com quatro bancos (principal, cache, fila e cable), para as gems `solid_cache`, `solid_queue` e `solid_cable`. O Heroku Postgres fornece uma única `DATABASE_URL`, e apontar os quatro bancos para ela faz o `db:prepare` criar só as tabelas do banco principal. As três gems foram removidas. O cache usa `:memory_store` (a API não depende de cache para funcionar) e o Action Cable usa `async` (a API não usa Cable).

## 8. Filtros da listagem com `has_scope`

**Decisão:** cada filtro é um escopo pequeno no model, e o controller declara quais parâmetros viram escopos:

```ruby
has_scope :favorites, as: :favorite, type: :boolean, only: :index
has_scope :search,    as: :q,                         only: :index
has_scope :sorted_by, as: :sort, default: "name",     only: :index
```

**Por quê:** o controller fica declarativo (dá para ver de cara quais parâmetros a listagem aceita), e os escopos são testados isoladamente no model. Os filtros se combinam: buscar só entre os favoritos, já ordenado.

**Proteções no model, não só no frontend:**
- **Ordenação:** `sorted_by` só aceita as chaves de `Project::SORTS`. Qualquer outro valor cai na ordem alfabética e nunca chega ao SQL.
- **Busca:** `search` ignora termos com menos de 3 caracteres e passa o termo por `sanitize_sql_like`, então `%` e `_` digitados são texto, não curingas.
- **Desempate pelo `id`** em toda ordenação, para a paginação não repetir nem pular itens quando há nomes ou datas iguais.

**Alternativas consideradas:** um objeto de consulta (`ProjectsQuery`) escrito à mão, sem dependência, equivalente para três filtros. O **Ransack** foi descartado: ele expõe qualquer coluna como filtro e exige manter uma lista do que é permitido.

## 9. Paginação com Pagy

**Decisão:** paginação por offset com Pagy 43, 10 itens por página (o padrão) e no máximo 50 por requisição (`?limit=`). Com 5 cards por linha na grade do desktop, cada página fecha duas linhas completas.

**Por quê:** a API não devolve a tabela inteira de uma vez. O design mostra todos os cards numa grade, então o frontend carrega as páginas seguintes sob demanda ("carregar mais" ou scroll infinito), sem paginação numerada na tela.

**Paginação nos headers, dados no corpo:** o Pagy envia a paginação em headers HTTP ([RFC 8288](https://www.rfc-editor.org/rfc/rfc8288)), o mesmo formato de APIs como a do GitHub, e o corpo é só o array de projetos:

```http
HTTP/1.1 200 OK
link: <https://.../api/v1/projects?page=1&limit=10>; rel="first", <https://.../api/v1/projects?page=2&limit=10>; rel="next", <https://.../api/v1/projects?page=2&limit=10>; rel="last"
current-page: 1
page-limit: 10
total-count: 13
total-pages: 2

[ { "id": 1, "name": "Projeto Iridium", ... }, ... ]
```

- **`link` com `rel="next"`** é o que o frontend segue no "carregar mais". Quando ele não vem, não há mais páginas. A URL já carrega os filtros atuais (`sort`, `q`, `favorite`), então o frontend não precisa remontá-la.
- **`total-count`** conta os projetos que atendem aos filtros atuais, e é o número do título "Projetos (N)". Sem filtro, ele é o total de projetos cadastrados que o enunciado pede. Com "Apenas favoritos" ou uma busca ativa, o título acompanha o que está na tela (ver a seção 12).
- **CORS:** o navegador esconde do JavaScript de outro domínio os headers que não estão na lista de headers simples. Os cinco headers de paginação são liberados com `expose` em `config/initializers/cors.rb`. Sem isso, o frontend no Cloudflare Pages não conseguiria lê-los.

**Alternativa considerada:** paginação por keyset (cursor), mais eficiente em tabelas grandes e sem o problema de itens duplicados quando alguém cria um projeto entre duas páginas. Foi descartada porque a ordenação "próximos à data de finalização" usa uma expressão calculada (`end_date < hoje`), que complica o cursor. O volume do projeto também não justifica.

## 10. Serialização com Active Model Serializers

**Decisão:** `active_model_serializers` 0.10 com o adapter `:attributes`, sem chave raiz: um projeto é um objeto, e a listagem é um array. Contagens e paginação ficam nos headers (seção 9), então o corpo não precisa de `meta`.

**Por quê:** o formato de cada recurso fica numa classe só (`Api::V1::ProjectSerializer`), reaproveitada no `index`, no `show`, no `create` e no `update`. O serializer fica no namespace da versão porque o formato da resposta é parte do contrato da v1. As regras de negócio (model e services) não têm versão. O controller cita o serializer explicitamente em cada resposta (`serializer:` / `each_serializer:`), em vez de depender da busca automática do AMS pelo namespace, para ficar claro de onde vem o formato.

**Custo conhecido:** a série 0.10 está em modo de manutenção. Se o projeto crescesse, a troca natural seria o **Alba**, que é ativo e mais rápido, com uma API parecida.

**Descartado:** Jbuilder, que espalha o formato do JSON por templates.

**URLs das capas:** `cover_url` usa `cover.url`. Em produção, isso gera uma URL assinada direto no R2, válida por 1 hora, então a imagem não passa pelo Heroku. Localmente, usa o serviço Disk.

## 11. Remoção definitiva, sem histórico de versões

**Decisão:** `DELETE /api/v1/projects/:id` apaga o projeto e a capa.

**Por quê:** o modal do design diz *"Essa ação removerá **definitivamente** o projeto"*. Manter o registro no banco contradiria o que a interface promete ao usuário.

**Alternativa considerada:** **`paper_trail` (histórico de versões)**, que guardaria cada edição e permitiria desfazer uma remoção. Foi descartada porque nenhum requisito ou tela usa histórico: seria uma tabela crescendo sem ninguém consultar. Seria a escolha certa se surgisse uma auditoria ("quem mudou a data final?") ou uma lixeira com restauração.

## 12. Regras de negócio que o enunciado deixou em aberto

| Ponto | Decisão |
|---|---|
| "Próximos à data de finalização" | Primeiro os projetos ainda em andamento, do fim mais próximo ao mais distante. Os já encerrados vão para o final. Mostrar primeiro um projeto que terminou há meses não ajudaria ninguém |
| Data final igual à inicial | Inválida: a data final precisa ser **posterior** à de início. No design, as duas datas iguais (01/01/2000) aparecem com erro |
| Número no título "Projetos (N)" | É o total de projetos **cadastrados**, como pedem o enunciado e o Figma (que mostra "(9)" com o filtro de favoritos ligado e 2 cards). Vem de `GET /projects/count`, chamado uma vez ao abrir a página. Filtros e ordenação não mudam o número, e uma remoção o atualiza na própria tela. A primeira versão mostrava o `total-count` da listagem, que acompanha os filtros, e divergia do enunciado |
| Busca | Procura no nome e no cliente, sem diferenciar maiúsculas de minúsculas, a partir de 3 caracteres (no frontend e na API) |
| Capa | Opcional, só .jpg ou .png, até 5 MB |
| Tamanho do nome e do cliente | O enunciado não define. Até 100 caracteres, validado na API e no formulário (com `maxlength` no campo). No card, o texto que não cabe em uma linha termina em reticências, e o texto completo aparece ao passar o mouse |
| Fuso horário | `America/Sao_Paulo`, para "hoje" na ordenação ser o dia no Brasil, não em UTC |

## 13. Testes e CI

| Camada | Ferramenta | O que cobre |
|---|---|---|
| Model | RSpec + shoulda-matchers | Validações, escopos de busca, filtro e ordenação |
| API | RSpec (request specs) | Formato das respostas, paginação, filtros combinados, upload e remoção da capa, erros 400, 404 e 422 |
| Frontend | Vitest, separado em `unit` (sem Nuxt) e `nuxt` (com o runtime do Nuxt) | Schemas, utilitários e componentes |
| Ponta a ponta | Playwright, subindo o Rails (`RAILS_ENV=test`) e o Nuxt | Os caminhos felizes de todos os requisitos pelo navegador, contra a API real (seção 26) |

**RSpec em vez do Minitest padrão do Rails:** é o framework mais usado em times Rails, e a organização em `describe` (endpoint ou método) e `context` (cenário) deixa cada spec lendo como uma especificação. Os dados de teste vêm de uma factory (`FactoryBot`, com o Faker em pt-BR) com traits `:favorite` e `:with_cover`, em vez de fixtures. O `shoulda-matchers` cobre as validações simples, e as regras próprias (contagem de palavras, datas, capa) têm exemplos explícitos.

**CI (GitHub Actions):** três workflows (backend, frontend e E2E), cada um rodando só quando a sua parte muda, e cancelando a execução anterior quando chega um push novo no mesmo branch. O **deploy do backend** é um job do próprio workflow e só roda num push no `main` **depois** que o Brakeman, o bundler-audit, o RuboCop e os testes passam.

**Dependabot:** atualizações mensais agrupadas (um PR por ecossistema), ignorando o Zod 4 e o TypeScript 7, que hoje quebrariam o projeto.

## 14. Escrita em service objects

**Decisão:** criar, editar e remover ficam em `Projects::CreateService`, `Projects::UpdateService` e `Projects::DestroyService`. Os três herdam de `ApplicationService` e seguem o mesmo contrato:

```ruby
result = Projects::UpdateService.call(project: project, attributes: { favorite: true })
result.success? # => true / false
result.record   # => o Project, com os erros quando falhou
```

**Por quê:** o controller fica só com HTTP (ler os parâmetros, chamar o service e responder pelo `render_result` do `BaseController`), e as regras de escrita ficam num lugar testável sem requisição:
- A criação ignora `remove_cover`, que só faz sentido na edição.
- A edição só apaga a capa **depois** de salvar com sucesso, então uma edição recusada nunca perde a imagem atual. Se uma capa nova chega junto com `remove_cover`, a nova vence.

**Leitura fica no controller:** a listagem continua no `index` com `has_scope` e Pagy, e as regras de filtro e ordenação ficam nos escopos do model. Um service para leitura só repassaria chamadas.

**Alternativas consideradas:** callbacks no model (`after_update` para apagar a capa), descartados porque escondem efeitos colaterais e disparam em qualquer `save`, inclusive em seeds e no console. Gems de "interactor" (`interactor`, `dry-transaction`), descartadas porque três operações simples não justificam a convenção extra.

## 15. Um único idioma (pt-BR), sem suporte a vários idiomas

**Decisão:** a aplicação existe só em português do Brasil. Nem a API nem o frontend escolhem idioma por usuário.

**Por quê:** o design e o enunciado são em pt-BR e não pedem outro idioma. Montar a troca de idioma (detectar o idioma, arquivos de tradução nos dois lados, testes por idioma) seria trabalho sem uso.

**Como está hoje:**
- **Rails:** `default_locale` e `available_locales` fixos em `pt-BR`. As mensagens de validação ficam em `config/locales/pt-BR.yml`, que é o lugar padrão do Rails para elas, em vez de texto fixo no model. As chaves de erro (`too_few_words`, `before_start_date`) também voltam no `errors.details`, independentes do texto.
- **Frontend:** textos da interface direto nos componentes, sem `@nuxtjs/i18n`. Datas exibidas no formato brasileiro (`dd/mm/aaaa`), com `lang="pt-BR"` no `<html>`.

**Custo conhecido:** as mensagens de validação existem em dois lugares, no `pt-BR.yml` da API e no schema Zod do formulário, e precisam ser mantidas iguais à mão. Com vários idiomas, o frontend passaria a ler os textos de um arquivo de tradução.

**Se precisar de outro idioma:**
- **Rails:** adicionar `en.yml` (e a gem `rails-i18n` para as mensagens padrão), liberar o idioma em `available_locales` e escolhê-lo por requisição a partir do header `Accept-Language`.
- **Frontend:** adicionar `@nuxtjs/i18n`, mover os textos para arquivos por idioma e mandar o idioma escolhido para a API no `Accept-Language`.

## 16. Sem autenticação nem limite de requisições

**Decisão:** a API é pública. Não há login, autorização nem limite de requisições (Rack::Attack ou o `rate_limit` do Rails).

**Por quê:** o enunciado não tem usuários nem permissões, e o projeto existe para ser avaliado. Montar autenticação e limite de requisições seria trabalho fora do escopo.

**O que isso significa na prática:** qualquer pessoa com a URL da API pode criar, editar e remover projetos, inclusive pelo `curl`. O CORS só impede que **outros sites** chamem a API pelo navegador; ele não protege contra chamadas diretas.

**Proteções que existem mesmo assim:**

| Risco | Proteção |
|---|---|
| Parâmetros inesperados gravados no banco | `params.expect` só aceita os campos do projeto |
| Upload de arquivo arbitrário ou muito grande | A capa só aceita .jpg e .png, até 5 MB, validados no model |
| Resposta gigante para uma requisição só | Paginação com no máximo 50 itens por página, mesmo que o cliente peça mais |
| SQL injection pela ordenação ou pela busca | `sort` só aceita chaves de uma lista fechada. A busca passa por `sanitize_sql_like` e por parâmetros do Active Record |
| Tráfego sem criptografia | `force_ssl` em produção |
| Vulnerabilidades conhecidas | Brakeman e bundler-audit rodam no CI, antes de todo deploy |

**Se o projeto fosse para uso real:**
- **Autenticação:** Devise, que é o padrão consolidado em Rails e já resolve cadastro, login, recuperação de senha e confirmação de e-mail, com **sessão em cookie `HttpOnly`, `Secure` e `SameSite=Lax`**, e não JWT. O cookie `HttpOnly` não fica acessível ao JavaScript (um ataque de XSS não consegue roubar a sessão), o logout invalida a sessão no servidor, e o `SameSite=Lax` impede o navegador de mandar o cookie em requisições de escrita vindas de outros sites, que é a base de um ataque de CSRF. Os projetos passariam a pertencer a um usuário, com cada consulta escopada por ele (`current_user.projects`).

  **O que isso exige:**
  - **Domínio próprio para os dois lados.** O `SameSite` vale por *site* (o domínio registrável), e hoje a API (`herokuapp.com`) e o frontend (`pages.dev`) são sites diferentes. Assim, o cookie teria que ser `SameSite=None`, que os navegadores tratam como cookie de terceiro e bloqueiam ou restringem (o Safari bloqueia por padrão). Com `app.dominio.com` no Pages e `api.dominio.com` no Heroku, os dois viram o mesmo site e o `SameSite=Lax` funciona.
  - **Cookies e sessão de volta no Rails.** O modo API remove esses middlewares. Eles voltam com `config.middleware.use ActionDispatch::Cookies` e `ActionDispatch::Session::CookieStore`.
  - **CORS com credenciais:** `credentials: true` no `rack-cors`, com a origem exata do frontend (que já é o caso), e o frontend chamando a API com `credentials: 'include'`.
- **Limite de requisições:** o `rate_limit` dos controllers (Rails 7.2+) para casos simples, ou o Rack::Attack para regras por IP e bloqueios. Os dois precisam de um cache compartilhado entre processos, como o Redis (o mesmo que o Sidekiq usaria), já que o `:memory_store` atual é separado por processo (seção 7).

## 17. Possíveis evoluções

Nada desta seção foi implementado. São melhorias possíveis, deixadas de fora pela simplicidade do projeto, registradas para mostrar onde cada uma entraria.

**API e banco**
- **Documentação OpenAPI com `rswag`**, gerada a partir dos specs de request do RSpec, com uma página Swagger para testar a API.
- **Regra de datas também no banco** (`CHECK (end_date > start_date)`), para valer mesmo em gravações que não passam pelo model.
- **Índice `pg_trgm` (GIN) para a busca:** um `ILIKE '%termo%'` não usa índice comum e lê a tabela inteira.
- **`strict_loading` na listagem**, para os testes falharem se aparecer uma consulta N+1.
- **Busca de texto completo** (`tsvector`), com relevância e sem diferenciar acentos.
- **Paginação por cursor (keyset)**, se a tabela crescer (seção 9).

**Imagens**
- **Upload direto do navegador para o R2** (direct upload do Active Storage). Hoje o arquivo passa pelo Heroku, que encerra qualquer requisição que passe de 30 segundos.
- **Miniaturas** (variants com `libvips`), para o card não baixar a imagem original.
- **CDN com domínio próprio na frente do R2**, para o navegador poder fazer cache das imagens. As URLs assinadas mudam a cada requisição e impedem esse cache.
- **Limpeza periódica de arquivos sem uso no R2** (seção 7).

**Operação**
- **Monitoramento de erros** (Sentry ou Honeybadger) na API e no frontend.
- **Backups agendados do Postgres** (`heroku pg:backups:schedule`), com um teste de restauração de vez em quando.
- **Ambiente de staging**, com review apps do Heroku por PR (o Pages já gera um preview por PR).

**Produto**
- **Autenticação e projetos por usuário** (seção 16).
- **Limite de requisições** (seção 16).
- **Histórico de alterações** com `paper_trail`, se surgir auditoria ou lixeira (seção 11).
- **Jobs persistidos com Sidekiq** (e Redis), se surgirem e-mails ou integrações com volume, retentativas e agendamento (seção 7).
- **Feature flags** (Flipper), para liberar funcionalidades aos poucos.
- **Outros idiomas** (seção 15).

**Frontend**
- **Testes de regressão visual** (screenshots do Playwright comparados entre versões).
- **Auditoria de acessibilidade automatizada** (axe nos testes do Playwright).
- **Cabeçalhos de segurança no Pages**, como Content Security Policy.

## 18. GitFlow e Conventional Commits

**Decisão:** branches no modelo GitFlow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`) e mensagens de commit no padrão Conventional Commits. O fluxo está descrito no README.

**Como o fluxo se liga ao CI e ao deploy:**
- **`develop`** é o branch padrão do GitHub, então todo PR aponta para ele por padrão. Cada feature entra por PR, com commit de merge, para o histórico mostrar quando cada funcionalidade entrou.
- **`main`** só recebe `release/*` e `hotfix/*`. Como um push no `main` dispara o deploy do backend no Heroku (seção 13), produção só muda quando uma versão é fechada.
- **CI** em todo PR e nos pushes para `main` e `develop`. O Cloudflare Pages publica o `main` em produção e gera um preview para os outros branches.
- **Dependabot** abre os PRs de atualização no `develop`, nunca direto no `main`.

**Histórico anterior ao fluxo:** os três primeiros commits (estrutura inicial, ajustes do Cloudflare Pages e do CI, deploy do backend) foram feitos direto no `main`, antes da adoção do GitFlow, e foram mantidos como estão para não reescrever um histórico já publicado. A partir da API de projetos, tudo entra por `feature/*` → `develop`.

**Por que commit de merge e não squash:** com squash, cada feature viraria um commit só no `develop`, e os commits menores (com as mensagens explicando cada passo) sumiriam do histórico. Com o merge, o histórico do `develop` mostra a feature entrando e preserva os commits dela.

## 19. Frontend em camadas: plugin, service, composable, componente

**Decisão:** cada camada tem uma responsabilidade só.

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Plugin | `plugins/api.ts` | Cria o único cliente HTTP (`$fetch.create` com a `baseURL` do `runtimeConfig`) |
| Service | `services/projects.ts` | Chamadas a `/api/v1/projects`, sem estado. Converte os headers de paginação (`total-count`, `link`) em `{ projects, total, hasNext }` |
| Composable | `composables/useProjectList.ts`, `useProjectCount.ts`, `useSearchHistory.ts` | Estado e regras da tela: páginas carregadas, favoritar, remover, total cadastrado, histórico |
| Schema e utils | `schemas/project.ts`, `utils/*` | Funções puras: regras do formulário, datas por extenso, destaque da busca, `FormData` |
| Componentes | `components/base/*`, `components/project/*`, `components/search/*` | Apresentação. `base/` não conhece o domínio (botão, select, modal, campo de formulário) |
| Páginas | `pages/*` | Compõem as camadas e ligam a URL ao estado |

**Por quê:** só o service conhece URLs e headers da API, então uma mudança no contrato fica em um arquivo. Os composables são testados com um backend falso na fronteira HTTP, sem montar telas (seção 26). Os componentes recebem dados prontos e emitem eventos.

**Sem Pinia:** não há estado compartilhado entre telas. A lista vive na página e o histórico vive no `localStorage`. Uma store global só acrescentaria uma camada.

**VueUse (`@vueuse/nuxt`):** usado para `onClickOutside`, `useDebounceFn`, `useLocalStorage`, `useElementVisibility` e `useScrollLock`. São utilitários pequenos e testados, que eu reescreveria de forma pior.

## 20. Filtros e ordenação na URL

**Decisão:** "Apenas favoritos" e a ordenação ficam na query string (`/?favorite=true&sort=nearest_end`), e a busca tem a própria rota (`/search?q=termo`).

**Por quê:** o botão voltar, o recarregar da página e um link compartilhado mantêm o que o usuário escolheu. Ao voltar da edição de um projeto, a lista reaparece com os mesmos filtros. A página só lê e escreve a URL (`router.replace`, que não empilha histórico a cada clique), e o composable recarrega quando ela muda.

## 21. Scroll infinito sobre paginação por offset

**Decisão:** a lista carrega 10 projetos por vez. A página seguinte vem sozinha quando um elemento sentinela, no fim da grid, chega a 400 px da tela.

**Por quê:** o design não mostra paginação nem um botão "carregar mais", e o scroll infinito não acrescenta nenhum elemento visual.

**Três cuidados, todos cobertos por testes do `useProjectList`:**
- **Sentinela reativo, não um callback único:** `useElementVisibility` + `watchEffect` carregam enquanto o sentinela estiver visível e a lista estiver ociosa. Um `IntersectionObserver` simples só avisa quando a visibilidade *muda*. Se o sentinela já estava visível quando a primeira página chegou, a segunda nunca carregava (o bug apareceu na validação no navegador).
- **Remoções sem pular projetos:** na paginação por offset, remover um item desloca todos os seguintes. Sem cuidado, o próximo `loadMore` pularia um projeto. Depois de remover (ou de desfavoritar com o filtro ligado), o composable busca de novo as páginas já carregadas.
- **Respostas fora de ordem:** cada carga recebe um número, e uma resposta atrasada de um filtro anterior é descartada. Isso vale também para a página seguinte que chega depois de trocar o filtro.

**Alternativa considerada:** paginação por cursor (keyset) na API, que elimina o problema do deslocamento (seção 9). Para dezenas de projetos, recarregar as páginas já vistas custa pouco.

## 22. Favorito otimista, remoção confirmada

**Favoritar:** a estrela muda na hora e o `PATCH` vai em seguida. Se a API falhar, a estrela volta ao estado anterior. É uma ação leve, fácil de desfazer, e esperar a rede a cada clique deixaria a tela lenta. Com o filtro "Apenas favoritos" ligado, desfavoritar tira o card da lista (o número do título, que é o total cadastrado, não muda).

**Remover:** não é otimista. O modal fica aberto com o botão em carregamento até a API confirmar, e mostra uma mensagem se der erro. Uma remoção que "volta" depois de sumir seria mais confusa do que esperar meio segundo.

## 23. Busca: rota própria, histórico local e destaque sem `v-html`

**Fluxo:** a lupa do header vira a barra de busca. Com 3 ou mais caracteres, e 300 ms depois da última tecla (debounce), o app abre `/search?q=termo`. Enquanto o usuário digita, a URL é substituída (`replace`) e não empilhada, para o voltar não passar por cada letra.

**Histórico (últimas 5 buscas):**
- **Onde:** `localStorage`, por navegador. Não justifica uma tabela na API sem usuários (seção 16).
- **Quando entra:** a cada busca executada. Como a busca roda enquanto se digita, "Pro" → "Proj" → "Projet" encheria o histórico de fragmentos. Por isso, um termo que estende (ou encurta) o último **substitui** o último, e só "Projet" fica.
- Termos repetidos sobem para o topo, sem diferenciar maiúsculas de minúsculas.

**Destaque:** `splitHighlight` divide o texto em trechos com e sem correspondência, e o template renderiza os trechos com `<mark>`. Não há `v-html`, então um projeto chamado `<script>…` aparece como texto. O destaque vale para o nome e para o cliente, porque a API busca nos dois.

**Limite conhecido:** a busca não ignora acentos ("projeto" não encontra "projéto"), nem na API (`ILIKE`) nem no destaque. Uma busca de texto completo resolveria (seção 17).

## 24. Estados de carregamento

| Situação | O que aparece |
|---|---|
| Primeira carga da lista | 5 cards skeleton e um marcador no lugar do "(N)". O empty state nunca pisca antes de os dados chegarem |
| Troca de filtro ou ordenação | Os cards atuais ficam esmaecidos até a resposta chegar (sem voltar ao skeleton, que faria a página pular) |
| Próxima página | Um spinner no fim da grid |
| Edição | Skeleton do formulário enquanto o projeto carrega |
| Envio de formulário e remoção | Botão em carregamento e desabilitado |
| Erro ao carregar | Mensagem e botão "Tentar novamente" |

**Empty states:** o do design ("Nenhum projeto") só aparece quando não existe nenhum projeto. Com o filtro de favoritos sem resultados, a tela mantém os controles e mostra "Nenhum projeto favorito", com um botão para ver todos. A busca sem resultados mostra "Nenhum projeto encontrado".

## 25. Fidelidade ao Figma sem o Dev Mode

O arquivo do Figma estava disponível só para visualização, sem o Dev Mode (que mostra medidas, cores e fontes).

**Como as medidas foram tiradas:**
- **Cores:** amostradas por script direto dos pixels das telas exportadas e guardadas como tokens em `assets/scss/_tokens.scss`. Elas alimentam as variáveis do Bootstrap e viram CSS variables (`--pm-*`) para os componentes.
- **Tamanhos de fonte:** a largura de cada texto nas imagens foi comparada com a largura calculada pelo navegador para a mesma fonte, em vários tamanhos e pesos.
- **Espaçamentos:** navbar de 80 px, cards de 346 × 430 com capa de 232, 32 px entre os cards e 5 colunas em 1920 px. Tudo conferido no Chrome, lado a lado com as telas.
- **Fonte:** Encode Sans Semi Expanded (confirmada no Figma), pelo Google Fonts.

**Elementos refeitos:**
- **A ilustração do card sem capa** foi redesenhada em SVG a partir da imagem, porque não havia o arquivo original.
- **Os campos de data** são um componente próprio (`BaseDateInput`): texto com máscara dd/mm/aaaa e um calendário em pt-BR com as cores do projeto. Clicar no campo abre o calendário sem tirar o foco dele, então dá para digitar ou escolher. Pelo teclado, a seta para baixo entra no calendário (setas, Enter, Esc), e o Tab segue para o próximo campo e fecha o calendário. A primeira versão usava o `<input type="date">` nativo, mas ele segue o idioma do navegador (mm/dd/yyyy num Chrome em inglês) e o calendário que ele abre não aceita estilo. O valor enviado à API continua sendo `YYYY-MM-DD`, e a conversão está em funções puras testadas (`maskBrDate`, `parseBrDate`, `calendarWeeks`).

## 26. Testes do frontend com TDD e E2E

**Como foi feito:** red → green em fatias verticais (um teste falhando, o código mínimo para passar, o próximo teste), só nas interfaces públicas combinadas antes:

| Seam | Testes | O que pega |
|---|---|---|
| Regras puras (`test/unit`) | Schema Zod (as mesmas mensagens do Rails), datas por extenso em qualquer fuso, destaque, `FormData` | Regras de negócio e formatação |
| Composables (`test/nuxt`) | `useProjectList` contra um backend falso que imita a API (headers de paginação, filtro, `PATCH`, `DELETE`, latência e falhas); `useSearchHistory` | Paginação, remoção sem pular itens, rollback do favorito, respostas fora de ordem, regras do histórico |
| Componentes (`test/nuxt`) | `ProjectCard`, `ProjectForm`, `ProjectDeleteModal` montados com `mountSuspended` | O que o usuário vê e os eventos emitidos: botão Salvar desabilitado, erros do 422 nos campos, menu do card |
| Ponta a ponta (`e2e/tests`) | Playwright contra a API real: lista vazia, criar com capa, formulário inválido, favoritar e filtrar, ordenar por prazo, buscar com destaque e histórico, editar removendo a capa, remover pelo modal | A integração que os outros testes simulam: CORS, upload multipart, headers de paginação, rotas do Nuxt e o banco de verdade |

**Mock só na fronteira:** o backend falso fica no nível do HTTP (`registerEndpoint` do `@nuxt/test-utils`). O service e o composable rodam de verdade, e os testes não quebram se a implementação mudar.

**Como o E2E funciona:**
- **Banco limpo a cada teste:** uma fixture automática roda `bin/rails e2e:reset` (`TRUNCATE` das tabelas de projetos e do Active Storage) antes de cada teste. O rake task se recusa a rodar fora de `RAILS_ENV=test`, e a API não ganhou nenhum endpoint de teste.
- **Guarda contra o banco errado:** depois de limpar, a fixture confere em `GET /projects/count` que a API em `:3000` está vazia. Se um `bin/dev` (banco de desenvolvimento) estiver ocupando a porta, o teste falha com uma mensagem clara, em vez de apagar ou ler dados reais.
- **Contra o build de produção:** o frontend testado é o site estático do `nuxt generate` (o mesmo que o Cloudflare Pages serve), servido pelo `serve` em modo SPA. No começo os testes rodavam contra o `nuxt dev`. Ele compila páginas e otimiza dependências na primeira visita, e no CI isso estourava o timeout do primeiro teste e deixava a suíte instável. Com o build, essa instabilidade sumiu e a suíte ficou mais rápida (de ~52 s para ~33 s).
- **Testes em série:** como compartilham o banco, rodam com 1 worker. Os dados de partida são criados pela própria API (`POST /projects`), e só o teste de criação passa pelo formulário.
- **Seletores por role e label** (`getByRole`, `getByLabel`), sem classes CSS: o teste encontra os elementos como um usuário ou um leitor de tela. Isso levou a uma melhoria de acessibilidade: a capa do card ganhou `alt="Capa do projeto <nome>"`.
- **Datas relativas a hoje** nos testes de ordenação, para eles continuarem válidos com o passar do tempo.
- **Falhas:** trace e screenshot ficam guardados só dos testes que falharem (`trace: 'retain-on-failure'`). Localmente, `npm run report` abre o relatório; no CI, o relatório vai como artefato do job.

**Fidelidade visual:** não é coberta por testes automatizados. Foi verificada no Chrome, estado por estado (lista, select aberto, menu, modal, favoritos, skeleton, empty state, formulários com erro, edição com capa, busca e histórico), em 1920 px e no celular.

**Ponto de atenção do Vitest 5:** o cache persistente de módulos (`fsModuleCache`) não percebe composables novos, que ficam "not defined" nos testes até o cache ser limpo. Ele está desligado no projeto `nuxt` do `vitest.config.ts`.
