import type { Contact } from "./types";

export const siteUrl = "https://roneyrogerio.dev";

export const contact: Contact = {
  email: "contact@roneyrogerio.dev",
  phone: "+55 43 99196-1524",
  phoneHref: "+5543991961524",
  whatsapp: "https://wa.me/5543991961524",
  website: siteUrl,
  linkedin: "https://www.linkedin.com/in/roneyrogerio/",
  github: "https://github.com/roneyrogerio",
  location: "Apucarana, Paraná, Brasil",
  addressLocality: "Apucarana",
  addressRegion: "PR",
  addressCountry: "BR"
};

export const locales = ["pt-br", "en-us"] as const;
