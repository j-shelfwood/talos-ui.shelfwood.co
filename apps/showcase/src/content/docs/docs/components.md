---
title: Panels & buttons
description: The CSS-layer chrome — glass panels, brackets, buttons, chamfer.
---

## Glass panel

```html
<div class="glass-panel interactive-panel">
  <span class="hud-bracket hud-bracket--tl"></span>
  <span class="hud-bracket hud-bracket--br"></span>
  <div class="glass-panel-content">…</div>
</div>
```

Add `interactive-panel` for hover lift, cursor sheen, and viewfinder brackets.
Variants: `.glass-panel--navbar-dense`, `.glass-panel--reading`.

## Button

```html
<a class="talos-button" href="#">Primary</a>
<button class="talos-button talos-button--secondary">Secondary</button>
<button class="talos-button talos-button--ghost talos-button--sm">Ghost</button>
```

## Chamfer utilities

`.chamfer-tr` (flags) and `.chamfer-br` (CTAs) cut a single corner via
`clip-path`. Pair with a host/inset pseudo pair for a hairline border.
