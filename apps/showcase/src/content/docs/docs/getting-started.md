---
title: Getting started
description: Install and use Talos UI in Astro, Laravel/Blade, or plain HTML.
---

Talos UI ships in three layers — take what you need.

| Layer | What | Needs |
| --- | --- | --- |
| CSS | `talos.css` + `tokens.css` + fonts | nothing (a `<link>`) |
| Web components | `<talos-panel>` `<talos-corner>` `<talos-notch>` | a module script |
| Astro wrappers | `GlassPanel.astro` `Button.astro` | Astro |

## Install

```sh
bun add @shelfwood/talos-ui
```

## Astro

```astro
---
import "@shelfwood/talos-ui/talos.css";
import GlassPanel from "@shelfwood/talos-ui/astro/GlassPanel.astro";
---
<GlassPanel as="a" href="/work"><h2>Projects</h2></GlassPanel>
```

## Plain HTML / Laravel

```html
<link rel="stylesheet" href=".../@shelfwood/talos-ui/src/talos.css" />
<div class="glass-panel interactive-panel">
  <div class="glass-panel-content">…</div>
</div>
```

See **Web components** for notched panels and **Laravel / Blade** for the
asset-vendoring pattern.
