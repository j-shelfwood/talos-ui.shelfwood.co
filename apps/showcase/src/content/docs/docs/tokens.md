---
title: Tokens
description: The --talos-* custom properties that define the system.
---

Every design decision is a `--talos-*` custom property in `tokens.css`.
Override any on `:root` (or a scope) to retheme.

## Palette (monochrome)

| Token | Value |
| --- | --- |
| `--talos-background-hsl` | `0 0% 0%` |
| `--talos-foreground-hsl` | `0 0% 100%` |
| `--talos-muted-hsl` | `0 0% 10%` |
| `--talos-muted-foreground-hsl` | `0 0% 60%` |
| `--talos-border-hsl` | `0 0% 20%` |
| `--talos-accent-hsl` | `140 90% 60%` |

HSL channel vars compose opacity: `hsl(var(--talos-foreground-hsl) / 0.6)`.

## Type

| Token | Value |
| --- | --- |
| `--talos-font-display` | Oxanium, … |
| `--talos-tracking-hud` | `0.18em` |
| `--talos-tracking-hud-tight` | `0.08em` |

## Chamfer / motion

| Token | Value |
| --- | --- |
| `--talos-chamfer` | `14px` |
| `--talos-chamfer-btn` | `10px` |
| `--talos-ease-glass` | `cubic-bezier(.22,.68,0,1.2)` |
| `--talos-ease-liquid` | `cubic-bezier(.34,1.4,.64,1)` |
| `--talos-dur-fast/mid/slow` | `180 / 360 / 600ms` |

Full rationale in the package `DESIGN.md`.
