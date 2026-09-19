import { contact } from "./site";
import type { CV } from "./types";

export const ptBr: CV = {
  locale: "pt-br",
  lang: "pt-BR",
  hreflang: "pt-BR",
  name: "Roney de Oliveira",
  role: "Software Engineer",
  disciplines: [
    {
      name: "Backend",
      evidence: ["Go", "Microsserviços", "APIs REST", "PostgreSQL", "Arquitetura orientada a serviços", "Mensageria assíncrona", "Escalabilidade", "Gin"]
    },
    { name: "Frontend", evidence: ["React", "HTML e CSS", "TypeScript", "Astro", "Vite", "Three.js"] },
    { name: "Full Stack", evidence: ["Node.js", "React", "PostgreSQL", "APIs REST"] },
    {
      name: "DevOps",
      evidence: ["Kubernetes", "Docker", "Terraform", "CI/CD com GitHub Actions", "Observabilidade", "Linux", "Knative"]
    }
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
    "Currículo de Roney de Oliveira, Software Engineer com 8 anos de experiência em Go, Node.js, React, microsserviços, AWS, GCP, Kubernetes e Knative. Disponível para vagas remotas.",
  summary: [
    "Engenheiro de software com experiência em aplicações web, APIs e microsserviços em produção, atuando de ponta a ponta entre backend, frontend e práticas DevOps.",
    "Trabalho principalmente com Go, PostgreSQL, Node.js e React, além de cloud (AWS e GCP), containers e arquitetura orientada a serviços.",
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
        { name: "C", level: 3 },
        { name: "C++", level: 3 }
      ]
    },
    {
      title: "Frontend",
      skills: [
        { name: "React", level: 4 },
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
        { name: "AWS Rekognition", level: 3 },
        { name: "Google Cloud Platform", alias: ["GCP"], level: 4 },
        { name: "Cloud Run", level: 4 },
        { name: "BigQuery", level: 3 },
        { name: "Pub/Sub", level: 3 },
        { name: "Vertex AI", level: 3 },
        { name: "Observabilidade", alias: ["Monitoramento"], level: 4 },
        { name: "Troubleshooting de produção", level: 5 },
        { name: "DevOps", level: 5 }
      ]
    },
    {
      title: "Dados e plataforma",
      skills: [
        { name: "PostgreSQL", alias: ["Bancos de dados relacionais"], level: 4 },
        { name: "MongoDB", level: 3 },
        { name: "Prisma", level: 3 },
        { name: "Modelagem de dados", level: 4 },
        { name: "Otimização de consultas", level: 4 },
        { name: "Linux", level: 5 },
        { name: "Execução local de LLMs", alias: ["Self-hosted LLM", "Inferência local"], level: 3 },
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
      title: "Engenheiro de Software Sênior",
      company: "e-didatico",
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
        "Teste de carga próprio com 5.000 WebSockets simultâneos, sem falha de conexão nem expulsão; capacidade de produção definida em 2.000 jogadores por sala a partir do p99 medido do tick.",
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
        "NGINX",
        "GitHub Actions",
        "Kubernetes",
        "Knative"
      ],
      highlights: [
        "Site estático bilíngue com versão de leitura e versão de impressão A4, mais exportadores de PDF e DOCX validados contra um simulador de parsing de ATS.",
        "Deploy automatizado por GitHub Actions em pushes para `main`, com imagem multi-arquitetura (`linux/amd64` e `linux/arm64`) no GitHub Container Registry, servida por NGINX unprivileged em container multi-stage.",
        "Execução como Knative Service sobre Kubernetes (Oracle Kubernetes Engine), com namespace dedicado e domínio customizado."
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
    }
  ],
  otherProjects:
    "Outros projetos na 42 São Paulo: cub3D e raycast-engine (engine pseudo-3D com raycasting em C), ft_services (administração de sistemas e redes), libasm (Assembly), ft_server (Docker), get_next_line, ft_printf e libft.",
  education: [
    {
      institution: "UNOPAR — Universidade Norte do Paraná",
      degree: "CST em Análise e Desenvolvimento de Sistemas",
      period: "jan/2022 — dez/2023",
      note: "Nota final 9,5"
    },
    {
      institution: "42 São Paulo",
      degree: "Ensino técnico em Engenharia de Software",
      period: "2020 — 2021"
    }
  ],
  certifications: [
    {
      name: "Programming with Google Go Specialization",
      issuer: "University of California, Irvine",
      issued: "mai/2026",
      credentialId: "2UUQCPO9MST7"
    },
    {
      name: "Concurrency in Go",
      issuer: "University of California, Irvine",
      issued: "mai/2026",
      credentialId: "M2EKXK59LHYI"
    },
    {
      name: "Functions, Methods, and Interfaces in Go",
      issuer: "University of California, Irvine",
      issued: "mai/2026",
      credentialId: "WIEGNHPO8TBM"
    },
    {
      name: "Getting Started with Go",
      issuer: "University of California, Irvine",
      issued: "mai/2026",
      credentialId: "KFGD3IF75I0Q"
    }
  ],
  courses: [
    { name: "Estruturas de Dados em Python", workload: "10h · 2023" },
    { name: "Introdução à Análise de Dados com Python", workload: "15h · 2023" },
    { name: "Introdução à Linguagem Python", workload: "15h · 2023" },
    { name: "Modelos de Gestão", workload: "60h · 2023" },
    { name: "Direito Eletrônico", workload: "60h · 2023" },
    { name: "Tecnologias de Informação Aplicadas ao Direito", workload: "60h · 2023" }
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
    "Tempo real",
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
    courses: "Cursos complementares",
    languages: "Idiomas",
    links: "Contato",
    keywords: "Competências adicionais",
    targetRole: "Cargo-alvo",
    print: "Versão para impressão",
    printAction: "Imprimir ou salvar em PDF",
    backToSite: "Voltar ao currículo",
    repository: "Repositório",
    liveSite: "Jogue em",
    present: "atual",
    languageSwitch: "Seletor de idioma",
    skillLevel: "Nível",
    printHint: "Layout A4 de coluna única, otimizado para leitura por ATS.",
    themeLabel: "Tema",
    themeAuto: "Automático",
    themeLight: "Claro",
    themeDark: "Escuro",
    tailorTitle: "Adaptar a uma vaga",
    tailorHint: "Cole a descrição da vaga. O currículo é reordenado para pôr na frente o que a vaga pede — nada é acrescentado.",
    tailorPlaceholder: "Cole aqui a descrição da vaga…",
    tailorApply: "Adaptar",
    tailorReset: "Voltar ao original",
    tailorCoverage: "Cobertura dos termos técnicos da vaga",
    tailorPromoted: "Trazido para a frente",
    tailorMissing: "A vaga pede e o currículo não diz",
    tailorMissingHint: "Nada disso foi adicionado, de propósito. Se for verdade, acrescente ao currículo; se não, deixe de fora.",
    tailorNone: "A vaga não pede nenhum termo técnico que falte no currículo.",
    tailorSwitched: "A vaga está em português, então esta é a versão em português.",
    tailorGuarantee: "Só reordena o que já está no currículo.",
    tailorTitleUse: "Usar o título da vaga como cargo-alvo",
    tailorTitleNote: "É a palavra-chave mais buscada num ATS. Dizer a que vaga você se candidata não afirma nenhuma habilidade — é o único texto do anúncio que entra no documento, e só se esta caixa estiver marcada.",
    tailorVerdict: "Régua: 80% ou mais é forte, 65% a 79% é médio, abaixo disso é fraco.",
    tailorDownloadPdf: "PDF adaptado",
    tailorDownloadDocx: "DOCX adaptado",
    tailorAdaptedBadge: "adaptado à vaga",
    tailorTitleField: "Título da vaga (opcional)",
    tailorTitlePlaceholder: "Ex.: Pessoa Desenvolvedora Backend Sênior (Go)",
    tailorOrder: "Nova ordem das competências"
  }
};
