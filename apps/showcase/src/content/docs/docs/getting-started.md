---
title: Getting started
description: Install and use Talos UI in Astro, Laravel/Blade, or plain HTML.
---

Talos UI ships in three layers — take what you need. The CSS layer needs no
build step; the web components add a single module script; the Astro wrappers
are pure developer-experience sugar on top.

## Which layer when

| Layer | Reach for it when | You add | Cost |
| --- | --- | --- | --- |
| **CSS** | You want chamfered panels, buttons, the grid and the ambient backdrop — styled with classes. | one `<link>` / `import` | ~12 KB gzip |
| **+ Web components** | You need notched panels or the live instruments (gauge, meter, trend, flow, orbital, readout). | a `<script type="module">` | +18 KB gzip |
| **Astro wrappers** | You're on Astro and want `<GlassPanel>` / `<Button>` instead of raw markup. | a component import | 0 KB (DX only) |

## Install

```sh
bun add @j_shelfwood/talos-ui
```

## Astro

CSS layer only:

```astro
---
import "@j_shelfwood/talos-ui/talos.css";
---
<div class="glass-panel interactive-panel">
  <div class="glass-panel-content talos-pad"><h2>Hello</h2></div>
</div>
```

With the Astro wrappers (recommended on Astro):

```astro
---
import "@j_shelfwood/talos-ui/talos.css";
import GlassPanel from "@j_shelfwood/talos-ui/astro/GlassPanel.astro";
import Button from "@j_shelfwood/talos-ui/astro/Button.astro";
---
<GlassPanel as="a" href="/work"><h2>Projects</h2></GlassPanel>
<Button href="/contact">Get in touch</Button>
```

With web components (notched panels + instruments):

```astro
---
import "@j_shelfwood/talos-ui/talos.css";
---
<script>import "@j_shelfwood/talos-ui/wc";</script>

<talos-panel panel-width="400" panel-height="220">
  <talos-corner edge="top-right" radius="22"></talos-corner>
  <talos-notch edge="top" width="80" depth="14"></talos-notch>
  <h3>Composable geometry</h3>
</talos-panel>
```

## Plain HTML

Point the stylesheet at the package under `node_modules` (dev) or a copy you
vendor into your public assets (prod — see Laravel below):

```html
<link rel="stylesheet" href="/node_modules/@j_shelfwood/talos-ui/src/talos.css" />

<div class="glass-panel interactive-panel">
  <div class="glass-panel-content talos-pad">…</div>
</div>

<a class="talos-button" href="#">Launch</a>
```

The ambient grid follows the cursor — it reads `--talos-cursor-x/y` off the root
element. The pack ships the tracking as an opt-in module: smooth-lerped (the grid
eases toward the pointer, not snaps), idempotent across view-transition swaps, and
capability-honest (parked at center under `prefers-reduced-motion` or on touch):

```html
<div class="ambient-overlay"></div>
<script type="module">
  import { initAmbientCursor } from "@j_shelfwood/talos-ui/ambient";
  initAmbientCursor(); // optionally: initAmbientCursor({ lerp: 0.12 })
</script>
```

Or, if you don't want the module, write the two properties yourself (no smoothing):

```html
<div class="ambient-overlay"></div>
<script>
  addEventListener("pointermove", (e) => {
    document.documentElement.style.setProperty("--talos-cursor-x", e.clientX + "px");
    document.documentElement.style.setProperty("--talos-cursor-y", e.clientY + "px");
  });
</script>
```

## CSS entry points

Import the whole surface with `all.css`, or pull only the modules you use:

| Import | Covers |
| --- | --- |
| `@j_shelfwood/talos-ui/all.css` | everything below, in dependency order |
| `@j_shelfwood/talos-ui/talos.css` | tokens + core: panels, button, chamfer, ambient |
| `@j_shelfwood/talos-ui/talos-layout.css` | grid + spans, padding, flex, eyebrow, dot |
| `@j_shelfwood/talos-ui/talos-forms.css` | inputs, select, checkbox/radio/switch, range |
| `@j_shelfwood/talos-ui/talos-feedback.css` | badges, alerts, toasts, progress, spinner |
| `@j_shelfwood/talos-ui/talos-data.css` | tables, stats, code, log, avatar, meter |
| `@j_shelfwood/talos-ui/talos-nav.css` | tabs, breadcrumbs, menu, sidebar, stepper |
| `@j_shelfwood/talos-ui/talos-console.css` | zoned fixed-viewport shell |

`tokens.css` is pulled in by `talos.css`, so you never import it directly.

## Laravel / Blade

The CSS layer is class-based, so Blade needs only the stylesheet (plus the
module script if you want the web components). Vendor the static assets into
`public/` so they ship with your app — a `package.json` postinstall step keeps
the copy fresh:

```jsonc
// package.json
"scripts": {
  "postinstall": "cp -R node_modules/@j_shelfwood/talos-ui/src/{talos.css,tokens.css,fonts} public/vendor/talos-ui/ && cp node_modules/@j_shelfwood/talos-ui/dist/wc/index.js public/vendor/talos-ui/wc.js"
}
```

```blade
<link rel="stylesheet" href="{{ asset('vendor/talos-ui/talos.css') }}">
<script type="module" src="{{ asset('vendor/talos-ui/wc.js') }}"></script>

<div class="glass-panel interactive-panel">
  <div class="glass-panel-content talos-pad">…</div>
</div>
<talos-panel panel-width="360" panel-height="180">…</talos-panel>
```

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| No cursor sheen on panels | the ambient `pointermove` listener isn't running | add the snippet under **Plain HTML** (Astro layouts wire it for you) |
| `<talos-*>` elements render unstyled / inert | `@j_shelfwood/talos-ui/wc` not imported | import the `wc` entry once, before the elements are used |
| Fonts 404 | the `@font-face` URLs can't resolve relative to your CSS | use the vendor copy so `fonts/` sits beside `talos.css` |

See **Web components** for the full instrument set and **Tokens** to retheme.
