import { contact } from "./site";
import type { CV } from "./types";

export const enUs: CV = {
  locale: "en-us",
  lang: "en-US",
  hreflang: "en-US",
  name: "Roney de Oliveira",
  role: "Software Engineer",
  disciplines: [
    {
      name: "Backend",
      evidence: ["Go", "Microservices", "REST APIs", "PostgreSQL", "Service-oriented architecture", "Asynchronous messaging", "Scalability", "Gin"]
    },
    { name: "Frontend", evidence: ["React", "HTML and CSS", "TypeScript", "Astro", "Vite", "Three.js"] },
    { name: "Full Stack", evidence: ["Node.js", "React", "PostgreSQL", "REST APIs"] },
    {
      name: "DevOps",
      evidence: ["Kubernetes", "Docker", "Terraform", "CI/CD with GitHub Actions", "Observability", "Linux", "Knative"]
    }
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
    "Resume of Roney de Oliveira, a Software Engineer with 8 years of experience in Go, Node.js, React, microservices, AWS, GCP, Kubernetes and Knative. Open to remote roles.",
  summary: [
    "Software engineer with hands-on experience building web applications, APIs and production microservices end to end, across backend, frontend and DevOps.",
    "Works mainly with Go, PostgreSQL, Node.js and React, plus cloud platforms (AWS and GCP), containers and service-oriented architecture.",
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
        { name: "C", level: 3 },
        { name: "C++", level: 3 }
      ]
    },
    {
      title: "Frontend",
      skills: [
        { name: "React", level: 4 },
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
        { name: "AWS Rekognition", level: 3 },
        { name: "Google Cloud Platform", alias: ["GCP"], level: 4 },
        { name: "Cloud Run", level: 4 },
        { name: "BigQuery", level: 3 },
        { name: "Pub/Sub", level: 3 },
        { name: "Vertex AI", level: 3 },
        { name: "Observability", alias: ["Monitoring"], level: 4 },
        { name: "Production troubleshooting", level: 5 },
        { name: "DevOps", level: 5 }
      ]
    },
    {
      title: "Data and platform",
      skills: [
        { name: "PostgreSQL", alias: ["Relational databases"], level: 4 },
        { name: "MongoDB", level: 3 },
        { name: "Prisma", level: 3 },
        { name: "Data modeling", level: 4 },
        { name: "Query optimization", level: 4 },
        { name: "Linux", level: 5 },
        { name: "Self-hosted LLM inference", alias: ["Local LLM"], level: 3 },
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
      title: "Senior Software Engineer",
      company: "e-didatico",
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
        "Purpose-built load test with 5,000 concurrent WebSockets, no connection failures or drops; production capacity set at 2,000 players per room from measured tick p99.",
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
        "NGINX",
        "GitHub Actions",
        "Kubernetes",
        "Knative"
      ],
      highlights: [
        "Bilingual static site with a reading version and an A4 print version, plus PDF and DOCX exporters validated against an ATS parsing simulator.",
        "Automated deployment through GitHub Actions on pushes to `main`, publishing a multi-architecture image (`linux/amd64` and `linux/arm64`) to GitHub Container Registry, served by unprivileged NGINX in a multi-stage container.",
        "Runs as a Knative Service on Kubernetes (Oracle Kubernetes Engine), with a dedicated namespace and custom domain mapping."
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
    }
  ],
  otherProjects:
    "Additional 42 Sao Paulo projects: cub3D and raycast-engine (pseudo-3D raycasting engine in C), ft_services (systems and network administration), libasm (Assembly), ft_server (Docker), get_next_line, ft_printf and libft.",
  education: [
    {
      institution: "UNOPAR — Universidade Norte do Parana",
      degree: "Technology degree in Systems Analysis and Development",
      period: "Jan 2022 — Dec 2023",
      note: "Final grade 9.5/10"
    },
    {
      institution: "42 Sao Paulo",
      degree: "Technical education in Software Engineering",
      period: "2020 — 2021"
    }
  ],
  certifications: [
    {
      name: "Programming with Google Go Specialization",
      issuer: "University of California, Irvine",
      issued: "May 2026",
      credentialId: "2UUQCPO9MST7"
    },
    {
      name: "Concurrency in Go",
      issuer: "University of California, Irvine",
      issued: "May 2026",
      credentialId: "M2EKXK59LHYI"
    },
    {
      name: "Functions, Methods, and Interfaces in Go",
      issuer: "University of California, Irvine",
      issued: "May 2026",
      credentialId: "WIEGNHPO8TBM"
    },
    {
      name: "Getting Started with Go",
      issuer: "University of California, Irvine",
      issued: "May 2026",
      credentialId: "KFGD3IF75I0Q"
    }
  ],
  courses: [
    { name: "Data Structures in Python", workload: "10h · 2023" },
    { name: "Introduction to Data Analysis with Python", workload: "15h · 2023" },
    { name: "Introduction to the Python Language", workload: "15h · 2023" },
    { name: "Management Models", workload: "60h · 2023" },
    { name: "Electronic Law", workload: "60h · 2023" },
    { name: "Information Technologies Applied to Law", workload: "60h · 2023" }
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
    courses: "Additional courses",
    languages: "Languages",
    links: "Contact",
    keywords: "Additional skills",
    targetRole: "Target role",
    print: "Print version",
    printAction: "Print or save as PDF",
    backToSite: "Back to resume",
    repository: "Repository",
    liveSite: "Play at",
    present: "present",
    languageSwitch: "Language selector",
    skillLevel: "Level",
    printHint: "Single-column A4 layout, optimized for ATS parsing.",
    themeLabel: "Theme",
    themeAuto: "System",
    themeLight: "Light",
    themeDark: "Dark",
    tailorTitle: "Tailor to a job",
    tailorHint: "Paste the job description. The resume is reordered to lead with what the posting asks for — nothing is added.",
    tailorPlaceholder: "Paste the job description here…",
    tailorApply: "Tailor",
    tailorReset: "Back to the original",
    tailorCoverage: "Coverage of the posting's technical terms",
    tailorPromoted: "Moved to the front",
    tailorMissing: "The posting asks for, and the resume does not say",
    tailorMissingHint: "None of this was added, on purpose. If it is true, add it to the resume; if not, leave it out.",
    tailorNone: "The posting asks for no technical term the resume is missing.",
    tailorSwitched: "The posting is in English, so this is the English version.",
    tailorGuarantee: "Only reorders what the resume already says.",
    tailorTitleUse: "Use the posting's job title as the target role",
    tailorTitleNote: "It is the most searched keyword in an ATS. Naming the role you are applying for claims no ability — it is the only text from the posting that enters the document, and only while this box is ticked.",
    tailorVerdict: "Benchmark: 80% or more is strong, 65-79% moderate, below that weak.",
    tailorDownloadPdf: "Tailored PDF",
    tailorDownloadDocx: "Tailored DOCX",
    tailorAdaptedBadge: "tailored to the job",
    tailorTitleField: "Job title (optional)",
    tailorTitlePlaceholder: "e.g. Senior Backend Engineer (Go)",
    tailorOrder: "New order of the skill groups"
  }
};
