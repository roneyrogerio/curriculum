# Changelog

## [0.4.0](https://github.com/roneyrogerio/curriculum/compare/v0.3.3...v0.4.0) (2026-09-19)


### Funcionalidades

* estimar quanto a vaga paga e quanto pedir ([9bbbd6d](https://github.com/roneyrogerio/curriculum/commit/9bbbd6df2b5e24ac92bb58c9f59f63e7fec8f0d3))


### Performance

* cortar dois terços do custo da estimativa ([128bc1d](https://github.com/roneyrogerio/curriculum/commit/128bc1db50b82cf6cbf3c3f896045686acae75db))

## [0.3.3](https://github.com/roneyrogerio/curriculum/compare/v0.3.2...v0.3.3) (2026-09-19)


### Correções

* barrar o endpoint da Action sem depender do roteamento ([c7e0eeb](https://github.com/roneyrogerio/curriculum/commit/c7e0eebd76b9b6a6fb7e8c222ea80bb4647a3d98))

## [0.3.2](https://github.com/roneyrogerio/curriculum/compare/v0.3.1...v0.3.2) (2026-09-19)


### Correções

* confiar no protocolo encaminhado pelo Cloudflare ([e2c37a4](https://github.com/roneyrogerio/curriculum/commit/e2c37a47bfff33d882531184f5fc5e02b053469d))
* fechar o endpoint próprio da Action, que ninguém chama ([52dabc9](https://github.com/roneyrogerio/curriculum/commit/52dabc913570e0d3427217204a264a26ac43e1a6))

## [0.3.1](https://github.com/roneyrogerio/curriculum/compare/v0.3.0...v0.3.1) (2026-09-19)


### Correções

* declarar o usuário do container por UID numérico ([32debc2](https://github.com/roneyrogerio/curriculum/commit/32debc2d6a72c2c63cdf7a177969aaff2352bec5))

## [0.3.0](https://github.com/roneyrogerio/curriculum/compare/v0.2.0...v0.3.0) (2026-09-19)


### Funcionalidades

* acrescentar o freela, os projetos do GitHub e as credenciais ([7402292](https://github.com/roneyrogerio/curriculum/commit/7402292209068a7d8aa68f3886756cf7e30f7fbd))
* adaptar o currículo a uma vaga com um modelo de linguagem ([a9f08af](https://github.com/roneyrogerio/curriculum/commit/a9f08af4de4a1fa1f5ca835dfd6adebe7c13def9))


### Correções

* respeitar a margem do papel e ler o apóstrofo do DOCX ([94f8f76](https://github.com/roneyrogerio/curriculum/commit/94f8f76059513e32595b7300c3074b3ec71fdb4c))


### Documentação

* reescrever o README para o que o projeto é hoje ([997ce3f](https://github.com/roneyrogerio/curriculum/commit/997ce3f19a4979819edcca652ec1141d9f360ea4))


### Build e deploy

* servir o site por Node, com a política de headers em código ([588531c](https://github.com/roneyrogerio/curriculum/commit/588531ce9d65d548f950d38578bcee1e7b53ddb0))


### Integração contínua

* injetar a chave da OpenAI no cluster por Secret ([1349ff5](https://github.com/roneyrogerio/curriculum/commit/1349ff57232eccf3ba9ef71ae8ad32ee8db6c0ff))

## [0.2.0](https://github.com/roneyrogerio/curriculum/compare/v0.1.0...v0.2.0) (2026-09-19)


### Funcionalidades

* gerar PDF, DOCX e a imagem OG no build ([e91bc2f](https://github.com/roneyrogerio/curriculum/commit/e91bc2fb25ba9aa20c339de7e41e7f390de88023))
* initial curriculum vitae with automated Kubernetes deployment ([97e2588](https://github.com/roneyrogerio/curriculum/commit/97e258804da501bf7721634b3d8a622da520be68))
* reescrever o currículo como dados tipados com adaptação por vaga ([866942c](https://github.com/roneyrogerio/curriculum/commit/866942cf46e4216864ae6466ab44f80b44ddc4e7))


### Refatoração

* **curriculum:** remove print borders/radius from project blocks and add repository links to highlighted projects (pt-br/en-us) ([fc17a8d](https://github.com/roneyrogerio/curriculum/commit/fc17a8d4f98b572d17e059e2cf77379d63326eb9))
* **curriculum:** sync pt-br and en-us CV content with latest profile updates ([e7ade30](https://github.com/roneyrogerio/curriculum/commit/e7ade308a9a54920d150af180b165746b0b843f0))
* **curriculum:** unify structure, update palette, and improve layout ([36bb340](https://github.com/roneyrogerio/curriculum/commit/36bb340cf030efa6c231641c873df8e68969f78f))


### Documentação

* reescrever o README para o que o projeto virou ([e2992ec](https://github.com/roneyrogerio/curriculum/commit/e2992ec3e2a926de6d7fc4041b7587c6d2aaa36b))


### Build e deploy

* rodar em Node 24 e servir por NGINX endurecido ([6a2c1fc](https://github.com/roneyrogerio/curriculum/commit/6a2c1fcb76f2a79dae5f38f4fa62a9b47607c754))


### Integração contínua

* automatizar versão e changelog com release-please ([99d757f](https://github.com/roneyrogerio/curriculum/commit/99d757ff5e61ad9a3754bbbe79e019fc4560e892))
* manter o fluxo contínuo sem aprovação manual a cada release ([82ff39e](https://github.com/roneyrogerio/curriculum/commit/82ff39e661a3244fc5437c8ec8671f15dd75752b))
* publicar só no release, em vez de a cada push ([ad3cea2](https://github.com/roneyrogerio/curriculum/commit/ad3cea2a4c8bcc9c0aeb79cd05922520bb6ab499))
* travar o deploy nas verificações e fixar as actions por SHA ([1555ccf](https://github.com/roneyrogerio/curriculum/commit/1555ccffe8bb3f15a3f94d7bc6a9ce2bac882936))
