/// <reference path="../.astro/types.d.ts" />

// Allow the talos-ui custom elements in Astro templates.
declare namespace astroHTML.JSX {
  interface IntrinsicElements {
    "talos-panel": Record<string, unknown>;
    "talos-corner": Record<string, unknown>;
    "talos-notch": Record<string, unknown>;
  }
}
