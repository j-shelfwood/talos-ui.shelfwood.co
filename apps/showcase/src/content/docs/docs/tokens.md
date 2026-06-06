---
title: Tokens
description: The --talos-* custom properties that define the system.
---

Every design decision is a `--talos-*` custom property in `tokens.css`. Override
any on `:root` (or any scope) to retheme — components read the tokens, never
hard-coded values, so one override cascades everywhere.

## The HSL-channel pattern

Colors are stored as **bare HSL channels** (`H S% L%`), not finished colors.
You compose them into a color — with optional opacity — at the use site:

```css
/* The token holds only the channels: */
--talos-foreground-hsl: 0 0% 100%;        /* white */

/* Compose, opaque: */
color: hsl(var(--talos-foreground-hsl));
/* Compose, with alpha: */
border-color: hsl(var(--talos-foreground-hsl) / 0.2);
```

For convenience each channel token also has a resolved opaque companion
(`--talos-foreground`, `--talos-accent`, …) you can use directly when you don't
need alpha.

## Palette (monochrome)

| Token | Value | Role |
| --- | --- | --- |
| `--talos-background-hsl` | `0 0% 0%` | page void |
| `--talos-foreground-hsl` | `0 0% 100%` | primary text |
| `--talos-muted-hsl` | `0 0% 10%` | raised surfaces |
| `--talos-muted-foreground-hsl` | `0 0% 60%` | labels, secondary text |
| `--talos-border-hsl` | `0 0% 20%` | dividers, edges |
| `--talos-accent-hsl` | `140 90% 60%` | the one accent — status pulse, live state |

## Status channels

| Token | Value | Used by |
| --- | --- | --- |
| `--talos-success-hsl` | `140 90% 60%` | passes, online |
| `--talos-warning-hsl` | `38 92% 60%` | caution, `warn` thresholds |
| `--talos-danger-hsl` | `0 80% 62%` | errors, `crit` thresholds |
| `--talos-info-hsl` | `205 90% 62%` | informational |

The instruments (`<talos-gauge>` et al.) snap through success → warning → danger
as values cross their `warn` / `crit` marks.

## Surfaces & text roles

| Token | Value |
| --- | --- |
| `--talos-surface-0` … `--talos-surface-4` | `0 0% 0%` → `4%` → `7%` → `10%` → `14%` (elevation ladder) |
| `--talos-text-primary` | `hsl(0 0% 100% / 0.92)` |
| `--talos-text-secondary` | `hsl(0 0% 100% / 0.62)` |
| `--talos-text-tertiary` | `hsl(0 0% 100% / 0.4)` |
| `--talos-text-disabled` | `hsl(0 0% 100% / 0.28)` |

## Type

| Token | Value |
| --- | --- |
| `--talos-font-display` | `"Oxanium", "Eurostile", "Bank Gothic", system-ui, sans-serif` |
| `--talos-tracking-hud` | `0.18em` |
| `--talos-tracking-hud-tight` | `0.08em` |

## Chamfer

| Token | Value | Cuts |
| --- | --- | --- |
| `--talos-chamfer` | `14px` | panels (top-right + bottom-left) |
| `--talos-chamfer-btn` | `10px` | buttons (bottom-right) |
| `--talos-chamfer-flag` | `8px` | pills / flags (top-right) |

## Motion

Easing and duration tokens are consumed via `var()` — they are the whole value,
e.g. `transition: color var(--talos-dur-fast) var(--talos-ease-out)`, not bare
numbers.

| Token | Value |
| --- | --- |
| `--talos-ease-glass` | `cubic-bezier(0.22, 0.68, 0, 1.2)` (gentle overshoot) |
| `--talos-ease-liquid` | `cubic-bezier(0.34, 1.4, 0.64, 1)` (stronger settle) |
| `--talos-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` (deceleration only) |
| `--talos-dur-fast` | `180ms` |
| `--talos-dur-mid` | `360ms` |
| `--talos-dur-slow` | `600ms` |

## Retheme

The highest-leverage overrides, in order:

1. **`--talos-accent-hsl`** — the single accent; match it to your brand.
2. **`--talos-background-hsl` / `--talos-foreground-hsl`** — invert for light mode.
3. **`--talos-chamfer` / `--talos-chamfer-btn`** — soften or sharpen the cuts.
4. **`--talos-dur-*`** — speed motion up or down globally.
5. **`--talos-tracking-hud` / `--talos-font-display`** — change the typographic voice.

Shift just the accent to a cool blue — every gauge, dot and live edge follows:

```css
:root {
  --talos-accent-hsl: 205 90% 60%;
}
```

A fuller retheme — light mode with a sharper chamfer and snappier motion:

```css
:root {
  --talos-background-hsl: 0 0% 100%;
  --talos-foreground-hsl: 0 0% 0%;
  --talos-muted-hsl: 0 0% 92%;
  --talos-muted-foreground-hsl: 0 0% 40%;
  --talos-border-hsl: 0 0% 80%;

  --talos-accent-hsl: 280 80% 50%;

  --talos-chamfer: 8px;
  --talos-chamfer-btn: 6px;

  --talos-dur-fast: 120ms;
  --talos-dur-mid: 240ms;
}
```

Full rationale and the complete token list live in the package `DESIGN.md`.
