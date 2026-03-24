# Curriculum Vitae - Roney de Oliveira

Projeto standalone em Astro para curriculo bilingu e otimizado para ATS (Applicant Tracking Systems).

## Requisitos

- Node.js 20+ (recomendado usar `nvm use` com o arquivo `.nvmrc`)

## Stack

- Astro
- Markdown
- CSS simples com layout de coluna unica

## Como rodar

```bash
nvm use
npm install
npm run dev
```

## Como gerar build

```bash
npm run build
npm run preview
```

## Como gerar PDF

Use a impressao do navegador para gerar o arquivo PDF:

```bash
npm run dev
```

Depois abra `http://localhost:4321/pt-br/` ou `http://localhost:4321/en-us/` e use `Cmd+P` para salvar em PDF.

## Estrutura

- `src/content/cv/pt-br.md`: versao em portugues
- `src/content/cv/en-us.md`: versao em ingles
- `src/pages/pt-br.astro`: rota PT-BR
- `src/pages/en-us.astro`: rota EN-US
- `src/layouts/CVLayout.astro`: metadados e shell de pagina
