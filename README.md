# Currículo — Roney de Oliveira

Meu currículo como software: uma fonte de dados tipada que gera o site, a folha A4, o PDF e o
DOCX — e, colada a descrição de uma vaga, **escreve uma versão do currículo para aquela vaga,
otimizada para ATS, sem poder inventar nada.**

No ar em [roneyrogerio.dev](https://roneyrogerio.dev).

## Gerar um currículo para uma vaga

Cole o anúncio inteiro em `/print/tailor/` e envie. O título é a primeira linha de qualquer vaga,
então não há campo separado para ele. O idioma do anúncio decide o idioma do documento.

Volta uma folha A4 mais curta, com o vocabulário do anúncio, sem as experiências que aquela
vaga não tem motivo para ler. Os botões de PDF e DOCX escrevem os arquivos daquela folha, no
navegador — os arquivos em `/cv` são o currículo padrão, e baixá-los ali entregaria o
documento errado.

### A garantia: ele não pode inventar

Pedir a um modelo que não invente é um pedido. Aqui a garantia está na forma da pergunta.

**O modelo nunca recebe um campo onde caiba um fato.** O currículo vai como uma lista de
fatos com identificador (`pos.0.hl.2`, `grp.1.sk.4`), e a resposta é um *plano*: quais
identificadores manter, em que ordem, e como redigir cada frase. Empregador, datas, local,
links, número de credencial, formação e contato nunca são enviados nem lidos de volta — são
costurados a partir de `src/data` num caminho que a resposta não toca.

**Cada frase reescrita é conferida contra o fato que ela diz reescrever.** Duas coisas são o
que um modelo de fato fabrica quando mandam encaixar um currículo numa vaga: uma tecnologia
que ele viu no anúncio, e um número que soa como currículo e que ninguém mediu. Uma frase que
não passa é revertida ao texto original e aparece no relatório — o documento degrada para a
verdade, em vez de chegar assim a um recrutador.

Reescrever continua livre: trocar "mensageria assíncrona" por "filas" quando a vaga diz
"filas" é o objetivo.

### O que é fixo e o que a vaga decide

| Fixo | Por quê |
| --- | --- |
| Cabeçalho no topo | é onde um parser procura como te contatar |
| Resumo logo abaixo | é o único parágrafo lido inteiro, por gente e por pontuação |
| Palavras-chave no fim | existem para casar, não para ler |
| Ordem dos empregos | cronologia é fato; reordenar muda um fato sem escrever nada |
| Formação, certificações e idiomas presentes | um ATS pontua para baixo a ausência |

A vaga decide o resto: a ordem do miolo (competências primeiro numa vaga de stack, projetos
acima de empregos quando os projetos são a evidência mais forte), quais seções aparecem, a
ordem e a seleção de projetos, competências, bullets e palavras-chave, e toda a redação.

As seções fixas não estão no esquema que o modelo responde — o enum oferece só as móveis,
então um layout inválido não é algo que ele consiga expressar.

## Rodando

```bash
nvm use          # Node 24, lido do .nvmrc
npm install
npm run dev
```

Para usar `/print/tailor/` localmente, uma chave em `.env`:

```bash
OPENAI_API_KEY=sk-...
```

| Rota | O que é |
| --- | --- |
| `/` | seletor de idioma, e o alvo do `x-default` |
| `/pt-br/`, `/en-us/` | o site: duas colunas, tema claro/escuro |
| `/pt-br/print/`, `/en-us/print/` | a folha A4 |
| `/print/tailor/` | adaptação por vaga — privada, atrás do Cloudflare Access |

## Comandos

```bash
npm run build          # gera PDF, DOCX e a imagem OG, depois monta o site
npm test               # invariantes dos dados, adaptação, verificação, headers
npm run check          # astro check
npm run validate:ats   # simula o parsing de um ATS sobre o PDF e o DOCX
npm run verify:headers # confere os headers do site no ar
```

O PDF, o DOCX e a imagem OG não são versionados: o build os escreve a partir de `src/data`,
então não há como ficarem defasados.

## Como funciona

```text
src/data/        o currículo como dados tipados: é o único lugar a editar
src/lib/resume/  blocos, fatos, esquema, prompt, cliente, verificação, composição
src/actions/     a Action que adapta a uma vaga
src/components/  CvSite (leitura) e ResumeSheet (folha A4, a partir de blocos)
scripts/         exportadores, simulador de ATS, verificador de headers
deploy/          manifestos Knative e a configuração do Cloudflare
```

O pipeline da adaptação, e por que está nessa ordem:

| Passo | O que faz |
| --- | --- |
| `facts` | o currículo vira fatos endereçáveis, para o modelo só poder apontar |
| `prompt` | a metade estável primeiro, a vaga por último, pelo cache de prompt |
| `client` | Structured Outputs com `strict: true`: obedece ao esquema ou falha |
| `verify` | cada reescrita é conferida contra o fato que ela reescreve |
| `compose` | empregador, datas e links vêm de `src/data`, nunca da resposta |

Nada acima do cliente conhece a OpenAI, e nada abaixo dele conhece HTTP. Trocar de provedor é
`client.ts`; trocar de renderizador é `document.ts`.

**Um renderizador só.** A folha é desenhada a partir de cinco tipos de bloco, escolhidos
porque um ATS analisa cada um de forma diferente. O mesmo componente desenha o currículo
padrão e o adaptado: dois renderizadores do mesmo documento divergem até um estar errado.

**Modelo e custo.** `gpt-5-nano` com `reasoning: low`, menos de US$ 0,001 por adaptação — o
ranking completo, com quando trocar, está em `.env.example`.
O currículo vai antes do anúncio no prompt de propósito: a OpenAI cacheia o prefixo mais longo
que casa e cobra um décimo por ele. Invertido, custaria umas dez vezes mais — a página mostra
a fatia que veio do cache, então uma regressão nessa ordem aparece em vez de só sair mais cara.

## Por que o PDF é o artefato de ATS

Os sistemas de triagem leem o arquivo enviado, não o site: nenhum ATS relevante rastreia
páginas pessoais. Por isso a folha segue as regras de parsing:

- coluna única, com leitura linear de cima para baixo;
- cabeçalhos de seção convencionais — rótulo criativo faz o parser tratar o documento inteiro
  como um bloco só;
- data e cargo na mesma linha, em vez de colunas paralelas;
- contato no corpo do documento, nunca em cabeçalho ou rodapé de página;
- sem tabela, caixa de texto, ícone ou medidor gráfico carregando informação;
- texto desenhado como texto: PDF feito de captura de tela não tem camada de texto.

Os medidores `●●●●○` existem só no site, onde há gente olhando, com o nível anunciado por
`aria-label`. No documento não entram, porque parser nenhum os lê.

Uma competência pode ter mais de um nome. "Go" e "Golang" são a mesma coisa, e a vaga pode
usar qualquer um: o campo `alias` guarda os equivalentes, o documento mostra "Go (Golang)" e o
casamento considera todos.

## Testes

`npm test` cobre a lógica pura, que é onde o erro passa despercebido: nenhuma seção vazia,
níveis dentro da escala, datas ISO válidas e em ordem, paridade entre os idiomas, as zonas
fixas do layout, a ordem cronológica dos empregos, e a verificação rejeitando tecnologia e
número inventados enquanto aceita sinônimo que o currículo já garante.

`npm run validate:ats` fecha o resto, sobre os arquivos realmente gerados: contatos
extraíveis, cabeçalhos padrão, ordem de leitura linear, ausência de tabela e caixa de texto
no DOCX, e nenhum texto ultrapassando a margem do papel.

O número de páginas é informado, não exigido. Este é o currículo base, e ele é a fonte de
fatos, não o arquivo que se envia: quem vai para a vaga é a versão adaptada, que o modelo
encurta. Um teto aqui pressionaria a tirar um fato verdadeiro do repositório para caber numa
folha que ninguém recebe.

A verificação de margem existe porque um link longo pode ultrapassar o papel sem que
nenhuma checagem de parsing acuse: o texto está lá, extraível, e mesmo assim cortado na
impressão.

## SEO

`canonical`, `hreflang` (pt-BR, en-US e x-default), Open Graph e Twitter Card, `sitemap.xml`,
`robots.txt` e JSON-LD com um grafo `Person` + `ProfilePage`.

A raiz é um seletor de idioma indexável, sem redirecionamento automático: o Google pede que
não se redirecione entre versões de idioma, porque o Googlebot rastreia dos EUA e não envia
`Accept-Language` — a detecção resolveria sempre para a mesma versão e a outra ficaria
inalcançável.

As rotas de impressão saem do índice por `noindex`, e o `robots.txt` não as bloqueia: uma
página bloqueada nunca é lida, e a regra `noindex` jamais seria vista.

## Deploy

Imagem multi-arquitetura no GHCR, rodando como Knative Service sobre Kubernetes (Oracle
Kubernetes Engine), com TLS terminado no Cloudflare. Tudo é pré-renderizado menos `/print/tailor/`,
que é a única rota sob demanda.

Publicar é consequência de um release, não de um push.

```text
push para main
  → verifica (check, testes, build, validate:ats)
  → release-please deixa o PR de versão em dia
     nenhum deploy

merge do PR de versão
  → verifica de novo → tag e release → deploy, uma vez só
```

- **Actions fixadas por SHA de commit**, não por tag: uma tag pode ser movida para outro
  commit, e é assim que um workflow passa a executar código de terceiros.
- **Permissão mínima:** `contents: read` no topo, `packages: write` só no job que publica.
- **Deploy por SHA imutável.** O manifesto traz `:latest` apenas para um `kubectl apply` manual.
- **Pod endurecido:** usuário não-root, `capabilities: drop: ALL`, `seccompProfile:
  RuntimeDefault`, sem escalonamento de privilégio, com requests, limits e probes.
- **Escala limitada** (`minScale: 1`, `maxScale: 3`): sem cold start na primeira visita, e sem
  poder consumir o nó inteiro.

A chave da OpenAI é segredo de **runtime**, não de build: a imagem é pública no GHCR, e uma
chave passada como build-arg ficaria legível no histórico de camadas para sempre. A Action do
GitHub grava um Secret no cluster e o Knative injeta por `secretKeyRef`. Trocar a chave é
rodar o deploy de novo, sem rebuild. Com `optional: true`, a falta do Secret derruba só a rota
de adaptação, e não o site inteiro por causa de uma funcionalidade.

## Segurança

Cinco headers, definidos em [`src/middleware.ts`](src/middleware.ts): `Content-Security-Policy`,
`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`.

O CSP fecha tudo em `default-src 'self'`, com `object-src 'none'` e `frame-ancestors 'none'`.
A única folga é `script-src 'unsafe-inline'`, e ela tem um dono: a página lê o tema salvo num
script inline antes da primeira pintura, para não piscar branco antes de ficar escura. A
alternativa do Astro — um hash por script — só cobre os scripts que ele processa, e esse
precisa ser `is:inline`. A folga fica contida pelo resto da política, e um teste trava isso.

O middleware cobre as rotas sob demanda. As páginas pré-renderizadas são servidas pelo
handler de arquivos antes de a aplicação ser alcançada, então para elas os mesmos headers vêm
de uma Transform Rule do Cloudflare, descrita em [`deploy/cloudflare.md`](deploy/cloudflare.md)
e conferida por `npm run verify:headers`.

`/print/tailor/` é privada por uma Access Application do Cloudflare. Ela não é prefixada
por idioma como as demais rotas de impressão, porque o idioma do documento sai da vaga colada
e não da URL — uma URL por idioma seria uma segunda resposta para uma pergunta já respondida,
e um segundo caminho a lembrar de proteger. O formulário posta para a
própria página, que invoca a Action por `Astro.callAction`, em vez de postar em
`/_actions/tailor`: assim existe **um caminho só** a proteger. Uma segunda regra esquecida
seria uma porta aberta, não uma página quebrada — nada avisaria.

A vaga colada é texto de um estranho dentro de um prompt. Ela é cercada e rotulada como dado,
e o esquema faz o resto: não existe campo na resposta onde uma instrução vinda do anúncio
pudesse ter efeito, porque todo o resto é identificador tirado do currículo.

Astro escapa o que está entre chaves, mas `set:html` existe para contornar isso, então tudo
que chega lá já vai escapado. O JSON embutido em `<script>` escapa `<` como `<`, porque
`JSON.stringify` deixaria um `</script>` fechar a tag antes da hora.
