// Single source of truth for the docs sidebar — consumed by DocsShell.astro.
// Slugs match the content-collection entry ids under src/content/docs/**.
export interface DocsNavItem {
  label: string;
  slug: string; // collection id, e.g. "docs/getting-started"
}
export interface DocsNavGroup {
  label: string;
  items: DocsNavItem[];
}

export const docsNav: DocsNavGroup[] = [
  {
    label: "Manifesto",
    items: [{ label: "Philosophy", slug: "docs/philosophy" }],
  },
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
];

/** "/docs/getting-started/" from a collection id. */
export const slugToHref = (slug: string) => `/${slug}/`;
