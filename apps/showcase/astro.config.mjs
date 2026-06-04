import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build
export default defineConfig({
  site: "https://talos-ui.shelfwood.co",
  integrations: [
    starlight({
      title: "Talos UI",
      description:
        "Dark-monochrome HUD design system — chamfered panels, Oxanium type, ambient grid, composable web components.",
      // Custom landing page at "/" is a plain Astro page; Starlight owns /docs.
      sidebar: [
        {
          label: "Start",
          items: [
            { label: "Getting started", slug: "docs/getting-started" },
            { label: "Tokens", slug: "docs/tokens" },
          ],
        },
        {
          label: "Components",
          items: [
            { label: "Panels & buttons", slug: "docs/components" },
            { label: "Web components", slug: "docs/web-components" },
            { label: "Laravel / Blade", slug: "docs/blade" },
          ],
        },
      ],
      customCss: ["@shelfwood/talos-ui/tokens.css"],
    }),
  ],
});
