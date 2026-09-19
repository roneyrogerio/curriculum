# Currículo — Roney de Oliveira

Site estático em Astro, no ar em [roneyrogerio.dev](https://roneyrogerio.dev). Uma fonte de
dados tipada alimenta quatro saídas: o site, a folha A4, o PDF e o DOCX. Colada a descrição
de uma vaga, todas se reorganizam para ela — sem inventar nada.

```text
src/data/        o currículo como dados tipados: é o único lugar a editar
src/lib/         análise da vaga, adaptação, e os geradores de PDF e DOCX
src/components/  CvSite (leitura) e CvPrint (folha A4)
scripts/         exportadores e o simulador de parsing de ATS
deploy/          manifestos Knative e a configuração do NGINX
```

## Rodando

```bash
nvm use          # Node 24, lido do .nvmrc
npm install
npm run dev
```

| Rota | O que é |
| --- | --- |
| `/` | seletor de idioma, e o alvo do `x-default` |
| `/pt-br/`, `/en-us/` | o site: duas colunas, tema claro/escuro, trilha de seções |
| `/pt-br/print/`, `/en-us/print/` | a folha A4, com o painel de adaptação por vaga |

## Comandos

```bash
npm run build         # gera PDF, DOCX e a imagem OG, depois monta o site
npm test              # Vitest: invariantes dos dados, paridade de idiomas, adaptação
npm run check         # astro check
npm run validate:ats  # simula o parsing de um ATS sobre o PDF e o DOCX
npm run generate      # só os arquivos, sem montar o site
```

O PDF, o DOCX e a imagem OG **não são versionados**: o build os escreve a partir de
`src/data`, então não há como ficarem defasados em relação ao conteúdo.

## Duas apresentações, um sistema de design

Site e impressão compartilham `src/styles/tokens.css`, então o PDF parece irmão do site em
vez de um documento genérico.

| Aspecto | Site | Impressão |
| --- | --- | --- |
| Público | pessoas e mecanismos de busca | ATS e papel |
| Layout | duas colunas, tema claro/escuro | A4 em coluna única |
| Indexação | `index, follow` | `noindex`, canonical para o site |

## Por que o PDF é o artefato de ATS

Os sistemas de triagem leem o **arquivo enviado**, não o site: nenhum ATS relevante rastreia
páginas pessoais. Por isso a versão de impressão segue as regras de parsing:

- coluna única, com leitura linear de cima para baixo;
- cabeçalhos de seção convencionais — rótulo criativo faz o parser tratar o documento
  inteiro como um bloco só;
- data e cargo na mesma linha, em vez de colunas paralelas;
- contato no corpo do documento, nunca em cabeçalho ou rodapé de página;
- sem tabela, caixa de texto, ícone ou medidor gráfico carregando informação;
- texto desenhado como texto: PDF feito de captura de tela não tem camada de texto, e o
  parser lê uma página em branco.

Os medidores `●●●●○` do modelo antigo saíram do documento, porque parser nenhum os lê. Eles
seguem no site, onde há gente olhando, com o nível anunciado por `aria-label`.

Uma competência pode ter mais de um nome. "Go" e "Golang" são a mesma coisa, e a vaga pode
usar qualquer um dos dois: o campo `alias` guarda os equivalentes, o documento mostra
"Go (Golang)" e o casamento considera todos.

## Adaptar a uma vaga

No painel da página de impressão, cole o título da vaga, a descrição, ou os dois — qualquer
um deles basta. O idioma do anúncio decide a versão: anúncio em inglês gera o currículo em
inglês, mesmo que você esteja na página em português.

**O que ele faz:** reordena as competências dentro de cada grupo e os grupos entre si; os
itens de cada cargo e de cada projeto; os parágrafos do resumo; e a linha de disciplinas e
tecnologias sob o nome. Informa a cobertura dos termos técnicos e lista o que falta.

**O que ele nunca faz:** acrescentar competência, ferramenta ou experiência. A adaptação é
uma permutação do que já está na página — `src/lib/tailor.test.ts` verifica que a saída
contém exatamente os mesmos itens da entrada, e que termos da vaga ausentes no currículo
continuam ausentes. A única exceção é o cargo-alvo, que é consentido, visível e reversível:
dizer a que vaga você se candidata não afirma habilidade nenhuma.

Como ele decide:

- o **título** da vaga pesa mais que o corpo, por ser a palavra-chave mais buscada num ATS;
- o que a vaga **exige** pesa mais do que o que ela **gostaria** — uma menção em "aumenta
  suas chances" não reordena a linha de topo;
- **cultura e benefícios são descartados**: costumam ocupar dois terços do anúncio e não
  dizem nada sobre o trabalho;
- uma disciplina que a vaga não nomeia ainda conta pelas competências que ela pede, que é
  como uma vaga de Go com microsserviços é reconhecida como backend sem escrever "backend".

Régua do relatório: 80% ou mais é forte, 65% a 79% é médio, abaixo disso é fraco.

**O que ele não faz é fechar a lacuna.** Se a vaga pede Kafka e você não tem Kafka, ele
continua ausente: a lista existe para você decidir, não para o documento preencher.

## Testes

`npm test` cobre a lógica pura, que é onde o erro passa despercebido: nenhuma seção vazia,
níveis dentro da escala, datas ISO válidas e em ordem, formato de data consistente, paridade
entre os idiomas, todo projeto com link público, e nenhuma palavra-chave repetindo o que a
seção de competências já diz.

`npm run validate:ats` fecha o resto, sobre os arquivos realmente gerados: contatos
extraíveis, cabeçalhos padrão, ordem de leitura linear, contagem de páginas, ausência de
tabela e caixa de texto no DOCX, nenhum texto ultrapassando a margem do papel, e os
artefatos em dia com `src/data`.

Boa parte dessas verificações nasceu de um defeito real — a de margem veio de um link do
GitHub que saía da folha sem que nenhuma checagem de parsing acusasse.

## SEO

`canonical`, `hreflang` (pt-BR, en-US e x-default), Open Graph e Twitter Card, `sitemap.xml`,
`robots.txt` e JSON-LD com um grafo `Person` + `ProfilePage`.

A raiz é um seletor de idioma indexável, **sem redirecionamento automático**: o Google pede
que não se redirecione entre versões de idioma, porque o Googlebot rastreia dos EUA e não
envia `Accept-Language` — a detecção resolveria sempre para a mesma versão e a outra ficaria
inalcançável. É ela também o alvo do `x-default`, que a documentação descreve como feito para
páginas de seleção de idioma.

As rotas de impressão saem do índice por `noindex`, e o `robots.txt` **não** as bloqueia: uma
página bloqueada nunca é lida, e a regra `noindex` jamais seria vista.

## Deploy

Imagem multi-arquitetura no GHCR, servida por NGINX unprivileged como Knative Service sobre
Kubernetes (Oracle Kubernetes Engine), com TLS terminado no Cloudflare.

- **Checagem antes do deploy:** `astro check`, `npm test`, build e `validate:ats`. O job de
  deploy depende disso e não roda em pull request.
- **Actions fixadas por SHA de commit**, não por tag: uma tag pode ser movida para outro
  commit, e é assim que um workflow passa a executar código de terceiros.
- **Permissão mínima:** `contents: read` no topo, `packages: write` só no job que publica.
- **Deploy por SHA imutável.** O manifesto versionado traz `:latest` apenas como recurso para
  um `kubectl apply` manual.
- **Pod endurecido:** usuário não-root, `capabilities: drop: ALL`, `seccompProfile:
  RuntimeDefault`, sem escalonamento de privilégio, com requests, limits e probes.
- **Escala limitada** (`minScale: 1`, `maxScale: 3`): sem cold start na primeira visita, e
  sem poder consumir o nó inteiro.

O NGINX serve `/_astro/` como `immutable` por um ano — os nomes têm hash de conteúdo —, o
restante com revalidação curta, mais gzip, página 404 própria e cabeçalhos de segurança
(CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).

## Segurança

Astro escapa o que está entre chaves, mas `set:html` existe justamente para contornar isso,
então tudo que chega lá já vai escapado. O relatório do painel é montado com nós do DOM, não
com HTML em string: os termos vêm do texto que a pessoa cola, e o fato de a tokenização
remover `<` e `>` é efeito colateral, não fronteira de segurança. O JSON embutido em
`<script>` escapa `<` como `<`, porque `JSON.stringify` deixaria um `</script>` fechar a
tag antes da hora.

## Versionamento e publicação

Publicar é consequência de um release, não de um push.

```text
push para main
  → verifica (check, testes, build, validate:ats)
  → release-please deixa o PR de versão em dia
     nenhum deploy

merge do PR de versão
  → verifica de novo
  → release-please cria a tag e o release
  → deploy, uma vez só
```

Assim o que está no ar sempre corresponde a uma versão com changelog, e uma versão nunca é
publicada duas vezes — o que acontecia quando o deploy escutava todo push.

O deploy lê a saída do release-please dentro do mesmo workflow em vez de escutar a tag:
eventos disparados pelo `GITHUB_TOKEN` não iniciam novas execuções, então um workflow que
escutasse a tag nunca rodaria.

Não há gatilho de `pull_request`, também de propósito: o PR de versão é aberto por um bot, e
o GitHub exige aprovação manual para execuções disparadas por bot — o que pararia o fluxo a
cada versão. As verificações continuam obrigatórias em todo push para `main`.

A imagem é publicada com três tags: o SHA do commit, a versão do release e `latest`.
