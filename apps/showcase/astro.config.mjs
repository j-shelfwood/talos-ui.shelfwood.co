import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// https://astro.build
// Docs are hand-built (DocsShell.astro + [...slug].astro) using the Talos
// component library itself — no Starlight. MDX support is kept for the two
// component-demo pages.
export default defineConfig({
  site: "https://talos-ui.shelfwood.co",
  integrations: [mdx()],
  markdown: {
    // css-variables theme: shiki emits var(--astro-code-*) instead of inline
    // hex colors, so code tokens track the Talos palette (defined in
    // DocsShell). It also drops the inline background-color on <pre>, letting
    // the two-layer chamfer fill show through.
    shikiConfig: { theme: "css-variables" },
  },
});
