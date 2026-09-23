# Cloudflare

O TLS termina no Cloudflare, e duas coisas ficam nele de propósito.

## 1. A tranca da página de adaptação

`/print/tailor/` gasta a chave da OpenAI a cada envio, então não é pública. A tranca é
uma **Access Application** self-hosted, não código:

| Campo | Valor |
| --- | --- |
| Domínio | `roneyrogerio.dev` |
| Path | `print/tailor` |
| Política | Allow · Emails · `contact@roneyrogerio.dev` |

Um pedido sem sessão válida nunca chega à aplicação, o que é a camada certa: uma
verificação de identidade pertence a quem já termina o TLS, não reimplementada
dentro de um site de currículo.

**Um path só, e isso é de propósito.** A página chama a Action por
`Astro.callAction` em vez de o formulário postar em `/_actions/tailor`, e não é
prefixada por idioma como `/pt-br/print/` — o idioma sai da vaga colada, não da
URL —, então não existe uma segunda URL a proteger nem regra com curinga. Uma regra esquecida ali seria uma porta
aberta, não uma página quebrada — nada avisaria.

O servidor não depende disso: sem a chave configurada ele responde que não há
chave, e a Action valida a entrada antes de gastar qualquer token. A tranca é a
primeira camada, não a única.

## 2. Os headers de segurança das páginas estáticas

Nenhum deles tem como sair do Astro nas páginas pré-renderizadas: o middleware roda
apenas nas rotas sob demanda, porque uma página pré-renderizada é servida pelo
handler de arquivos antes de a aplicação ser alcançada, e o `security.csp` e o
`staticHeaders` ficam desligados pelos motivos escritos em `astro.config.mjs`. Os
cinco ficam numa **Transform Rule → Modify Response Header**, aplicada a todo o site:

```
X-Frame-Options:         DENY
X-Content-Type-Options:  nosniff
Referrer-Policy:         strict-origin-when-cross-origin
Permissions-Policy:      camera=(), microphone=(), geolocation=(), interest-cohort=()
Content-Security-Policy: default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com; object-src 'none'
```

São os mesmos valores de `src/middleware.ts`, que continua cobrindo `/print/tailor/`.
Se a regra sumir ou divergir do código, `npm run verify:headers` acusa.

**O CSP muda na regra antes do deploy.** Sem os hosts do Google, o `gtag.js` é
bloqueado sem aviso e o Analytics simplesmente não recebe nada. Com os hosts na regra
e o código ainda antigo, nada quebra: é só permissão sobrando até o deploy chegar.
