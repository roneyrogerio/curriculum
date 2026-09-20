import { contact } from "./site";
import type { CV } from "./types";

/*
 * One Spanish, not one per country.
 *
 * The differences between a Spanish and a Latin American CV are real, but they
 * are differences of structure and personal data — age, marital status, a
 * photo, references, expected salary — rather than of the words a technical
 * résumé uses. This document carries none of those either way, and
 * "currículum vitae" is understood everywhere. So Spain, Mexico, Argentina,
 * Chile and Colombia share this file, and the regional vocabulary that does
 * differ ("hoja de vida" in Colombia, "remuneración" in Chile) is left out
 * rather than picked.
 */
export const es: CV = {
  locale: "es",
  lang: "es",
  hreflang: "es",
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
  seoTitle: "Roney de Oliveira — Software Engineer Backend, Frontend y DevOps",
  seoDescription:
    "Currículum de Roney de Oliveira, Software Engineer con 8 años de experiencia en Go, Node.js, React, microservicios, AWS, GCP, Oracle Cloud, Kubernetes y Knative. Disponible para puestos remotos.",
  summary: [
    "Ingeniero de software con experiencia en aplicaciones web, APIs y microservicios en producción, trabajando de extremo a extremo entre backend, frontend y prácticas DevOps.",
    "Trabajo principalmente con Go, PostgreSQL, Node.js y React, además de cloud (AWS, GCP y Oracle Cloud), contenedores y arquitectura orientada a servicios.",
    "Enfoque en código simple, escalable y fácil de mantener, con interés continuo en rendimiento, concurrencia y sistemas distribuidos."
  ],
  contact,
  skillGroups: [
    {
      title: "Lenguajes y frameworks",
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
        { name: "HTML y CSS", level: 4 },
        { name: "Astro", level: 4 },
        { name: "Vite", level: 4 },
        { name: "Three.js", level: 3 },
        { name: "Interfaces responsivas", level: 4 }
      ]
    },
    {
      title: "Backend y arquitectura",
      skills: [
        { name: "Microservicios", alias: ["Microservices"], level: 5 },
        { name: "APIs REST", alias: ["REST APIs"], level: 5 },
        { name: "GraphQL", level: 3 },
        { name: "Webhooks", level: 4 },
        { name: "Server-Sent Events", alias: ["SSE"], level: 4 },
        { name: "Vídeo en tiempo real", alias: ["Cloudflare RealtimeKit", "Streaming"], level: 3 },
        { name: "Idempotencia", alias: ["Idempotency"], level: 4 },
        { name: "Gin", level: 4 },
        { name: "Arquitectura orientada a servicios", alias: ["SOA"], level: 4 },
        { name: "Versionado de APIs", alias: ["Versionado de contratos"], level: 4 },
        { name: "Pruebas automatizadas", level: 4 },
        { name: "Desarrollo seguro", alias: ["Seguridad"], level: 4 },
        { name: "Revisión de código", alias: ["Code review"], level: 4 },
        { name: "Desarrollo asistido por IA", alias: ["AI-assisted development"], level: 4 },
        { name: "Mensajería asíncrona", alias: ["Comunicación asíncrona"], level: 4 },
        { name: "Resiliencia", alias: ["Tolerancia a fallos"], level: 4 },
        { name: "Escalabilidad", level: 5 },
        { name: "Optimización de rendimiento", alias: ["Performance"], level: 4 }
      ]
    },
    {
      title: "Cloud y operaciones",
      skills: [
        { name: "AWS Lambda", alias: ["Serverless"], level: 5 },
        { name: "Amazon S3", level: 4 },
        { name: "Amazon RDS", level: 4 },
        { name: "AWS CloudFormation", level: 4 },
        { name: "AWS API Gateway", level: 3 },
        { name: "AWS Rekognition", level: 3 },
        { name: "Google Cloud Platform", alias: ["GCP"], level: 4 },
        { name: "Cloud Run", level: 4 },
        { name: "Cloudflare R2", alias: ["Almacenamiento de objetos"], level: 3 },
        { name: "BigQuery", level: 3 },
        { name: "Pub/Sub", level: 3 },
        { name: "Vertex AI", level: 3 },
        { name: "Oracle Cloud Infrastructure", alias: ["OCI", "Oracle Cloud"], level: 3 },
        { name: "Oracle Kubernetes Engine", alias: ["OKE"], level: 4 },
        { name: "Observabilidad", alias: ["Monitorización"], level: 4 },
        { name: "OpenTelemetry", alias: ["Trazado distribuido", "Tracing"], level: 3 },
        { name: "Diagnóstico en producción", level: 5 },
        { name: "DevOps", level: 5 }
      ]
    },
    {
      title: "Datos y plataforma",
      skills: [
        { name: "PostgreSQL", alias: ["Bases de datos relacionales"], level: 4 },
        { name: "MongoDB", level: 3 },
        { name: "SQLite", level: 3 },
        { name: "Prisma", level: 3 },
        { name: "Modelado de datos", level: 4 },
        { name: "Optimización de consultas", level: 4 },
        { name: "Linux", level: 5 },
        { name: "Ejecución local de LLMs", alias: ["Self-hosted LLM", "Inferencia local"], level: 3 },
        { name: "Llama", alias: ["Ollama"], level: 3 },
        { name: "API de OpenAI", alias: ["OpenAI API", "LLM"], level: 4 },
        { name: "Salidas estructuradas con JSON Schema", alias: ["Structured Outputs"], level: 4 },
        { name: "Ingeniería de prompts", alias: ["Prompt engineering"], level: 4 },
        { name: "Redes para servicios", level: 4 },
        { name: "Docker", level: 5 },
        { name: "Kubernetes", alias: ["K8s"], level: 4 },
        { name: "Knative", level: 4 },
        { name: "CI/CD con GitHub Actions", alias: ["Integración y entrega continuas"], level: 4 },
        { name: "Terraform", alias: ["Infraestructura como código", "IaC"], level: 4 },
        { name: "Git, GitLab, Jira y Bash", level: 4 }
      ]
    }
  ],
  positions: [
    {
      title: "Desarrollador Full Stack",
      company: "Proaba",
      companyUrl: "https://proaba.com.br",
      employment: "Freelance",
      start: "ago/2026",
      end: "sept/2026",
      startDate: "2026-08-19",
      endDate: "2026-09-17",
      location: "Remoto",
      highlights: [
        "Transmisión en directo y grabación de sesiones con Cloudflare RealtimeKit en una plataforma de clínica infantil: creación de la sala, emisión de token por participante, aprovisionamiento de presets y cierre al final, todo en el servidor.",
        "Grabación escrita directamente en Cloudflare R2, con transcripción automática y reproducción en la propia pantalla de la sesión.",
        "Webhooks del proveedor tratados con idempotencia: los eventos superpuestos dejaron de crear dos registros de medios para una misma grabación, y el reenvío que la propia API pidió al responder 500 dejó de descartarse como duplicado.",
        "Stream SSE liberado mientras la pestaña está oculta y cerrado en `try/finally`, para que una sesión abierta no retenga una plaza en el proveedor.",
        "Control de acceso que exige vínculo con el niño para alcanzar una grabación, autorización grabación a grabación, y listado según la zona horaria de quien mira en lugar de la del servidor.",
        "Privacidad por diseño: ningún nombre de paciente se envía al proveedor — la sala se identifica por el id de la sesión.",
        "Pruebas end-to-end en Playwright y secretos del proveedor mapeados por entorno en el despliegue."
      ]
    },
    {
      title: "Ingeniero de Software Sénior",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Jornada completa",
      start: "jul/2024",
      end: "may/2026",
      startDate: "2024-07-01",
      endDate: "2026-05-31",
      location: "Remoto",
      highlights: [
        "Trabajo de extremo a extremo en el ciclo de ingeniería, desarrollando y operando soluciones backend en cloud (AWS y GCP).",
        "Aplicación de prácticas DevOps y ágiles para garantizar entregas eficientes, estables y de alto valor.",
        "Evolución continua de una plataforma en microservicios, con foco en la fiabilidad operativa."
      ]
    },
    {
      title: "Ingeniero de Software Semisénior",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Jornada completa",
      start: "ene/2022",
      end: "jul/2024",
      startDate: "2022-01-01",
      endDate: "2024-07-31",
      location: "Remoto",
      highlights: [
        "Implementación de funcionalidades con autonomía y dominio del sistema.",
        "Corrección de errores y mantenimiento evolutivo en entorno de producción.",
        "Desarrollo backend con Node.js y PostgreSQL, apoyando las entregas continuas del producto."
      ]
    },
    {
      title: "Ingeniero de Software Júnior",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Jornada completa",
      start: "jul/2021",
      end: "ene/2022",
      startDate: "2021-07-01",
      endDate: "2022-01-31",
      location: "Remoto",
      highlights: [
        "Desarrollo de funcionalidades y corrección de errores.",
        "Participación en el ciclo de entrega con foco en la calidad y la estabilidad del software."
      ]
    },
    {
      title: "Analista de Soporte",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Autónomo",
      start: "mar/2021",
      end: "jul/2021",
      startDate: "2021-03-01",
      endDate: "2021-07-31",
      location: "Remoto",
      highlights: [
        "Atención a los alumnos durante la aplicación de exámenes en línea.",
        "Soporte operativo para garantizar la continuidad y la calidad del servicio."
      ]
    },
    {
      title: "Desarrollador Full Stack",
      company: "Early Denver",
      employment: "Jornada completa",
      start: "dic/2018",
      end: "dic/2019",
      startDate: "2018-12-01",
      endDate: "2019-12-31",
      location: "Brasilia, DF, Brasil (Remoto)",
      highlights: [
        "Desarrollo full stack de funcionalidades web.",
        "Trabajo con Node.js, React.js y PostgreSQL en el ciclo de entrega de producto.",
        "Colaboración remota con el equipo para la evolución continua de la aplicación."
      ]
    },
    {
      title: "Desarrollador de Software Júnior",
      company: "StutzLab",
      employment: "Jornada completa",
      start: "ene/2018",
      end: "nov/2018",
      startDate: "2018-01-01",
      endDate: "2018-11-30",
      location: "São Paulo, SP, Brasil (Remoto)",
      highlights: [
        "Desarrollo de funcionalidades para aplicaciones web.",
        "Trabajo con PHP, JavaScript, MySQL, HTML y CSS en la implementación de pantallas y reglas de negocio.",
        "Uso de Bootstrap para estandarizar la interfaz y ganar productividad en el frontend."
      ]
    },
    {
      title: "Desarrollador Web",
      company: "Proyectos propios",
      employment: "Autónomo",
      start: "nov/2010",
      end: "dic/2017",
      startDate: "2010-11-01",
      endDate: "2017-12-31",
      location: "Remoto",
      highlights: [
        "Desarrollo de proyectos propios con HTML, CSS, PHP, MySQL y Nginx.",
        "Monetización de productos y contenido digital mediante Google AdSense."
      ]
    }
  ],
  projects: [
    {
      name: "Soltar Pipa — soltarpipa.online",
      context: "Proyecto personal · multijugador en tiempo real",
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
        "Servidor autoritativo en Go: toda la física de vuelo y el duelo entre hilos corren en el servidor, y el navegador solo dibuja y envía los controles, lo que elimina la superficie de trampa en el cliente.",
        "Protocolo binario propio sobre WebSocket, little endian, con un frame de referencia grabado por el Go y decodificado por la prueba del cliente en TypeScript: cambiar un lado sin el otro rompe la build.",
        "Área de interés que trata a cada jugador como un segmento de recta, de la mano a la cometa, en una rejilla espacial de 48 m con radio de 120 m e histéresis — 12 µs por jugador, sin asignación de memoria.",
        "Optimización guiada por perfilado: barrido ordenado en lugar de comparar todos los pares (de 28 ms a ~1 ms por tick) y quickselect en lugar de ordenación al seleccionar cometas por envío (del 16% al 2,4% de la CPU del tick).",
        "Prueba de carga propia con 5.000 WebSockets simultáneos, sin fallos de conexión ni expulsiones; en producción la sala funciona con 140 jugadores a 15 fotogramas por segundo, límite impuesto por el ancho de banda del balanceador de 10 Mbps, no por la CPU.",
        "Producción en Knative sobre Kubernetes, con dos servicios y dos dominios, imágenes en GHCR y versionado automatizado con release-please."
      ]
    },
    {
      name: "Currículum multilingüe — roneyrogerio.dev",
      context: "Proyecto personal",
      repository: "https://github.com/roneyrogerio/curriculum",
      url: "https://roneyrogerio.dev",
      stack: [
        "Astro",
        "TypeScript",
        "Node.js 24",
        "Docker",
        "GitHub Actions",
        "API de OpenAI",
        "Kubernetes",
        "Knative"
      ],
      highlights: [
        "Adaptación del currículum a una oferta mediante LLM (API de OpenAI con Structured Outputs): el modelo recibe hechos identificados y devuelve solo selección, orden y redacción; el empleador, las fechas y los enlaces vienen de la fuente.",
        "Verificación automática de cada frase reescrita contra su origen, rechazando toda tecnología o cifra que el hecho no afirme.",
        "Sitio estático multilingüe con versión de lectura y versión de impresión A4, más exportadores de PDF y DOCX validados contra un simulador de análisis de ATS.",
        "Despliegue automatizado con GitHub Actions en cada release, con versionado y changelog por release-please e imagen multiarquitectura (`linux/amd64` y `linux/arm64`) en GitHub Container Registry.",
        "Ejecución como Knative Service sobre Kubernetes (Oracle Kubernetes Engine), con namespace dedicado y dominio propio."
      ]
    },
    {
      name: "Receitex — receitex.com.br",
      context: "Proyecto personal · sin mantenimiento, todavía en línea",
      url: "https://receitex.com.br",
      stack: ["WordPress", "PHP", "React", "API de OpenAI", "MySQL", "Docker", "Kubernetes", "Knative"],
      highlights: [
        "Sitio de recetas con plugin propio, CulinAI: un panel en React dentro del admin de WordPress que genera la receta entera — título, ingredientes con fracciones, elaboración, categorías y etiquetas — y la publica como entrada.",
        "Texto y foto del plato generados por IA, con la imagen enviada a la biblioteca de medios mediante rutas REST propias del plugin.",
        "Empaquetado en contenedor a partir de la imagen oficial de WordPress, ejecutándose como Knative Service sobre Kubernetes, con MySQL, dominio propio y TLS.",
        "Ya no se mantiene, y sigue en línea a propósito: es el registro de un sitio entero escrito por IA cuando eso todavía era una novedad. Las imágenes son de la primera generación de los modelos — reconocibles como el plato correcto, y visiblemente por debajo de lo que se produce hoy."
      ]
    },
    {
      name: "minishell",
      context: "42 São Paulo · C",
      repository: "https://github.com/roneyrogerio/minishell",
      stack: ["C", "Llamadas al sistema POSIX"],
      highlights: [
        "Terminal Linux implementado en C con llamadas al sistema, sin biblioteca de lexer.",
        "Soporte para múltiples comandos, comillas simples y dobles, escape de caracteres, pipelines y redirecciones (`<`, `>` y `>>`).",
        "Built-ins (`echo`, `cd`, `pwd`, `export`, `unset`, `env`, `exit`), señales (`ctrl-C`, `ctrl-D`, `ctrl-\\`) y variables de entorno."
      ]
    },
    {
      name: "Pipefy Client Management API",
      context: "Proyecto personal · 2026",
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
        "API REST en Go con Gin y persistencia en SQLite, para el registro de clientes y el procesamiento de patrimonio invertido.",
        "Integración GraphQL con Pipefy y recepción de webhooks con control de idempotencia: el mismo evento entregado dos veces no se procesa dos veces.",
        "Trazado distribuido con OpenTelemetry y Jaeger, y entorno local completo en Docker Compose — mock GraphQL, colector y API con recarga automática — levantándose con un solo comando.",
        "El mismo enrutador sirve HTTP local y AWS Lambda mediante proxy integration de API Gateway, con pruebas automatizadas que cubren las rutas."
      ]
    },
    {
      name: "cub3D y raycast-engine",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/cub3D",
      stack: ["C", "Raycasting", "Makefile"],
      highlights: [
        "Juego demo pseudo-3D dibujado por raycasting en C, con el motor extraído a una biblioteca propia y el juego consumiendo solo su interfaz.",
        "La biblioteca expone cámara, minimapa, tamaño de ventana y actualización de movimiento, y dibuja la escena mediante un puntero a función que pasa quien la llama."
      ]
    },
    {
      name: "libbmp",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libbmp",
      stack: ["C"],
      highlights: [
        "Biblioteca en C puro para leer, crear, modificar píxel a píxel y grabar imágenes BMP de 24 y 32 bits por píxel.",
        "Trabaja directamente sobre el formato del archivo y el orden de bytes little endian, sin dependencias externas."
      ]
    },
    {
      name: "ft_server",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_server",
      stack: ["Docker", "NGINX", "PHP", "MySQL", "WordPress"],
      highlights: [
        "Imagen Docker única sirviendo NGINX, PHP, MySQL, WordPress y phpMyAdmin, configurados desde cero."
      ]
    },
    {
      name: "ft_services",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_services",
      stack: ["Administración de sistemas", "Redes", "Contenedores"],
      highlights: [
        "Proyecto de administración de sistemas y redes: aprovisionamiento y orquestación de servicios en contenedores."
      ]
    },
    {
      name: "libasm",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libasm",
      stack: ["Assembly", "C"],
      highlights: [
        "Funciones de la biblioteca estándar de C reescritas en Assembly, con las convenciones de llamada y el retorno de error del original."
      ]
    },
    {
      name: "libft",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libft",
      stack: ["C"],
      highlights: [
        "Reimplementación de las funciones de la biblioteca estándar de C — memoria, cadenas, conversiones y salida por descriptor —, escritas desde cero para entender lo que cuesta cada una.",
        "Incluye una lista enlazada propia con creación, inserción por ambos extremos, iteración, mapeo y liberación."
      ]
    },
    {
      name: "ft_printf",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_printf",
      stack: ["C", "Funciones variádicas"],
      highlights: [
        "Reimplementación de printf en C, con número variable de argumentos y despacho por especificador de formato, apoyada en la libft propia."
      ]
    },
    {
      name: "get_next_line",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/get_next_line",
      stack: ["C", "Llamadas al sistema POSIX"],
      highlights: [
        "Función que lee un archivo línea a línea desde un descriptor, usando solo `read`, `malloc` y `free`, con el búfer definido en tiempo de compilación.",
        "La segunda versión corrigió la fuga que dejaba la primera cuando el archivo no se leía hasta el final — el estado pendiente quedaba asignado sin dueño."
      ]
    },
    {
      name: "Módulos de C++",
      context: "42 São Paulo · 2021",
      repository: "https://github.com/roneyrogerio/cpp_module_00",
      stack: ["C++"],
      highlights: [
        "Primeros módulos de C++ de 42: lectura de argumentos de la línea de comandos y una agenda en memoria con los comandos ADD, SEARCH y EXIT.",
        "El módulo siguiente reúne cinco ejercicios más, en cpp_module_01."
      ]
    }
  ],
  education: [
    {
      institution: "UNOPAR — Universidade Norte do Paraná",
      degree: "Técnico Superior en Análisis y Desarrollo de Sistemas",
      period: "ene/2022 — dic/2023",
      note: "Nota final 9,5",
      url: "/certificados/diploma.png"
    },
    {
      institution: "42 São Paulo",
      degree: "Formación técnica en Ingeniería de Software",
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
      issued: "may/2026",
      credentialId: "2UUQCPO9MST7",
      url: "https://www.coursera.org/account/accomplishments/specialization/2UUQCPO9MST7"
    },
    {
      name: "Concurrency in Go",
      issuer: "University of California, Irvine",
      issued: "may/2026",
      credentialId: "M2EKXK59LHYI",
      url: "https://www.coursera.org/account/accomplishments/certificate/M2EKXK59LHYI"
    },
    {
      name: "Functions, Methods, and Interfaces in Go",
      issuer: "University of California, Irvine",
      issued: "may/2026",
      credentialId: "WIEGNHPO8TBM",
      url: "https://www.coursera.org/account/accomplishments/certificate/WIEGNHPO8TBM"
    },
    {
      name: "Getting Started with Go",
      issuer: "University of California, Irvine",
      issued: "may/2026",
      credentialId: "KFGD3IF75I0Q",
      url: "https://www.coursera.org/account/accomplishments/certificate/KFGD3IF75I0Q"
    }
  ],
  courses: [
    {
      name: "Introducción al Lenguaje Python",
      issuer: "Unopar",
      workload: "15 h",
      period: "1.er semestre de 2023",
      url: "/certificados/introducao-a-linguagem-python.pdf"
    },
    {
      name: "Introducción al Análisis de Datos con Python",
      issuer: "Unopar",
      workload: "15 h",
      period: "1.er semestre de 2023",
      url: "/certificados/introducao-a-analise-de-dados-com-python.pdf"
    },
    {
      name: "Estructuras de Datos en Python",
      issuer: "Unopar",
      workload: "10 h",
      period: "1.er semestre de 2023",
      url: "/certificados/estruturas-de-dados-em-python.pdf"
    },
    {
      name: "Tecnologías de la Información Aplicadas al Derecho",
      issuer: "Unopar",
      workload: "60 h",
      period: "2.º semestre de 2023",
      url: "/certificados/tecnologias-de-informacao-aplicadas-ao-direito.pdf"
    },
    {
      name: "Derecho Electrónico",
      issuer: "Unopar",
      workload: "60 h",
      period: "2.º semestre de 2023",
      url: "/certificados/direito-eletronico.pdf"
    },
    {
      name: "Modelos de Gestión",
      issuer: "Unopar",
      workload: "60 h",
      period: "2.º semestre de 2023",
      url: "/certificados/modelos-de-gestao.pdf"
    }
  ],
  languages: [
    { name: "Portugués", level: "Nativo" },
    { name: "Inglés", level: "Básico (A2)" }
  ],
  keywords: [
    "Ingeniero de Software",
    "Software Engineer",
    "Desarrollador Back-end",
    "Desarrollador Backend",
    "Backend Engineer",
    "Desarrollador Front-end",
    "Desarrollador Frontend",
    "Frontend Engineer",
    "Desarrollador Full Stack",
    "Full Stack Engineer",
    "Sistemas distribuidos",
    "WebSocket",
    "SQL",
    "NoSQL",
    "Amazon Web Services",
    "Alta disponibilidad",
    "Fiabilidad",
    "Metodologías ágiles",
    "Scrum"
  ],
  labels: {
    summary: "Resumen profesional",
    skills: "Competencias técnicas",
    experience: "Experiencia profesional",
    projects: "Proyectos",
    education: "Formación académica",
    certifications: "Certificaciones",
    certificate: "certificado",
    diploma: "diploma",
    courses: "Cursos complementarios",
    languages: "Idiomas",
    links: "Contacto",
    keywords: "Competencias adicionales",
    targetRole: "Puesto objetivo",
    print: "Versión para imprimir",
    printAction: "Imprimir o guardar en PDF",
    tailor: "Adaptar a una oferta",
    backToSite: "Volver al currículum",
    repository: "Repositorio",
    liveSite: "En línea en",
    present: "actual",
    languageSwitch: "Selector de idioma",
    languageName: "ES",
    languageLabel: "Español",
    gateNote: "Currículum completo en español",
    gateSuggested: "sugerido",
    skipToContent: "Ir al contenido",
    skillLevel: "Nivel",
    printHint: "Diseño A4 de una sola columna, optimizado para su lectura por un ATS.",
    themeLabel: "Tema",
    themeLight: "Claro",
    themeDark: "Oscuro"
  }
};
