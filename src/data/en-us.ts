import { contact } from "./site";
import type { CV } from "./types";

export const enUs: CV = {
  locale: "en-us",
  lang: "en-US",
  hreflang: "en-US",
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
  seoTitle: "Roney de Oliveira — Backend, Frontend and DevOps Software Engineer",
  seoDescription:
    "Resume of Roney de Oliveira, a Software Engineer with 8 years of experience in Go, Node.js, React, microservices, AWS, GCP, Oracle Cloud, Kubernetes and Knative. Open to remote roles.",
  summary: [
    "Software engineer with hands-on experience building web applications, APIs and production microservices end to end, across backend, frontend and DevOps.",
    "Works mainly with Go, PostgreSQL, Node.js and React, plus cloud platforms (AWS, GCP and Oracle Cloud), containers and service-oriented architecture.",
    "Focused on simple, scalable and maintainable code, with a continuous interest in performance, concurrency and distributed systems."
  ],
  contact: { ...contact, location: "Apucarana, Parana, Brazil" },
  skillGroups: [
    {
      title: "Languages and frameworks",
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
        { name: "HTML and CSS", level: 4 },
        { name: "Astro", level: 4 },
        { name: "Vite", level: 4 },
        { name: "Three.js", level: 3 },
        { name: "Responsive interfaces", level: 4 }
      ]
    },
    {
      title: "Backend and architecture",
      skills: [
        { name: "Microservices", level: 5 },
        { name: "REST APIs", level: 5 },
        { name: "GraphQL", level: 3 },
        { name: "Webhooks", level: 4 },
        { name: "Server-Sent Events", alias: ["SSE"], level: 4 },
        { name: "Real-time video", alias: ["Cloudflare RealtimeKit", "Streaming"], level: 3 },
        { name: "Idempotency", level: 4 },
        { name: "Gin", level: 4 },
        { name: "Service-oriented architecture", alias: ["SOA"], level: 4 },
        { name: "API versioning", alias: ["Contract versioning"], level: 4 },
        { name: "Automated testing", level: 4 },
        { name: "Secure development", alias: ["Security"], level: 4 },
        { name: "Code review", level: 4 },
        { name: "AI-assisted development", level: 4 },
        { name: "Asynchronous messaging", alias: ["Message queues"], level: 4 },
        { name: "Resilience", alias: ["Fault tolerance"], level: 4 },
        { name: "Scalability", level: 5 },
        { name: "Performance optimization", alias: ["Performance"], level: 4 }
      ]
    },
    {
      title: "Cloud and operations",
      skills: [
        { name: "AWS Lambda", alias: ["Serverless"], level: 5 },
        { name: "Amazon S3", level: 4 },
        { name: "Amazon RDS", level: 4 },
        { name: "AWS CloudFormation", level: 4 },
        { name: "AWS API Gateway", level: 3 },
        { name: "AWS Rekognition", level: 3 },
        { name: "Google Cloud Platform", alias: ["GCP"], level: 4 },
        { name: "Cloud Run", level: 4 },
        { name: "Cloudflare R2", alias: ["Object storage"], level: 3 },
        { name: "BigQuery", level: 3 },
        { name: "Pub/Sub", level: 3 },
        { name: "Vertex AI", level: 3 },
        { name: "Oracle Cloud Infrastructure", alias: ["OCI", "Oracle Cloud"], level: 3 },
        { name: "Oracle Kubernetes Engine", alias: ["OKE"], level: 4 },
        { name: "Observability", alias: ["Monitoring"], level: 4 },
        { name: "OpenTelemetry", alias: ["Distributed tracing", "Tracing"], level: 3 },
        { name: "Production troubleshooting", level: 5 },
        { name: "DevOps", level: 5 }
      ]
    },
    {
      title: "Data and platform",
      skills: [
        { name: "PostgreSQL", alias: ["Relational databases"], level: 4 },
        { name: "MongoDB", level: 3 },
        { name: "SQLite", level: 3 },
        { name: "Prisma", level: 3 },
        { name: "Data modeling", level: 4 },
        { name: "Query optimization", level: 4 },
        { name: "Linux", level: 5 },
        { name: "Self-hosted LLM inference", alias: ["Local LLM"], level: 3 },
        { name: "Llama", alias: ["Ollama"], level: 3 },
        { name: "OpenAI API", alias: ["LLM"], level: 4 },
        { name: "Structured Outputs with JSON Schema", alias: ["JSON Schema"], level: 4 },
        { name: "Prompt engineering", level: 4 },
        { name: "Service networking", level: 4 },
        { name: "Docker", level: 5 },
        { name: "Kubernetes", alias: ["K8s"], level: 4 },
        { name: "Knative", level: 4 },
        { name: "CI/CD with GitHub Actions", alias: ["Continuous integration", "Continuous delivery"], level: 4 },
        { name: "Terraform", alias: ["Infrastructure as Code", "IaC"], level: 4 },
        { name: "Git, GitLab, Jira and Bash", level: 4 }
      ]
    }
  ],
  positions: [
    {
      title: "Full Stack Developer",
      company: "Proaba",
      companyUrl: "https://proaba.com.br",
      employment: "Freelance",
      start: "Aug 2026",
      end: "Sep 2026",
      startDate: "2026-08-19",
      endDate: "2026-09-17",
      location: "Remote",
      highlights: [
        "Live session broadcast and recording with Cloudflare RealtimeKit on a children's clinic platform: room creation, per-participant tokens, preset provisioning and teardown, all server-side.",
        "Recording written straight to Cloudflare R2, with automatic transcription and playback inside the session screen itself.",
        "Provider webhooks handled idempotently: overlapping events stopped creating two media records for one recording, and the retry the API itself asked for by answering 500 stopped being discarded as a duplicate.",
        "SSE stream released while the tab is hidden and closed in `try/finally`, so an open session does not hold a slot at the provider.",
        "Access control requiring the child relationship to reach a recording, per-recording enablement, and listing by the viewer's timezone rather than the server's.",
        "Privacy by design: no patient name reaches the provider — the room is identified by the session id.",
        "End-to-end tests in Playwright, and provider secrets mapped per environment in the deploy."
      ]
    },
    {
      title: "Senior Software Engineer",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Full-time",
      start: "Jul 2024",
      end: "May 2026",
      startDate: "2024-07-01",
      endDate: "2026-05-31",
      location: "Remote",
      highlights: [
        "Worked end to end across the engineering lifecycle, building and operating backend solutions on AWS and GCP.",
        "Applied DevOps and agile practices to deliver stable, efficient and high-value releases.",
        "Drove continuous evolution of a microservices platform with a focus on operational reliability."
      ]
    },
    {
      title: "Mid-Level Software Engineer",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Full-time",
      start: "Jan 2022",
      end: "Jul 2024",
      startDate: "2022-01-01",
      endDate: "2024-07-31",
      location: "Remote",
      highlights: [
        "Implemented features with autonomy and strong system ownership.",
        "Handled bug fixes and evolutionary maintenance in production environments.",
        "Built backend services with Node.js and PostgreSQL supporting continuous product delivery."
      ]
    },
    {
      title: "Junior Software Engineer",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Full-time",
      start: "Jul 2021",
      end: "Jan 2022",
      startDate: "2021-07-01",
      endDate: "2022-01-31",
      location: "Remote",
      highlights: [
        "Developed new features and fixed software defects.",
        "Supported delivery cycles with a focus on quality and product stability."
      ]
    },
    {
      title: "Helpdesk Analyst",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Self-employed",
      start: "Mar 2021",
      end: "Jul 2021",
      startDate: "2021-03-01",
      endDate: "2021-07-31",
      location: "Remote",
      highlights: [
        "Supported students during online exam operations.",
        "Helped ensure service continuity and operational quality."
      ]
    },
    {
      title: "Full Stack Developer",
      company: "Early Denver",
      employment: "Full-time",
      start: "Dec 2018",
      end: "Dec 2019",
      startDate: "2018-12-01",
      endDate: "2019-12-31",
      location: "Brasilia, DF, Brazil (Remote)",
      highlights: [
        "Worked on full stack web feature development.",
        "Used Node.js, React.js and PostgreSQL in product delivery workflows.",
        "Collaborated remotely with the team to continuously evolve the application."
      ]
    },
    {
      title: "Junior Software Developer",
      company: "StutzLab",
      employment: "Full-time",
      start: "Jan 2018",
      end: "Nov 2018",
      startDate: "2018-01-01",
      endDate: "2018-11-30",
      location: "Sao Paulo, SP, Brazil (Remote)",
      highlights: [
        "Developed software features for web applications.",
        "Worked with PHP, JavaScript, MySQL, HTML and CSS to implement UI flows and business rules.",
        "Used Bootstrap to standardize interface components and speed up frontend delivery."
      ]
    },
    {
      title: "Web Developer",
      company: "Independent projects",
      employment: "Self-employed",
      start: "Nov 2010",
      end: "Dec 2017",
      startDate: "2010-11-01",
      endDate: "2017-12-31",
      location: "Remote",
      highlights: [
        "Built independent projects with HTML, CSS, PHP, MySQL and Nginx.",
        "Monetized digital products and content through Google AdSense."
      ]
    }
  ],
  projects: [
    {
      name: "Soltar Pipa — soltarpipa.online",
      context: "Personal project · real-time multiplayer",
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
        "Authoritative Go server: all flight physics and line-versus-line duelling run server-side, with the browser only rendering and sending inputs, which removes the client-side cheating surface.",
        "Custom binary WebSocket protocol, little endian, with a reference frame written by Go and decoded by the TypeScript client test: changing one side without the other breaks the build.",
        "Interest management that treats each player as a line segment, hand to kite, on a 48 m spatial grid with a 120 m radius and hysteresis — 12 µs per player, zero allocation.",
        "Profile-guided optimization: a sorted sweep replacing all-pairs comparison (28 ms to ~1 ms per tick) and quickselect replacing sorting in per-send kite selection (16% to 2.4% of tick CPU).",
        "Purpose-built load test with 5,000 concurrent WebSockets, no connection failures or drops; production runs the room at 140 flyers and 15 frames per second, a limit set by the 10 Mbps load balancer rather than by CPU.",
        "Runs on Knative over Kubernetes with two services and two domains, images on GHCR and automated versioning through release-please."
      ]
    },
    {
      name: "Bilingual resume — roneyrogerio.dev",
      context: "Personal project",
      repository: "https://github.com/roneyrogerio/curriculum",
      url: "https://roneyrogerio.dev",
      stack: [
        "Astro",
        "TypeScript",
        "Node.js 24",
        "Docker",
        "GitHub Actions",
        "OpenAI API",
        "Kubernetes",
        "Knative"
      ],
      highlights: [
        "Résumé tailoring to a job posting with an LLM (OpenAI API with Structured Outputs): the model receives identified facts and returns only selection, order and wording; employer, dates and links come from the source.",
        "Automatic verification of every rewritten sentence against its source, rejecting any technology or number the fact does not state.",
        "Bilingual static site with a reading version and an A4 print version, plus PDF and DOCX exporters validated against an ATS parsing simulator.",
        "Automated deployment through GitHub Actions on every release, with versioning and changelog by release-please and a multi-architecture image (`linux/amd64` and `linux/arm64`) published to GitHub Container Registry.",
        "Runs as a Knative Service on Kubernetes (Oracle Kubernetes Engine), with a dedicated namespace and custom domain mapping."
      ]
    },
    {
      name: "Receitex — receitex.com.br",
      context: "Personal project · unmaintained, still online",
      url: "https://receitex.com.br",
      stack: ["WordPress", "PHP", "React", "OpenAI API", "MySQL", "Docker", "Kubernetes", "Knative"],
      highlights: [
        "Recipe site with a plugin of its own, CulinAI: a React panel inside the WordPress admin that generates a whole recipe — title, ingredients with fractions, method, categories and tags — and publishes it as a post.",
        "Text and dish photo generated by AI, with the image uploaded to the media library through the plugin's own REST routes.",
        "Packaged into a container from the official WordPress image, running as a Knative Service on Kubernetes, with MySQL, its own domain and TLS.",
        "No longer maintained, and online on purpose: it is the record of a whole site written by AI back when that was new. The images are from the first generation of those models — recognisable as the right dish, and visibly short of what is produced today."
      ]
    },
    {
      name: "minishell",
      context: "42 Sao Paulo · C",
      repository: "https://github.com/roneyrogerio/minishell",
      stack: ["C", "POSIX system calls"],
      highlights: [
        "Linux shell implemented in C using system calls only, without lexer libraries.",
        "Support for multiple commands, single and double quotes, character escaping, pipelines and redirections (`<`, `>` and `>>`).",
        "Built-ins (`echo`, `cd`, `pwd`, `export`, `unset`, `env`, `exit`), signals (`ctrl-C`, `ctrl-D`, `ctrl-\\`) and environment variables."
      ]
    },
    {
      name: "Pipefy Client Management API",
      context: "Personal project · 2026",
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
        "REST API in Go with Gin and SQLite persistence, for client records and invested-assets processing.",
        "GraphQL integration with Pipefy and webhook intake with idempotency control: the same event delivered twice is not processed twice.",
        "Distributed tracing with OpenTelemetry and Jaeger, and a complete local environment in Docker Compose — GraphQL mock, collector and hot-reloading API — brought up with one command.",
        "The same router serves local HTTP and AWS Lambda through API Gateway proxy integration, with automated tests over the routes."
      ]
    },
    {
      name: "cub3D and raycast-engine",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/cub3D",
      stack: ["C", "Raycasting", "Makefile"],
      highlights: [
        "Pseudo-3D game demo drawn by raycasting in C, with the engine extracted into its own library and the game consuming only its interface.",
        "The library exposes camera, minimap, window size and movement update, and draws the scene through a function pointer supplied by the caller."
      ]
    },
    {
      name: "libbmp",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libbmp",
      stack: ["C"],
      highlights: [
        "Pure C library to read, create, edit pixel by pixel and write BMP images at 24 and 32 bits per pixel.",
        "Works directly on the file format and little-endian byte order, with no external dependency."
      ]
    },
    {
      name: "ft_server",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_server",
      stack: ["Docker", "NGINX", "PHP", "MySQL", "WordPress"],
      highlights: [
        "A single Docker image serving NGINX, PHP, MySQL, WordPress and phpMyAdmin, configured from scratch."
      ]
    },
    {
      name: "ft_services",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_services",
      stack: ["System administration", "Networking", "Containers"],
      highlights: [
        "System administration and networking project: provisioning and orchestration of services in containers."
      ]
    },
    {
      name: "libasm",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libasm",
      stack: ["Assembly", "C"],
      highlights: [
        "C standard library functions rewritten in Assembly, keeping the original calling conventions and error returns."
      ]
    },
    {
      name: "libft",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libft",
      stack: ["C"],
      highlights: [
        "Reimplementation of the C standard library functions — memory, strings, conversions and file-descriptor output — written from scratch to learn what each one costs.",
        "Includes a linked list of its own, with creation, insertion at both ends, iteration, mapping and release."
      ]
    },
    {
      name: "ft_printf",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_printf",
      stack: ["C", "Variadic functions"],
      highlights: [
        "Reimplementation of printf in C, with a variable number of arguments and dispatch by format specifier, built on the libft above."
      ]
    },
    {
      name: "get_next_line",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/get_next_line",
      stack: ["C", "POSIX system calls"],
      highlights: [
        "A function that reads a file line by line from a descriptor using only `read`, `malloc` and `free`, with the buffer size fixed at compile time.",
        "The second version fixed the leak the first one left when a file was not read to the end — the pending state stayed allocated with no owner."
      ]
    },
    {
      name: "C++ modules",
      context: "42 São Paulo · 2021",
      repository: "https://github.com/roneyrogerio/cpp_module_00",
      stack: ["C++"],
      highlights: [
        "The first 42 C++ modules: reading command-line arguments, and an in-memory phone book with ADD, SEARCH and EXIT commands.",
        "The next module gathers five more exercises, in cpp_module_01."
      ]
    }
  ],
  education: [
    {
      institution: "UNOPAR — Universidade Norte do Parana",
      degree: "Technology degree in Systems Analysis and Development",
      period: "Jan 2022 — Dec 2023",
      note: "Final grade 9.5/10",
      url: "/certificados/diploma.png"
    },
    {
      institution: "42 Sao Paulo",
      degree: "Technical education in Software Engineering",
      period: "2020 — 2021"
    }
  ],
  certifications: [
    {
      name: "Next.js App Router Fundamentals",
      issuer: "Vercel",
      issued: "Aug 2026",
      credentialId: "dashboard-app",
      url: "https://nextjs.org/learn/certificate?course=dashboard-app&user=169196&certId=dashboard-app-169196-1786987870264"
    },
    {
      name: "React Foundations for Next.js",
      issuer: "Vercel",
      issued: "Aug 2026",
      credentialId: "react-foundations",
      url: "https://nextjs.org/learn/certificate?course=react-foundations&user=169196&certId=react-foundations-169196-1785884720767"
    },
    {
      name: "Programming with Google Go Specialization",
      issuer: "University of California, Irvine",
      issued: "May 2026",
      credentialId: "2UUQCPO9MST7",
      url: "https://www.coursera.org/account/accomplishments/specialization/2UUQCPO9MST7"
    },
    {
      name: "Concurrency in Go",
      issuer: "University of California, Irvine",
      issued: "May 2026",
      credentialId: "M2EKXK59LHYI",
      url: "https://www.coursera.org/account/accomplishments/certificate/M2EKXK59LHYI"
    },
    {
      name: "Functions, Methods, and Interfaces in Go",
      issuer: "University of California, Irvine",
      issued: "May 2026",
      credentialId: "WIEGNHPO8TBM",
      url: "https://www.coursera.org/account/accomplishments/certificate/WIEGNHPO8TBM"
    },
    {
      name: "Getting Started with Go",
      issuer: "University of California, Irvine",
      issued: "May 2026",
      credentialId: "KFGD3IF75I0Q",
      url: "https://www.coursera.org/account/accomplishments/certificate/KFGD3IF75I0Q"
    }
  ],
  courses: [
    {
      name: "Introduction to the Python Language",
      issuer: "Unopar",
      workload: "15 h",
      period: "first half of 2023",
      url: "/certificados/introducao-a-linguagem-python.pdf"
    },
    {
      name: "Introduction to Data Analysis with Python",
      issuer: "Unopar",
      workload: "15 h",
      period: "first half of 2023",
      url: "/certificados/introducao-a-analise-de-dados-com-python.pdf"
    },
    {
      name: "Data Structures in Python",
      issuer: "Unopar",
      workload: "10 h",
      period: "first half of 2023",
      url: "/certificados/estruturas-de-dados-em-python.pdf"
    },
    {
      name: "Information Technologies Applied to Law",
      issuer: "Unopar",
      workload: "60 h",
      period: "second half of 2023",
      url: "/certificados/tecnologias-de-informacao-aplicadas-ao-direito.pdf"
    },
    {
      name: "Electronic Law",
      issuer: "Unopar",
      workload: "60 h",
      period: "second half of 2023",
      url: "/certificados/direito-eletronico.pdf"
    },
    {
      name: "Management Models",
      issuer: "Unopar",
      workload: "60 h",
      period: "second half of 2023",
      url: "/certificados/modelos-de-gestao.pdf"
    }
  ],
  languages: [
    { name: "Portuguese", level: "Native" },
    { name: "English", level: "Basic (A2)" }
  ],
  keywords: [
    "Software Engineer",
    "Backend Engineer",
    "Back-end Developer",
    "Backend Developer",
    "Frontend Engineer",
    "Front-end Developer",
    "Full Stack Engineer",
    "Full Stack Developer",
    "Go Developer",
    "Golang Developer",
    "Distributed systems",
    "Real-time systems",
    "WebSocket",
    "SQL",
    "NoSQL",
    "Amazon Web Services",
    "High availability",
    "Reliability",
    "Agile",
    "Scrum"
  ],
  labels: {
    summary: "Professional summary",
    skills: "Technical skills",
    experience: "Professional experience",
    projects: "Projects",
    education: "Education",
    certifications: "Certifications",
    certificate: "certificate",
    diploma: "diploma",
    courses: "Additional courses",
    languages: "Languages",
    links: "Contact",
    keywords: "Additional skills",
    targetRole: "Target role",
    print: "Print version",
    printAction: "Print or save as PDF",
    tailor: "Tailor to a job",
    backToSite: "Back to resume",
    repository: "Repository",
    liveSite: "Live at",
    present: "present",
    languageSwitch: "Language selector",
    skillLevel: "Level",
    printHint: "Single-column A4 layout, optimized for ATS parsing.",
    themeLabel: "Theme",
    themeAuto: "System",
    themeLight: "Light",
    themeDark: "Dark",
  }
};
