import { contact } from "./site";
import type { CV } from "./types";

export const ptBr: CV = {
  locale: "pt-br",
  lang: "pt-BR",
  hreflang: "pt-BR",
  name: "Roney de Oliveira",
  role: "Software Engineer",
  gender: "masculine",
  disciplines: [
    { name: "Backend" },
    { name: "Frontend" },
    { name: "Full Stack" },
    { name: "DevOps" }
  ],
  technologies: [
    { name: "Go", alias: ["Golang"] },
    { name: "Node.js" },
    { name: "React" },
    { name: "TypeScript" },
    { name: "Kubernetes", alias: ["K8s"] }
  ],
  seoTitle: "Roney de Oliveira — Software Engineer Backend, Frontend e DevOps",
  seoDescription:
    "Currículo de Roney de Oliveira, Software Engineer com 8 anos de experiência em Go, Node.js, React, microsserviços, AWS, GCP, Oracle Cloud, Kubernetes e Knative. Disponível para vagas remotas.",
  summary: [
    "Engenheiro de software com experiência em aplicações web, APIs e microsserviços em produção, atuando de ponta a ponta entre backend, frontend e práticas DevOps.",
    "Trabalho principalmente com Go, PostgreSQL, Node.js e React, além de cloud (AWS, GCP e Oracle Cloud), containers e arquitetura orientada a serviços.",
    "Foco em código simples, escalável e de fácil manutenção, com interesse contínuo em performance, concorrência e sistemas distribuídos."
  ],
  contact,
  skillGroups: [
    {
      title: "Linguagens e frameworks",
      skills: [
        { name: "Go", alias: ["Golang"], level: 5 },
        { name: "TypeScript", level: 4 },
        { name: "JavaScript", level: 4 },
        { name: "Node.js", level: 4 },
        { name: "PHP", level: 4 },
        { name: "WordPress", level: 3 },
        { name: "C", level: 3 },
        { name: "C++", level: 3 }
      ]
    },
    {
      title: "Frontend",
      skills: [
        { name: "React", level: 4 },
        { name: "Next.js", alias: ["App Router"], level: 4 },
        { name: "HTML e CSS", level: 4 },
        { name: "Astro", level: 4 },
        { name: "Vite", level: 4 },
        { name: "Three.js", level: 3 },
        { name: "Interfaces responsivas", level: 4 }
      ]
    },
    {
      title: "Backend e arquitetura",
      skills: [
        { name: "Microsserviços", alias: ["Microservices"], level: 5 },
        { name: "APIs REST", alias: ["REST APIs"], level: 5 },
        { name: "GraphQL", level: 3 },
        { name: "Webhooks", level: 4 },
        { name: "Server-Sent Events", alias: ["SSE"], level: 4 },
        { name: "Vídeo em tempo real", alias: ["Cloudflare RealtimeKit", "Streaming"], level: 3 },
        { name: "Idempotência", alias: ["Idempotency"], level: 4 },
        { name: "Gin", level: 4 },
        { name: "Arquitetura orientada a serviços", alias: ["SOA"], level: 4 },
        { name: "Versionamento de APIs", alias: ["Versionamento de contratos"], level: 4 },
        { name: "Testes automatizados", level: 4 },
        { name: "Desenvolvimento seguro", alias: ["Segurança"], level: 4 },
        { name: "Revisão de código", alias: ["Code review"], level: 4 },
        { name: "Desenvolvimento assistido por IA", alias: ["AI-assisted development"], level: 4 },
        { name: "Mensageria assíncrona", alias: ["Comunicação assíncrona"], level: 4 },
        { name: "Resiliência", alias: ["Tolerância a falhas"], level: 4 },
        { name: "Escalabilidade", level: 5 },
        { name: "Otimização de desempenho", alias: ["Performance"], level: 4 }
      ]
    },
    {
      title: "Cloud e operações",
      skills: [
        { name: "AWS Lambda", alias: ["Serverless"], level: 5 },
        { name: "Amazon S3", level: 4 },
        { name: "Amazon RDS", level: 4 },
        { name: "AWS CloudFormation", level: 4 },
        { name: "AWS API Gateway", level: 3 },
        { name: "AWS Rekognition", level: 3 },
        { name: "Google Cloud Platform", alias: ["GCP"], level: 4 },
        { name: "Cloud Run", level: 4 },
        { name: "Cloudflare R2", alias: ["Armazenamento de objetos"], level: 3 },
        { name: "BigQuery", level: 3 },
        { name: "Pub/Sub", level: 3 },
        { name: "Vertex AI", level: 3 },
        { name: "Oracle Cloud Infrastructure", alias: ["OCI", "Oracle Cloud"], level: 3 },
        { name: "Oracle Kubernetes Engine", alias: ["OKE"], level: 4 },
        { name: "Observabilidade", alias: ["Monitoramento"], level: 4 },
        { name: "OpenTelemetry", alias: ["Rastreamento distribuído", "Tracing"], level: 3 },
        { name: "Troubleshooting de produção", level: 5 },
        { name: "DevOps", level: 5 }
      ]
    },
    {
      title: "Dados e plataforma",
      skills: [
        { name: "PostgreSQL", alias: ["Bancos de dados relacionais"], level: 4 },
        { name: "MongoDB", level: 3 },
        { name: "SQLite", level: 3 },
        { name: "Prisma", level: 3 },
        { name: "Modelagem de dados", level: 4 },
        { name: "Otimização de consultas", level: 4 },
        { name: "Linux", level: 5 },
        { name: "Execução local de LLMs", alias: ["Self-hosted LLM", "Inferência local"], level: 3 },
        { name: "Llama", alias: ["Ollama"], level: 3 },
        { name: "API da OpenAI", alias: ["OpenAI API", "LLM"], level: 4 },
        { name: "Saídas estruturadas com JSON Schema", alias: ["Structured Outputs"], level: 4 },
        { name: "Engenharia de prompt", alias: ["Prompt engineering"], level: 4 },
        { name: "Redes para serviços", level: 4 },
        { name: "Docker", level: 5 },
        { name: "Kubernetes", alias: ["K8s"], level: 4 },
        { name: "Knative", level: 4 },
        { name: "CI/CD com GitHub Actions", alias: ["Integração e entrega contínuas"], level: 4 },
        { name: "Terraform", alias: ["Infraestrutura como código", "IaC"], level: 4 },
        { name: "Git, GitLab, Jira e Bash", level: 4 }
      ]
    }
  ],
  positions: [
    {
      title: "Desenvolvedor Full Stack",
      company: "Proaba",
      companyUrl: "https://proaba.com.br",
      employment: "Freelance",
      start: "ago/2026",
      end: "set/2026",
      startDate: "2026-08-19",
      endDate: "2026-09-17",
      location: "Remoto",
      highlights: [
        "Transmissão ao vivo e gravação de sessões com Cloudflare RealtimeKit numa plataforma de clínica infantil: criação da sala, emissão de token por participante, provisionamento de presets e encerramento ao fim, tudo no servidor.",
        "Gravação escrita direto no Cloudflare R2, com transcrição automática e reprodução na própria tela da sessão.",
        "Webhooks do provedor tratados com idempotência: eventos sobrepostos deixaram de criar dois registros de mídia para a mesma gravação, e o reenvio que a própria API pediu ao responder 500 deixou de ser descartado como duplicata.",
        "Stream SSE solto enquanto a aba fica oculta e fechado em `try/finally`, para uma sessão aberta não reter vaga no provedor.",
        "Controle de acesso exigindo vínculo com a criança para alcançar uma gravação, liberação gravação a gravação, e listagem pelo fuso de quem olha em vez do fuso do servidor.",
        "Privacidade por desenho: nenhum nome de paciente é enviado ao provedor — a sala é identificada pelo id da sessão.",
        "Testes end-to-end em Playwright e segredos do provedor mapeados por ambiente no deploy."
      ]
    },
    {
      title: "Engenheiro de Software Sênior",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Tempo integral",
      start: "jul/2024",
      end: "mai/2026",
      startDate: "2024-07-01",
      endDate: "2026-05-31",
      location: "Remoto",
      highlights: [
        "Atuação de ponta a ponta no ciclo de engenharia, desenvolvendo e operando soluções backend em cloud (AWS e GCP).",
        "Aplicação de práticas DevOps e ágeis para garantir entregas eficientes, estáveis e de alto valor.",
        "Evolução contínua de plataforma em microsserviços, com foco em confiabilidade operacional."
      ]
    },
    {
      title: "Engenheiro de Software Pleno",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Tempo integral",
      start: "jan/2022",
      end: "jul/2024",
      startDate: "2022-01-01",
      endDate: "2024-07-31",
      location: "Remoto",
      highlights: [
        "Implementação de funcionalidades com autonomia e domínio do sistema.",
        "Correção de bugs e manutenção evolutiva em ambiente de produção.",
        "Desenvolvimento backend com Node.js e PostgreSQL, apoiando entregas contínuas do produto."
      ]
    },
    {
      title: "Engenheiro de Software Júnior",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Tempo integral",
      start: "jul/2021",
      end: "jan/2022",
      startDate: "2021-07-01",
      endDate: "2022-01-31",
      location: "Remoto",
      highlights: [
        "Desenvolvimento de funcionalidades e correção de bugs.",
        "Participação no ciclo de entrega com foco em qualidade e estabilidade do software."
      ]
    },
    {
      title: "Analista de Helpdesk",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Autônomo",
      start: "mar/2021",
      end: "jul/2021",
      startDate: "2021-03-01",
      endDate: "2021-07-31",
      location: "Remoto",
      highlights: [
        "Atendimento aos alunos durante a aplicação de provas online.",
        "Suporte operacional para garantir continuidade e qualidade do serviço."
      ]
    },
    {
      title: "Desenvolvedor Full Stack",
      company: "Early Denver",
      employment: "Tempo integral",
      start: "dez/2018",
      end: "dez/2019",
      startDate: "2018-12-01",
      endDate: "2019-12-31",
      location: "Brasília, DF, Brasil (Remoto)",
      highlights: [
        "Desenvolvimento full stack de funcionalidades web.",
        "Trabalho com Node.js, React.js e PostgreSQL no ciclo de entrega de produto.",
        "Colaboração remota com o time para evolução contínua da aplicação."
      ]
    },
    {
      title: "Desenvolvedor de Software Júnior",
      company: "StutzLab",
      employment: "Tempo integral",
      start: "jan/2018",
      end: "nov/2018",
      startDate: "2018-01-01",
      endDate: "2018-11-30",
      location: "São Paulo, SP, Brasil (Remoto)",
      highlights: [
        "Desenvolvimento de funcionalidades para aplicações web.",
        "Trabalho com PHP, JavaScript, MySQL, HTML e CSS na implementação de telas e regras de negócio.",
        "Uso de Bootstrap para padronização de interface e ganho de produtividade no frontend."
      ]
    },
    {
      title: "Desenvolvedor Web",
      company: "Projetos próprios",
      employment: "Autônomo",
      start: "nov/2010",
      end: "dez/2017",
      startDate: "2010-11-01",
      endDate: "2017-12-31",
      location: "Remoto",
      highlights: [
        "Desenvolvimento de projetos próprios com HTML, CSS, PHP, MySQL e Nginx.",
        "Monetização de produtos e conteúdo digital por meio do Google AdSense."
      ]
    }
  ],
  projects: [
    {
      name: "Soltar Pipa — soltarpipa.online",
      context: "Projeto pessoal · multijogador em tempo real",
      url: "https://soltarpipa.online",
      stack: [
        "Go",
        "TypeScript",
        "Three.js",
        "WebSocket",
        "Vite",
        "Docker",
        "Kubernetes",
        "Knative"
      ],
      highlights: [
        "Servidor autoritativo em Go: toda a física de voo e o duelo entre linhas rodam no servidor, e o navegador apenas desenha e envia os controles, o que remove a superfície de trapaça no cliente.",
        "Protocolo binário próprio sobre WebSocket, little endian, com frame de referência gravado pelo Go e decodificado pelo teste do cliente em TypeScript: mudar um lado sem o outro quebra a build.",
        "Área de interesse que trata cada jogador como um segmento de reta, da mão até a pipa, em grade espacial de 48 m com raio de 120 m e histerese — 12 µs por jogador, sem alocação.",
        "Otimização guiada por perfil: varredura ordenada no lugar da comparação de todos os pares (28 ms para ~1 ms por tick) e quickselect no lugar de ordenação na seleção de pipas por envio (16% para 2,4% da CPU do tick).",
        "Teste de carga próprio com 5.000 WebSockets simultâneos, sem falha de conexão nem expulsão; em produção a sala roda com 140 voadores a 15 quadros por segundo, limite definido pela banda do balanceador de 10 Mbps, e não pela CPU.",
        "Produção em Knative sobre Kubernetes, com dois serviços e dois domínios, imagens no GHCR e versionamento automatizado por release-please."
      ]
    },
    {
      name: "Currículo bilíngue — roneyrogerio.dev",
      context: "Projeto pessoal",
      repository: "https://github.com/roneyrogerio/curriculum",
      url: "https://roneyrogerio.dev",
      stack: [
        "Astro",
        "TypeScript",
        "Node.js 24",
        "Docker",
        "GitHub Actions",
        "API da OpenAI",
        "Kubernetes",
        "Knative"
      ],
      highlights: [
        "Adaptação do currículo a uma vaga por LLM (API da OpenAI com Structured Outputs): o modelo recebe fatos identificados e devolve só seleção, ordem e redação; empregador, datas e links vêm da fonte.",
        "Verificação automática de cada frase reescrita contra sua origem, recusando tecnologia ou número que o fato não afirme.",
        "Site estático bilíngue com versão de leitura e versão de impressão A4, mais exportadores de PDF e DOCX validados contra um simulador de parsing de ATS.",
        "Deploy automatizado por GitHub Actions a cada release, com versionamento e changelog por release-please e imagem multi-arquitetura (`linux/amd64` e `linux/arm64`) no GitHub Container Registry.",
        "Execução como Knative Service sobre Kubernetes (Oracle Kubernetes Engine), com namespace dedicado e domínio customizado."
      ]
    },
    {
      name: "Receitex — receitex.com.br",
      context: "Projeto pessoal · sem manutenção, ainda no ar",
      url: "https://receitex.com.br",
      stack: ["WordPress", "PHP", "React", "API da OpenAI", "MySQL", "Docker", "Kubernetes", "Knative"],
      highlights: [
        "Site de receitas com plugin próprio, o CulinAI: um painel em React dentro do admin do WordPress que gera a receita inteira — título, ingredientes com frações, modo de preparo, categorias e tags — e a publica como post.",
        "Texto e foto do prato gerados por IA, com a imagem enviada à biblioteca de mídia por rotas REST próprias do plugin.",
        "Empacotado em container a partir da imagem oficial do WordPress, rodando como Knative Service sobre Kubernetes, com MySQL, domínio próprio e TLS.",
        "Não é mais mantido, e segue no ar de propósito: é o registro de um site inteiro escrito por IA quando isso ainda era novidade. As imagens são da primeira geração dos modelos — reconhecíveis como o prato certo, e visivelmente aquém do que se produz hoje."
      ]
    },
    {
      name: "minishell",
      context: "42 São Paulo · C",
      repository: "https://github.com/roneyrogerio/minishell",
      stack: ["C", "Chamadas de sistema POSIX"],
      highlights: [
        "Terminal Linux implementado em C com chamadas de sistema, sem biblioteca de lexer.",
        "Suporte a múltiplos comandos, aspas simples e duplas, escape de caracteres, pipelines e redireções (`<`, `>` e `>>`).",
        "Built-ins (`echo`, `cd`, `pwd`, `export`, `unset`, `env`, `exit`), sinais (`ctrl-C`, `ctrl-D`, `ctrl-\\`) e variáveis de ambiente."
      ]
    },
    {
      name: "Pipefy Client Management API",
      context: "Projeto pessoal · 2026",
      repository: "https://github.com/roneyrogerio/pipefy-client-management-api",
      stack: [
        "Go",
        "Gin",
        "SQLite",
        "GraphQL",
        "OpenTelemetry",
        "Jaeger",
        "Docker Compose",
        "AWS Lambda",
        "API Gateway"
      ],
      highlights: [
        "API REST em Go com Gin e persistência em SQLite, para cadastro de clientes e processamento de patrimônio investido.",
        "Integração GraphQL com o Pipefy e recebimento de webhooks com controle de idempotência: o mesmo evento entregue duas vezes não é processado duas vezes.",
        "Rastreamento distribuído com OpenTelemetry e Jaeger, e ambiente local completo em Docker Compose — mock GraphQL, coletor e API com recarga automática — subindo com um comando.",
        "O mesmo roteador serve HTTP local e AWS Lambda por proxy integration do API Gateway, com testes automatizados cobrindo as rotas."
      ]
    },
    {
      name: "cub3D e raycast-engine",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/cub3D",
      stack: ["C", "Raycasting", "Makefile"],
      highlights: [
        "Jogo demo pseudo-3D desenhado por raycasting em C, com a engine extraída para biblioteca própria e o jogo consumindo apenas a interface dela.",
        "A biblioteca expõe câmera, minimapa, tamanho de janela e atualização de movimento, e desenha a cena por ponteiro de função passado pelo chamador."
      ]
    },
    {
      name: "libbmp",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libbmp",
      stack: ["C"],
      highlights: [
        "Biblioteca em C pura para ler, criar, alterar pixel a pixel e gravar imagens BMP de 24 e 32 bits por pixel.",
        "Trabalha direto sobre o formato do arquivo e a ordem de bytes little endian, sem dependência externa."
      ]
    },
    {
      name: "ft_server",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_server",
      stack: ["Docker", "NGINX", "PHP", "MySQL", "WordPress"],
      highlights: [
        "Imagem Docker única servindo NGINX, PHP, MySQL, WordPress e phpMyAdmin, configurados do zero."
      ]
    },
    {
      name: "ft_services",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_services",
      stack: ["Administração de sistemas", "Redes", "Containers"],
      highlights: [
        "Projeto de administração de sistemas e redes: provisionamento e orquestração de serviços em containers."
      ]
    },
    {
      name: "libasm",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libasm",
      stack: ["Assembly", "C"],
      highlights: [
        "Funções da biblioteca padrão C reescritas em Assembly, com as convenções de chamada e o retorno de erro do original."
      ]
    },
    {
      name: "libft",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libft",
      stack: ["C"],
      highlights: [
        "Reimplementação das funções da biblioteca padrão C — memória, strings, conversões e saída por descritor —, escritas do zero para entender o que cada uma custa.",
        "Inclui uma lista encadeada própria com criação, inserção nas duas pontas, iteração, mapeamento e liberação."
      ]
    },
    {
      name: "ft_printf",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_printf",
      stack: ["C", "Variadic functions"],
      highlights: [
        "Reimplementação do printf em C, com número variável de argumentos e despacho por especificador de formato, apoiada na libft própria."
      ]
    },
    {
      name: "get_next_line",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/get_next_line",
      stack: ["C", "Chamadas de sistema POSIX"],
      highlights: [
        "Função que lê um arquivo linha a linha a partir de um descritor, usando apenas `read`, `malloc` e `free`, com o buffer definido em tempo de compilação.",
        "A segunda versão corrigiu o vazamento que a primeira deixava quando o arquivo não era lido até o fim — o estado pendente ficava alocado sem dono."
      ]
    },
    {
      name: "Módulos de C++",
      context: "42 São Paulo · 2021",
      repository: "https://github.com/roneyrogerio/cpp_module_00",
      stack: ["C++"],
      highlights: [
        "Primeiros módulos de C++ da 42: leitura de argumentos da linha de comando e uma agenda em memória com os comandos ADD, SEARCH e EXIT.",
        "O módulo seguinte reúne mais cinco exercícios, em cpp_module_01."
      ]
    }
  ],
  education: [
    {
      institution: "UNOPAR — Universidade Norte do Paraná",
      degree: "CST em Análise e Desenvolvimento de Sistemas",
      period: "jan/2022 — dez/2023",
      note: "Nota final 9,5",
      url: "/certificados/diploma.png"
    },
    {
      institution: "42 São Paulo",
      degree: "Ensino técnico em Engenharia de Software",
      period: "2020 — 2021"
    }
  ],
  certifications: [
    {
      name: "Next.js App Router Fundamentals",
      issuer: "Vercel",
      issued: "ago/2026",
      credentialId: "dashboard-app",
      url: "https://nextjs.org/learn/certificate?course=dashboard-app&user=169196&certId=dashboard-app-169196-1786987870264"
    },
    {
      name: "React Foundations for Next.js",
      issuer: "Vercel",
      issued: "ago/2026",
      credentialId: "react-foundations",
      url: "https://nextjs.org/learn/certificate?course=react-foundations&user=169196&certId=react-foundations-169196-1785884720767"
    },
    {
      name: "Programming with Google Go Specialization",
      issuer: "University of California, Irvine",
      issued: "mai/2026",
      credentialId: "2UUQCPO9MST7",
      url: "https://www.coursera.org/account/accomplishments/specialization/2UUQCPO9MST7"
    },
    {
      name: "Concurrency in Go",
      issuer: "University of California, Irvine",
      issued: "mai/2026",
      credentialId: "M2EKXK59LHYI",
      url: "https://www.coursera.org/account/accomplishments/certificate/M2EKXK59LHYI"
    },
    {
      name: "Functions, Methods, and Interfaces in Go",
      issuer: "University of California, Irvine",
      issued: "mai/2026",
      credentialId: "WIEGNHPO8TBM",
      url: "https://www.coursera.org/account/accomplishments/certificate/WIEGNHPO8TBM"
    },
    {
      name: "Getting Started with Go",
      issuer: "University of California, Irvine",
      issued: "mai/2026",
      credentialId: "KFGD3IF75I0Q",
      url: "https://www.coursera.org/account/accomplishments/certificate/KFGD3IF75I0Q"
    }
  ],
  courses: [
    {
      name: "Introdução à Linguagem Python",
      issuer: "Unopar",
      workload: "15 h",
      period: "1º semestre de 2023",
      url: "/certificados/introducao-a-linguagem-python.pdf"
    },
    {
      name: "Introdução à Análise de Dados com Python",
      issuer: "Unopar",
      workload: "15 h",
      period: "1º semestre de 2023",
      url: "/certificados/introducao-a-analise-de-dados-com-python.pdf"
    },
    {
      name: "Estruturas de Dados em Python",
      issuer: "Unopar",
      workload: "10 h",
      period: "1º semestre de 2023",
      url: "/certificados/estruturas-de-dados-em-python.pdf"
    },
    {
      name: "Tecnologias de Informação Aplicadas ao Direito",
      issuer: "Unopar",
      workload: "60 h",
      period: "2º semestre de 2023",
      url: "/certificados/tecnologias-de-informacao-aplicadas-ao-direito.pdf"
    },
    {
      name: "Direito Eletrônico",
      issuer: "Unopar",
      workload: "60 h",
      period: "2º semestre de 2023",
      url: "/certificados/direito-eletronico.pdf"
    },
    {
      name: "Modelos de Gestão",
      issuer: "Unopar",
      workload: "60 h",
      period: "2º semestre de 2023",
      url: "/certificados/modelos-de-gestao.pdf"
    }
  ],
  languages: [
    { name: "Português", level: "Nativo" },
    { name: "Inglês", level: "Básico (A2)" }
  ],
  keywords: [
    "Engenheiro de Software",
    "Software Engineer",
    "Desenvolvedor Back-end",
    "Desenvolvedor Backend",
    "Backend Engineer",
    "Desenvolvedor Front-end",
    "Desenvolvedor Frontend",
    "Frontend Engineer",
    "Desenvolvedor Full Stack",
    "Full Stack Engineer",
    "Sistemas distribuídos",
    "WebSocket",
    "SQL",
    "NoSQL",
    "Amazon Web Services",
    "Alta disponibilidade",
    "Confiabilidade",
    "Metodologias ágeis",
    "Scrum"
  ],
  labels: {
    summary: "Resumo profissional",
    skills: "Competências técnicas",
    experience: "Experiência profissional",
    projects: "Projetos",
    education: "Formação acadêmica",
    certifications: "Certificações",
    certificate: "certificado",
    diploma: "diploma",
    courses: "Cursos complementares",
    languages: "Idiomas",
    links: "Contato",
    keywords: "Competências adicionais",
    targetRole: "Cargo-alvo",
    print: "Versão para impressão",
    printShort: "Imprimir",
    printAction: "Imprimir ou salvar em PDF",
    tailor: "Adaptar a uma vaga",
    backToSite: "Voltar ao currículo",
    repository: "Repositório",
    liveSite: "No ar em",
    present: "atual",
    languageSwitch: "Seletor de idioma",
    languageName: "PT-BR",
    languageLabel: "Português (Brasil)",
    gateNote: "Currículo completo em português do Brasil",
    gateSuggested: "sugerido",
    skipToContent: "Ir para o conteúdo",
    skillLevel: "Nível",
    printHint: "Layout A4 de coluna única, otimizado para leitura por ATS.",
    themeLabel: "Tema",
    themeLight: "Claro",
    themeDark: "Escuro",
  }
};
