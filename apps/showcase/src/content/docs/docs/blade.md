---
title: Laravel / Blade
description: Use Talos UI in a Laravel app — CSS + optional web components.
---

The CSS layer is class-based, so Blade needs only the stylesheet (plus a
module script for the web components). No Composer package required.

## Vendor the assets

Copy the package's static files into `public/vendor/talos-ui/`:

```
public/vendor/talos-ui/
  talos.css
  tokens.css
  fonts/oxanium-latin.woff2
  fonts/oxanium-latin-ext.woff2
  dist/              (the whole dist directory)
    wc/index.js
    chunk-*.js
```

Copy `dist/` as a directory, not `dist/wc/index.js` on its own: `index.js`
imports its components from `../chunk-*.js` (32 shared chunks in 0.12.1), so
a lone copy fails in the browser with 404s on every chunk.

A Bun/npm postinstall keeps the copy in sync:

```jsonc
// package.json
"scripts": {
  "postinstall": "mkdir -p public/vendor/talos-ui && cp -R node_modules/@j_shelfwood/talos-ui/src/{talos.css,tokens.css,fonts} node_modules/@j_shelfwood/talos-ui/dist public/vendor/talos-ui/"
}
```

## Layout

```blade
{{-- resources/views/layouts/app.blade.php --}}
<link rel="stylesheet" href="{{ asset('vendor/talos-ui/talos.css') }}">
<script type="module" src="{{ asset('vendor/talos-ui/dist/wc/index.js') }}"></script>
```

## Markup

```blade
<div class="glass-panel interactive-panel">
  <div class="glass-panel-content">
    <h2>{{ $title }}</h2>
  </div>
</div>

<a class="talos-button" href="{{ route('contact') }}">Contact</a>

<talos-panel panel-width="360" panel-height="180">
  <talos-corner edge="top-right" radius="18"></talos-corner>
</talos-panel>
```

The cursor-sheen + ambient-grid scripts from the README work unchanged in a
Blade layout.
