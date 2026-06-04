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
  wc.js          (from dist/wc/index.js)
```

A Bun/npm postinstall or a small copy script keeps them in sync.

## Layout

```blade
{{-- resources/views/layouts/app.blade.php --}}
<link rel="stylesheet" href="{{ asset('vendor/talos-ui/talos.css') }}">
<script type="module" src="{{ asset('vendor/talos-ui/wc.js') }}"></script>
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
