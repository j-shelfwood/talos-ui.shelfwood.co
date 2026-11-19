import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import talosCodeTheme from "./talos-code-theme.mjs";

// https://astro.build
// Docs are hand-built (DocsShell.astro + [...slug].astro) using the Talos
// component library itself — no Starlight. MDX support is kept for the two
// component-demo pages.
export default defineConfig({
  site: "https://talos-ui.shelfwood.co",
  // /manifesto is the front door — a memorable URL that resolves to the
  // canonical philosophy doc rather than a duplicate page. trailingSlash
  // defaults to "ignore", so a single key matches both /manifesto and
  // /manifesto/ — defining both collides (two static routes, one output).
  redirects: {
    "/manifesto": "/docs/philosophy/",
  },
  integrations: [mdx(), sitemap()],
  markdown: {
    // talos theme: every token colour is a var(--talos-code-*) defined in
    // DocsShell, so code tracks the Talos palette. The transformer puts the
    // chamfer engine classes on every fenced <pre>, so code blocks draw their
    // cut like any other talos surface.
    shikiConfig: {
      theme: talosCodeTheme,
      transformers: [
        {
          pre(node) {
            this.addClassToHast(node, "talos-chamfer talos-chamfer--btn");
          },
        },
      ],
    },
  },
});
