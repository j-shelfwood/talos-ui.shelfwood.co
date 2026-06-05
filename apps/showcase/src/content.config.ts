import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Plain content collection for the hand-built docs (Starlight removed).
// Markdown/MDX bodies live under src/content/docs/**; the [...slug] route
// renders them inside DocsShell.astro.
const docs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { docs };
