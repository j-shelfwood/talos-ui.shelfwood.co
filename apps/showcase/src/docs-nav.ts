// Single source of truth for the docs sidebar — consumed by DocsShell.astro.
// Slugs match the content-collection entry ids under src/content/docs/**.
//
// IA: one page per component. Component groups (Forms, Feedback, Data,
// Navigation, Panels, Instruments) are nav categories, each holding a page per
// component + its sub-variants. Conceptual/start pages keep their own groups.
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
    items: [
      { label: "Philosophy", slug: "docs/philosophy" },
      { label: "Form encodes function", slug: "docs/form-encodes-function" },
    ],
  },
  {
    label: "Start",
    items: [
      { label: "Getting started", slug: "docs/getting-started" },
      { label: "Tokens", slug: "docs/tokens" },
      { label: "Recipes", slug: "docs/recipes" },
      { label: "Laravel / Blade", slug: "docs/blade" },
    ],
  },
  {
    label: "Panels & chrome",
    items: [
      { label: "Glass panel", slug: "docs/components/glass-panel" },
      { label: "Button", slug: "docs/components/button" },
      { label: "Notched panel", slug: "docs/components/notched-panel" },
      { label: "Console shell", slug: "docs/components/console" },
    ],
  },
  {
    label: "Forms",
    items: [
      { label: "Field & label", slug: "docs/forms/field" },
      { label: "Input & textarea", slug: "docs/forms/input" },
      { label: "Input group & search", slug: "docs/forms/input-group" },
      { label: "Select", slug: "docs/forms/select" },
      { label: "Checkbox", slug: "docs/forms/checkbox" },
      { label: "Radio", slug: "docs/forms/radio" },
      { label: "Switch", slug: "docs/forms/switch" },
      { label: "Range", slug: "docs/forms/range" },
      { label: "Fieldset", slug: "docs/forms/fieldset" },
    ],
  },
  {
    label: "Feedback",
    items: [
      { label: "Badge", slug: "docs/feedback/badge" },
      { label: "Alert", slug: "docs/feedback/alert" },
      { label: "Toast", slug: "docs/feedback/toast" },
      { label: "Progress", slug: "docs/feedback/progress" },
      { label: "Spinner", slug: "docs/feedback/spinner" },
      { label: "Skeleton", slug: "docs/feedback/skeleton" },
      { label: "Tooltip", slug: "docs/feedback/tooltip" },
      { label: "Empty state", slug: "docs/feedback/empty" },
      { label: "Status legend", slug: "docs/feedback/status" },
    ],
  },
  {
    label: "Data",
    items: [
      { label: "Table", slug: "docs/data/table" },
      { label: "Stat", slug: "docs/data/stat" },
      { label: "Code block", slug: "docs/data/code" },
      { label: "Log feed", slug: "docs/data/log" },
      { label: "Avatar", slug: "docs/data/avatar" },
      { label: "Meter", slug: "docs/data/meter" },
      { label: "Definition list", slug: "docs/data/definition-list" },
    ],
  },
  {
    label: "Navigation",
    items: [
      { label: "Tabs", slug: "docs/nav/tabs" },
      { label: "Breadcrumbs", slug: "docs/nav/breadcrumbs" },
      { label: "Menu", slug: "docs/nav/menu" },
      { label: "Sidebar", slug: "docs/nav/sidebar" },
      { label: "Pagination", slug: "docs/nav/pagination" },
      { label: "Stepper", slug: "docs/nav/stepper" },
      { label: "Toolbar", slug: "docs/nav/toolbar" },
    ],
  },
  {
    label: "Instruments",
    items: [
      { label: "Overview", slug: "docs/instruments/overview" },
      { label: "Gauge", slug: "docs/instruments/gauge" },
      { label: "Meter", slug: "docs/instruments/meter" },
      { label: "Trend", slug: "docs/instruments/trend" },
      { label: "Flow", slug: "docs/instruments/flow" },
      { label: "Orbital", slug: "docs/instruments/orbital" },
      { label: "Readout", slug: "docs/instruments/readout" },
      { label: "Spark", slug: "docs/instruments/spark" },
      { label: "Dots", slug: "docs/instruments/dots" },
      { label: "Delta", slug: "docs/instruments/delta" },
      { label: "Stat", slug: "docs/instruments/stat" },
      { label: "LED", slug: "docs/instruments/led" },
      { label: "Toggle", slug: "docs/instruments/toggle" },
    ],
  },
];

/** "/docs/getting-started/" from a collection id. */
export const slugToHref = (slug: string) => `/${slug}/`;
