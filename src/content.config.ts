import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const cv = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/cv"
  }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    email: z.string(),
    linkedin: z.string().url(),
    github: z.string().url(),
    seoTitle: z.string(),
    seoDescription: z.string()
  })
});

export const collections = {
  cv
};
