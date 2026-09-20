import { contact } from "./site";
import type { CV } from "./types";

/*
 * French, for Quebec above all.
 *
 * Canada is one market in the salary table and two in practice: a position
 * based in Quebec generally asks for French, written and spoken, and only the
 * multinationals in Montreal are relaxed about it. An English CV there is not
 * foreign-looking, it is often disqualifying.
 *
 * One French rather than one per country, on the same reasoning as the
 * Spanish file: what separates Quebec from France in a résumé is vocabulary
 * this document does not use. Where the two differ — "courriel" against
 * "e-mail" — the neutral term is chosen.
 */
export const fr: CV = {
  locale: "fr",
  lang: "fr",
  hreflang: "fr",
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
  seoTitle: "Roney de Oliveira — Software Engineer Backend, Frontend et DevOps",
  seoDescription:
    "CV de Roney de Oliveira, Software Engineer avec 8 ans d'expérience en Go, Node.js, React, microservices, AWS, GCP, Oracle Cloud, Kubernetes et Knative. Disponible pour des postes à distance.",
  summary: [
    "Ingénieur logiciel avec une expérience des applications web, des API et des microservices en production, du backend au frontend en passant par les pratiques DevOps.",
    "Je travaille principalement avec Go, PostgreSQL, Node.js et React, ainsi qu'avec l'infonuagique (AWS, GCP et Oracle Cloud), les conteneurs et l'architecture orientée services.",
    "Attaché à un code simple, évolutif et facile à maintenir, avec un intérêt continu pour la performance, la concurrence et les systèmes distribués."
  ],
  contact,
  skillGroups: [
    {
      title: "Langages et frameworks",
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
        { name: "HTML et CSS", level: 4 },
        { name: "Astro", level: 4 },
        { name: "Vite", level: 4 },
        { name: "Three.js", level: 3 },
        { name: "Interfaces adaptatives", level: 4 }
      ]
    },
    {
      title: "Backend et architecture",
      skills: [
        { name: "Microservices", level: 5 },
        { name: "API REST", alias: ["REST APIs"], level: 5 },
        { name: "GraphQL", level: 3 },
        { name: "Webhooks", level: 4 },
        { name: "Server-Sent Events", alias: ["SSE"], level: 4 },
        { name: "Vidéo en temps réel", alias: ["Cloudflare RealtimeKit", "Streaming"], level: 3 },
        { name: "Idempotence", alias: ["Idempotency"], level: 4 },
        { name: "Gin", level: 4 },
        { name: "Architecture orientée services", alias: ["SOA"], level: 4 },
        { name: "Versionnement d'API", alias: ["Versionnement de contrats"], level: 4 },
        { name: "Tests automatisés", level: 4 },
        { name: "Développement sécurisé", alias: ["Sécurité"], level: 4 },
        { name: "Revue de code", alias: ["Code review"], level: 4 },
        { name: "Développement assisté par IA", alias: ["AI-assisted development"], level: 4 },
        { name: "Messagerie asynchrone", alias: ["Communication asynchrone"], level: 4 },
        { name: "Résilience", alias: ["Tolérance aux pannes"], level: 4 },
        { name: "Scalabilité", level: 5 },
        { name: "Optimisation des performances", alias: ["Performance"], level: 4 }
      ]
    },
    {
      title: "Infonuagique et exploitation",
      skills: [
        { name: "AWS Lambda", alias: ["Serverless"], level: 5 },
        { name: "Amazon S3", level: 4 },
        { name: "Amazon RDS", level: 4 },
        { name: "AWS CloudFormation", level: 4 },
        { name: "AWS API Gateway", level: 3 },
        { name: "AWS Rekognition", level: 3 },
        { name: "Google Cloud Platform", alias: ["GCP"], level: 4 },
        { name: "Cloud Run", level: 4 },
        { name: "Cloudflare R2", alias: ["Stockage objet"], level: 3 },
        { name: "BigQuery", level: 3 },
        { name: "Pub/Sub", level: 3 },
        { name: "Vertex AI", level: 3 },
        { name: "Oracle Cloud Infrastructure", alias: ["OCI", "Oracle Cloud"], level: 3 },
        { name: "Oracle Kubernetes Engine", alias: ["OKE"], level: 4 },
        { name: "Observabilité", alias: ["Supervision"], level: 4 },
        { name: "OpenTelemetry", alias: ["Traçage distribué", "Tracing"], level: 3 },
        { name: "Diagnostic en production", level: 5 },
        { name: "DevOps", level: 5 }
      ]
    },
    {
      title: "Données et plateforme",
      skills: [
        { name: "PostgreSQL", alias: ["Bases de données relationnelles"], level: 4 },
        { name: "MongoDB", level: 3 },
        { name: "SQLite", level: 3 },
        { name: "Prisma", level: 3 },
        { name: "Modélisation de données", level: 4 },
        { name: "Optimisation de requêtes", level: 4 },
        { name: "Linux", level: 5 },
        { name: "Exécution locale de LLM", alias: ["Self-hosted LLM", "Inférence locale"], level: 3 },
        { name: "Llama", alias: ["Ollama"], level: 3 },
        { name: "API d'OpenAI", alias: ["OpenAI API", "LLM"], level: 4 },
        { name: "Sorties structurées avec JSON Schema", alias: ["Structured Outputs"], level: 4 },
        { name: "Ingénierie de prompts", alias: ["Prompt engineering"], level: 4 },
        { name: "Réseaux pour services", level: 4 },
        { name: "Docker", level: 5 },
        { name: "Kubernetes", alias: ["K8s"], level: 4 },
        { name: "Knative", level: 4 },
        { name: "CI/CD avec GitHub Actions", alias: ["Intégration et livraison continues"], level: 4 },
        { name: "Terraform", alias: ["Infrastructure as code", "IaC"], level: 4 },
        { name: "Git, GitLab, Jira et Bash", level: 4 }
      ]
    }
  ],
  positions: [
    {
      title: "Développeur Full Stack",
      company: "Proaba",
      companyUrl: "https://proaba.com.br",
      employment: "Freelance",
      start: "août/2026",
      end: "sept/2026",
      startDate: "2026-08-19",
      endDate: "2026-09-17",
      location: "À distance",
      highlights: [
        "Diffusion en direct et enregistrement de séances avec Cloudflare RealtimeKit sur une plateforme de clinique pédiatrique : création de la salle, émission d'un jeton par participant, provisionnement des préréglages et fermeture à la fin, le tout côté serveur.",
        "Enregistrement écrit directement dans Cloudflare R2, avec transcription automatique et lecture depuis l'écran de la séance.",
        "Webhooks du fournisseur traités de façon idempotente : des événements superposés ne créaient plus deux enregistrements pour une même séance, et le renvoi que l'API réclamait elle-même en répondant 500 a cessé d'être rejeté comme doublon.",
        "Flux SSE libéré lorsque l'onglet est masqué et fermé dans un `try/finally`, pour qu'une séance ouverte ne retienne pas une place chez le fournisseur.",
        "Contrôle d'accès exigeant un lien avec l'enfant pour atteindre un enregistrement, autorisation enregistrement par enregistrement, et affichage selon le fuseau horaire de qui regarde plutôt que celui du serveur.",
        "Confidentialité dès la conception : aucun nom de patient n'est transmis au fournisseur — la salle est identifiée par l'identifiant de la séance.",
        "Tests de bout en bout avec Playwright et secrets du fournisseur cartographiés par environnement au déploiement."
      ]
    },
    {
      title: "Ingénieur logiciel senior",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Temps plein",
      start: "juil/2024",
      end: "mai/2026",
      startDate: "2024-07-01",
      endDate: "2026-05-31",
      location: "À distance",
      highlights: [
        "Intervention de bout en bout sur le cycle d'ingénierie, en développant et en exploitant des solutions backend dans le nuage (AWS et GCP).",
        "Application de pratiques DevOps et agiles pour garantir des livraisons efficaces, stables et à forte valeur.",
        "Évolution continue d'une plateforme en microservices, avec un souci constant de fiabilité en exploitation."
      ]
    },
    {
      title: "Ingénieur logiciel intermédiaire",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Temps plein",
      start: "janv/2022",
      end: "juil/2024",
      startDate: "2022-01-01",
      endDate: "2024-07-31",
      location: "À distance",
      highlights: [
        "Implémentation de fonctionnalités en autonomie et avec une bonne maîtrise du système.",
        "Correction d'anomalies et maintenance évolutive en environnement de production.",
        "Développement backend avec Node.js et PostgreSQL, en appui des livraisons continues du produit."
      ]
    },
    {
      title: "Ingénieur logiciel junior",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Temps plein",
      start: "juil/2021",
      end: "janv/2022",
      startDate: "2021-07-01",
      endDate: "2022-01-31",
      location: "À distance",
      highlights: [
        "Développement de fonctionnalités et correction d'anomalies.",
        "Participation au cycle de livraison, avec une attention portée à la qualité et à la stabilité du logiciel."
      ]
    },
    {
      title: "Analyste de soutien technique",
      company: "e-didatico",
      companyUrl: "https://edidatico.com",
      employment: "Indépendant",
      start: "mars/2021",
      end: "juil/2021",
      startDate: "2021-03-01",
      endDate: "2021-07-31",
      location: "À distance",
      highlights: [
        "Assistance aux étudiants pendant la passation d'examens en ligne.",
        "Soutien opérationnel afin d'assurer la continuité et la qualité du service."
      ]
    },
    {
      title: "Développeur Full Stack",
      company: "Early Denver",
      employment: "Temps plein",
      start: "déc/2018",
      end: "déc/2019",
      startDate: "2018-12-01",
      endDate: "2019-12-31",
      location: "Brasilia, DF, Brésil (à distance)",
      highlights: [
        "Développement full stack de fonctionnalités web.",
        "Travail avec Node.js, React.js et PostgreSQL dans le cycle de livraison du produit.",
        "Collaboration à distance avec l'équipe pour faire évoluer l'application en continu."
      ]
    },
    {
      title: "Développeur logiciel junior",
      company: "StutzLab",
      employment: "Temps plein",
      start: "janv/2018",
      end: "nov/2018",
      startDate: "2018-01-01",
      endDate: "2018-11-30",
      location: "São Paulo, SP, Brésil (à distance)",
      highlights: [
        "Développement de fonctionnalités pour des applications web.",
        "Travail avec PHP, JavaScript, MySQL, HTML et CSS pour l'implémentation d'écrans et de règles métier.",
        "Utilisation de Bootstrap pour uniformiser l'interface et gagner en productivité côté frontend."
      ]
    },
    {
      title: "Développeur web",
      company: "Projets personnels",
      employment: "Indépendant",
      start: "nov/2010",
      end: "déc/2017",
      startDate: "2010-11-01",
      endDate: "2017-12-31",
      location: "À distance",
      highlights: [
        "Développement de projets personnels avec HTML, CSS, PHP, MySQL et Nginx.",
        "Monétisation de produits et de contenus numériques au moyen de Google AdSense."
      ]
    }
  ],
  projects: [
    {
      name: "Soltar Pipa — soltarpipa.online",
      context: "Projet personnel · multijoueur en temps réel",
      url: "https://soltarpipa.online",
      stack: ["Go", "TypeScript", "Three.js", "WebSocket", "Vite", "Docker", "Kubernetes", "Knative"],
      highlights: [
        "Serveur autoritatif en Go : toute la physique de vol et le duel entre les fils tournent sur le serveur, le navigateur ne fait que dessiner et transmettre les commandes, ce qui supprime la surface de triche côté client.",
        "Protocole binaire maison sur WebSocket, en petit-boutiste, avec une trame de référence écrite par le Go et décodée par le test du client en TypeScript : modifier un côté sans l'autre casse la compilation.",
        "Zone d'intérêt traitant chaque joueur comme un segment de droite, de la main au cerf-volant, sur une grille spatiale de 48 m avec un rayon de 120 m et de l'hystérésis — 12 µs par joueur, sans allocation.",
        "Optimisation guidée par le profilage : balayage trié à la place de la comparaison de toutes les paires (de 28 ms à ~1 ms par tick) et quickselect à la place du tri lors de la sélection des cerfs-volants par envoi (de 16 % à 2,4 % du temps CPU du tick).",
        "Test de charge maison avec 5 000 WebSockets simultanés, sans échec de connexion ni éviction ; en production la salle tourne avec 140 joueurs à 15 images par seconde, limite imposée par la bande passante de 10 Mbps du répartiteur, et non par le processeur.",
        "Production sur Knative au-dessus de Kubernetes, avec deux services et deux domaines, des images sur GHCR et un versionnement automatisé par release-please."
      ]
    },
    {
      name: "CV multilingue — roneyrogerio.dev",
      context: "Projet personnel",
      repository: "https://github.com/roneyrogerio/curriculum",
      url: "https://roneyrogerio.dev",
      stack: ["Astro", "TypeScript", "Node.js 24", "Docker", "GitHub Actions", "API d'OpenAI", "Kubernetes", "Knative"],
      highlights: [
        "Adaptation du CV à une offre par LLM (API d'OpenAI avec Structured Outputs) : le modèle reçoit des faits identifiés et ne renvoie que la sélection, l'ordre et la formulation ; l'employeur, les dates et les liens viennent de la source.",
        "Vérification automatique de chaque phrase réécrite face à son origine, rejetant toute technologie ou tout chiffre que le fait n'affirme pas.",
        "Site statique multilingue avec une version de lecture et une version imprimable A4, plus des exportateurs PDF et DOCX validés contre un simulateur d'analyse ATS.",
        "Déploiement automatisé par GitHub Actions à chaque version, avec versionnement et journal des modifications par release-please et image multi-architecture (`linux/amd64` et `linux/arm64`) sur GitHub Container Registry.",
        "Exécution comme Knative Service au-dessus de Kubernetes (Oracle Kubernetes Engine), avec un espace de noms dédié et un domaine personnalisé."
      ]
    },
    {
      name: "Receitex — receitex.com.br",
      context: "Projet personnel · sans maintenance, toujours en ligne",
      url: "https://receitex.com.br",
      stack: ["WordPress", "PHP", "React", "API d'OpenAI", "MySQL", "Docker", "Kubernetes", "Knative"],
      highlights: [
        "Site de recettes avec une extension maison, CulinAI : un panneau React dans l'administration de WordPress qui génère la recette entière — titre, ingrédients avec fractions, préparation, catégories et étiquettes — et la publie comme article.",
        "Texte et photo du plat générés par IA, l'image étant envoyée à la médiathèque par des routes REST propres à l'extension.",
        "Empaqueté en conteneur à partir de l'image officielle de WordPress, exécuté comme Knative Service au-dessus de Kubernetes, avec MySQL, domaine propre et TLS.",
        "Il n'est plus maintenu et reste en ligne à dessein : c'est la trace d'un site entier écrit par IA à une époque où cela était encore nouveau. Les images viennent de la première génération des modèles — reconnaissables comme le bon plat, et visiblement en deçà de ce qui se produit aujourd'hui."
      ]
    },
    {
      name: "minishell",
      context: "42 São Paulo · C",
      repository: "https://github.com/roneyrogerio/minishell",
      stack: ["C", "Appels système POSIX"],
      highlights: [
        "Terminal Linux implémenté en C avec des appels système, sans bibliothèque d'analyse lexicale.",
        "Prise en charge de plusieurs commandes, des guillemets simples et doubles, de l'échappement de caractères, des pipelines et des redirections (`<`, `>` et `>>`).",
        "Commandes intégrées (`echo`, `cd`, `pwd`, `export`, `unset`, `env`, `exit`), signaux (`ctrl-C`, `ctrl-D`, `ctrl-\\`) et variables d'environnement."
      ]
    },
    {
      name: "Pipefy Client Management API",
      context: "Projet personnel · 2026",
      repository: "https://github.com/roneyrogerio/pipefy-client-management-api",
      stack: ["Go", "Gin", "SQLite", "GraphQL", "OpenTelemetry", "Jaeger", "Docker Compose", "AWS Lambda", "API Gateway"],
      highlights: [
        "API REST en Go avec Gin et persistance dans SQLite, pour l'enregistrement de clients et le traitement du patrimoine investi.",
        "Intégration GraphQL avec Pipefy et réception de webhooks avec contrôle d'idempotence : le même événement livré deux fois n'est pas traité deux fois.",
        "Traçage distribué avec OpenTelemetry et Jaeger, et environnement local complet en Docker Compose — mock GraphQL, collecteur et API avec rechargement automatique — démarrant en une seule commande.",
        "Le même routeur sert le HTTP local et AWS Lambda par proxy integration de l'API Gateway, avec des tests automatisés couvrant les routes."
      ]
    },
    {
      name: "cub3D et raycast-engine",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/cub3D",
      stack: ["C", "Raycasting", "Makefile"],
      highlights: [
        "Jeu de démonstration pseudo-3D dessiné par lancer de rayons en C, le moteur étant extrait dans une bibliothèque propre dont le jeu ne consomme que l'interface.",
        "La bibliothèque expose la caméra, la minicarte, la taille de la fenêtre et la mise à jour du mouvement, et dessine la scène via un pointeur de fonction fourni par l'appelant."
      ]
    },
    {
      name: "libbmp",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libbmp",
      stack: ["C"],
      highlights: [
        "Bibliothèque en C pur pour lire, créer, modifier pixel par pixel et écrire des images BMP de 24 et 32 bits par pixel.",
        "Elle travaille directement sur le format du fichier et sur l'ordre des octets en petit-boutiste, sans dépendance externe."
      ]
    },
    {
      name: "ft_server",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_server",
      stack: ["Docker", "NGINX", "PHP", "MySQL", "WordPress"],
      highlights: [
        "Image Docker unique servant NGINX, PHP, MySQL, WordPress et phpMyAdmin, configurés de zéro."
      ]
    },
    {
      name: "ft_services",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_services",
      stack: ["Administration système", "Réseaux", "Conteneurs"],
      highlights: [
        "Projet d'administration système et réseau : provisionnement et orchestration de services en conteneurs."
      ]
    },
    {
      name: "libasm",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libasm",
      stack: ["Assembleur", "C"],
      highlights: [
        "Fonctions de la bibliothèque standard du C réécrites en assembleur, avec les conventions d'appel et le retour d'erreur de l'original."
      ]
    },
    {
      name: "libft",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/libft",
      stack: ["C"],
      highlights: [
        "Réimplémentation des fonctions de la bibliothèque standard du C — mémoire, chaînes, conversions et sortie par descripteur —, écrites de zéro pour comprendre ce que chacune coûte.",
        "Inclut une liste chaînée maison avec création, insertion aux deux extrémités, itération, application d'une fonction et libération."
      ]
    },
    {
      name: "ft_printf",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/ft_printf",
      stack: ["C", "Fonctions variadiques"],
      highlights: [
        "Réimplémentation de printf en C, avec un nombre variable d'arguments et une répartition par spécificateur de format, appuyée sur la libft maison."
      ]
    },
    {
      name: "get_next_line",
      context: "42 São Paulo · 2020",
      repository: "https://github.com/roneyrogerio/get_next_line",
      stack: ["C", "Appels système POSIX"],
      highlights: [
        "Fonction qui lit un fichier ligne par ligne depuis un descripteur, en n'utilisant que `read`, `malloc` et `free`, avec une taille de tampon fixée à la compilation.",
        "La seconde version a corrigé la fuite que laissait la première lorsque le fichier n'était pas lu jusqu'au bout — l'état en attente restait alloué sans propriétaire."
      ]
    },
    {
      name: "Modules C++",
      context: "42 São Paulo · 2021",
      repository: "https://github.com/roneyrogerio/cpp_module_00",
      stack: ["C++"],
      highlights: [
        "Premiers modules C++ de 42 : lecture des arguments de la ligne de commande et un répertoire en mémoire avec les commandes ADD, SEARCH et EXIT.",
        "Le module suivant réunit cinq exercices de plus, dans cpp_module_01."
      ]
    }
  ],
  education: [
    {
      institution: "UNOPAR — Universidade Norte do Paraná",
      degree: "DUT en analyse et développement de systèmes",
      period: "janv/2022 — déc/2023",
      note: "Note finale 9,5",
      url: "/certificados/diploma.png"
    },
    {
      institution: "42 São Paulo",
      degree: "Formation technique en génie logiciel",
      period: "2020 — 2021"
    }
  ],
  certifications: [
    {
      name: "Next.js App Router Fundamentals",
      issuer: "Vercel",
      issued: "août/2026",
      credentialId: "dashboard-app",
      url: "https://nextjs.org/learn/certificate?course=dashboard-app&user=169196&certId=dashboard-app-169196-1786987870264"
    },
    {
      name: "React Foundations for Next.js",
      issuer: "Vercel",
      issued: "août/2026",
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
      name: "Introduction au langage Python",
      issuer: "Unopar",
      workload: "15 h",
      period: "1er semestre 2023",
      url: "/certificados/introducao-a-linguagem-python.pdf"
    },
    {
      name: "Introduction à l'analyse de données avec Python",
      issuer: "Unopar",
      workload: "15 h",
      period: "1er semestre 2023",
      url: "/certificados/introducao-a-analise-de-dados-com-python.pdf"
    },
    {
      name: "Structures de données en Python",
      issuer: "Unopar",
      workload: "10 h",
      period: "1er semestre 2023",
      url: "/certificados/estruturas-de-dados-em-python.pdf"
    },
    {
      name: "Technologies de l'information appliquées au droit",
      issuer: "Unopar",
      workload: "60 h",
      period: "2e semestre 2023",
      url: "/certificados/tecnologias-de-informacao-aplicadas-ao-direito.pdf"
    },
    {
      name: "Droit électronique",
      issuer: "Unopar",
      workload: "60 h",
      period: "2e semestre 2023",
      url: "/certificados/direito-eletronico.pdf"
    },
    {
      name: "Modèles de gestion",
      issuer: "Unopar",
      workload: "60 h",
      period: "2e semestre 2023",
      url: "/certificados/modelos-de-gestao.pdf"
    }
  ],
  languages: [
    { name: "Portugais", level: "Langue maternelle" },
    { name: "Anglais", level: "Notions (A2)" }
  ],
  keywords: [
    "Ingénieur logiciel",
    "Software Engineer",
    "Développeur back-end",
    "Développeur backend",
    "Backend Engineer",
    "Développeur front-end",
    "Développeur frontend",
    "Frontend Engineer",
    "Développeur full stack",
    "Full Stack Engineer",
    "Systèmes distribués",
    "WebSocket",
    "SQL",
    "NoSQL",
    "Amazon Web Services",
    "Haute disponibilité",
    "Fiabilité",
    "Méthodes agiles",
    "Scrum"
  ],
  labels: {
    summary: "Profil professionnel",
    skills: "Compétences techniques",
    experience: "Expérience professionnelle",
    projects: "Projets",
    education: "Formation",
    certifications: "Certifications",
    certificate: "certificat",
    diploma: "diplôme",
    courses: "Formations complémentaires",
    languages: "Langues",
    links: "Contact",
    keywords: "Compétences additionnelles",
    targetRole: "Poste visé",
    print: "Version imprimable",
    printShort: "Imprimer",
    printAction: "Imprimer ou enregistrer en PDF",
    tailor: "Adapter à une offre",
    backToSite: "Retour au CV",
    repository: "Dépôt",
    liveSite: "En ligne à",
    present: "en cours",
    languageSwitch: "Sélecteur de langue",
    languageName: "FR",
    languageLabel: "Français",
    gateNote: "CV complet en français",
    gateSuggested: "suggéré",
    skipToContent: "Aller au contenu",
    skillLevel: "Niveau",
    printHint: "Mise en page A4 sur une colonne, optimisée pour la lecture par un ATS.",
    themeLabel: "Thème",
    themeLight: "Clair",
    themeDark: "Sombre"
  }
};
