---
title: Web components
description: Composable notched-panel custom elements.
---

Importing the `wc` entry registers `<talos-panel>`, `<talos-corner>`,
`<talos-notch>`.

```html
<script type="module">import "@shelfwood/talos-ui/wc";</script>

<talos-panel panel-width="400" panel-height="220" animate>
  <talos-corner edge="top-right" radius="22"></talos-corner>
  <talos-corner edge="bottom-left" radius="22"></talos-corner>
  <talos-notch edge="top" width="80" depth="14"></talos-notch>
  <h3>Composable geometry</h3>
</talos-panel>
```

## `<talos-panel>`

| Attribute | Default | Notes |
| --- | --- | --- |
| `panel-width` / `panel-height` | 400 / 200 | viewBox dimensions |
| `fill` | `--talos-hud-fill` | panel fill |
| `edge` | `--talos-hud-edge` | border color |
| `stroke-width` | 1 | hairline border |
| `animate` | — | stroke-draws outline on first render |
| `animation-duration` | 800 | ms |

## `<talos-corner edge radius>`

`edge`: `top-left` `top-right` `bottom-right` `bottom-left`. `radius`: chamfer px.

## `<talos-notch edge width depth>`

`edge`: `top` `right` `bottom` `left`. Centered edge cut-out — the one motif
the CSS layer doesn't provide. Decorators are reactive: add/remove children
and the outline re-renders.
