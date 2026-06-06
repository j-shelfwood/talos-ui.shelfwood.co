# Talos UI — Migration-Readiness Feedback

**Audited against:** `shelfwood.co` (the reference consumer the pack was extracted from)
**Date:** 2026-06-06 (audited) · **Updated:** §2/§3/§4/§7-partial backports landed
**Pack version:** `0.0.1` (unpublished)
**Verdict:** **Closer, but not yet a published drop-in.** The §10 *prereqs* are now
largely done — the missing utilities, the GlassPanel repaint, glass/prose tokens,
and the lerped ambient export all shipped, and the band logic has unit tests. The
two remaining blockers to "suitable" are **release hygiene** (not published to npm;
no Astro-6 smoke test) and the **§1 coverage decision** (which of the 22 missing
components are design-system vs site-local). The aesthetic extraction is faithful
and the build + tests are green.

This document is the gap inventory. Everything below is verified against the actual
files, not inferred.

---

## 0. Severity legend

| Tag | Meaning |
|---|---|
| 🔴 **BLOCKER** | Migration breaks or regresses visibly until fixed |
| 🟠 **GAP** | Pack lacks something the consumer needs; forces site-local code or rewiring |
| 🟡 **POLISH** | Quality/hygiene; not blocking but expected of a shippable pack |

---

## 1. Coverage gaps — components the pack does not have 🟠

The pack ships **9 Astro wrappers**. The consumer has **~31 components**. The
following **22 have no pack equivalent** and would remain site-local after
migration (~70% of the surface area):

**Layout / chrome**
- `Navbar`, `NavLogo`, `Footer`, `SEO`, `BentoGrid`

**Contact subsystem**
- `ContactFormPanel`, `ContactInfoPanel`, `ContactMethod`

**Content panels**
- `EthosPanel`, `PersonalHeroPanel`, `BlogPostPanel`
- `MiniProfileCard`, `NavigationCard`, `PreviewCard`

**Interactive / utility**
- `AnimatedFileTree`, `TerminalDemo`, `ContextAssembler`, `Toc`, `Mermaid`
- `Tag`, `BackButton`, `Logo`

**Decision needed:** which of these are *design-system* concerns (promote into the
pack: `Tag`, `BackButton`, `Footer`, `Navbar`, contact panels) vs *site-specific*
(keep local: `Mermaid`, `SEO`, `PersonalHeroPanel`, `MiniProfileCard`). Until that
line is drawn, "migrate to the pack" has no defined endpoint.

---

## 2. Missing CSS utilities the consumer actively uses 🔴

Verified **absent** from the pack (`grep` over `packages/talos-ui/src`):

| Missing | Used by (consumer) | Impact |
|---|---|---|
| `.anim-replay` | `TerminalDemo`, `ContextAssembler`, `AnimatedFileTree` | replay buttons render unstyled |
| `.noise-overlay-subtle` | `Layout.astro` (every non-bento page) | site-wide film-grain disappears |

These are not optional polish — they're referenced on shipped pages. Either add
them to `talos.css`/`talos-layout.css` or the site must keep a local utilities
sheet (defeating part of the migration).

---

## 3. Missing tokens 🟠

Verified absent (no `--talos-*` equivalent exists):

| Site token | Used by | Note |
|---|---|---|
| `--color-glass-bg` | `AnimatedFileTree` | no `--talos-glass-bg` in `tokens.css` |
| `--color-glass-border` | `AnimatedFileTree` | no `--talos-glass-border` |
| `--glass-blur-sm` / `--glass-blur-md` | — | defined but unused; safe to drop, but undocumented as dropped |
| `--glass-reflection` | — | unused; same |
| `--prose-*` (×11) | blog prose | not tokenized in pack — colors are **inlined** into `.talos-prose` rules, so they can't be re-themed via `:root` overrides like every other token |

The `--prose-*` inlining breaks the pack's own stated promise ("override any
`--talos-*` on `:root` to retheme"). Prose color is the one area you *can't*
retheme without editing `talos-blog.css`.

---

## 4. Behavioral regressions vs the consumer 🔴

### 4a. GlassPanel — dropped Chromium clip-path repaint
- **Consumer** (`ui/GlassPanel.astro:57-77`): registers `astro:after-swap` →
  `repaintPanels()` to fix a stale clip-path paint cache on persisted panels after
  client-side navigation (corners render wrong without it).
- **Pack** (`astro/GlassPanel.astro`): only binds the pointer-sheen on
  `astro:page-load`. **No `after-swap` repaint.**
- **Result:** view-transition navigations regress on affected Chromium builds.
  The workaround must be ported into the pack wrapper.

### 4b. Ambient grid — pack ships CSS but no JS ✅ RESOLVED
- ~~Pack ships `.ambient-overlay` (the visual) and reads `--talos-cursor-x/y`, but
  ships **no script** to write them.~~
- **Resolved:** the lerped tracker now ships as `@shelfwood/talos-ui/ambient`
  (`initAmbientCursor()`) — smooth-lerp, idempotent across view-transition swaps,
  capability-honest (parked centre under reduced-motion / touch), writing
  `--talos-cursor-x/y`. Built to `dist/ambient.{js,d.ts}`; documented in
  getting-started. The raw inline snippet remains in the README as a no-dependency
  fallback. Consumers migrating from `scripts/ambient-cursor.ts` can delete it and
  import the export.

---

## 5. Direction-of-generalization mismatch 🟠

Several pack wrappers are **better** than the consumer's (parameterized vs
hardcoded) — but that means migration is *rewiring*, not re-pointing imports:

| Wrapper | Consumer hardcodes | Pack expects as props |
|---|---|---|
| `HeroPanel` | vitals, `status`, `version`, `SYS://HOME` footer, `name` | `vitals[]`, `status`, `version`, `footer`, `eyebrow` |
| `MissionPanel` | title, `//02` slug, `// Mission` label, axes, footer | `axes[]`, `slug`, `label`, `footer` |
| `ToolkitPanel` | `Expert`/`Intermediate` union, derived emphasis | generic `level` string + explicit `emphasis` |

The pack interface is the right design. Flag for awareness: each panel swap
requires lifting baked-in content into props + verifying the page still renders.
The pack `HeroPanel` also has **no `name`/aria-label** concept the consumer uses —
genuine missing prop, not just a rename.

### Icon/visual deltas (a design decision, not mechanical)
- `ProjectPanel` / `ServicePanel` / `ToolkitPanel`: consumer uses `astro-icon`
  (`Icon`) + the local `Tag` component. Pack uses **text glyphs** (`↗` / `→`) and
  built-in `talos-tag`. Adopting the pack **changes rendered icons**. Intentional?
  If yes, document it; if no, the pack needs an icon slot.
- `ServicePanel`: pack has a `footer` prop (default `SYS://SERVICE`); consumer
  dropped the footer entirely. Pack also has **no icon support** where the
  consumer renders a Lucide `iconName`.
- `FeatureItem`: pack has a built-in `+` marker; consumer uses a `slot="icon"`.
  Pack has no slot → can't pass a custom marker.

---

## 6. Tailwind coupling — the structural risk 🔴

- Consumer uses **Tailwind v4** (`@tailwindcss/vite`, `@tailwindcss/typography`)
  for **all layout**: `grid-cols-*`, `flex`, gap/spacing scales, responsive
  prefixes (`md:`), `group-hover:*`.
- Pack is deliberately **zero-Tailwind** and ships its own `talos-grid` /
  `talos-pad` / `talos-stack` / `talos-row`.
- **The HUD chrome migrates cleanly; the layout does not.** Two honest options,
  both with cost:
  1. **Keep Tailwind** alongside the pack (lowest friction; pack provides chrome,
     Tailwind provides layout). Recommended for Phase 1.
  2. **Adopt pack layout classes** and drop Tailwind (large markup rewrite across
     every page and panel).
- The pack docs don't address "you still need a layout system" — a consumer
  reading the README would not learn that grid/spacing is out of scope.

---

## 7. Release & repo hygiene 🟡

Verified state of the pack as a *distributable*:

- 🔴 **Not published** — `npm view @shelfwood/talos-ui` → `404`. `bun add` from the
  README does not work today. Only the in-repo `workspace:*` link resolves.
- 🟡 **No `astro` peerDependency** — the `./astro/*` wrappers are `.astro` files;
  consumers need Astro, but `package.json` declares no peer. Version skew is real:
  showcase runs **Astro 5**, shelfwood.co runs **Astro 6**. Wrappers are plain
  components (no version-specific APIs) so likely fine, but **untested on Astro 6**.
- 🟡 **No tests** — zero unit/visual tests in the pack. The 7 data instruments
  (`gauge`/`meter`/`trend`/`flow`/`orbital`/`readout`/`sheen`) have threshold-band
  logic (`warn`/`crit` → success/warning/danger) that is untested. The git log
  shows a past "live-update bug" (`baa2539`, `dad5d56`) — exactly the class of
  regression a test would catch.
- 🟡 **No CHANGELOG**, no `.github` CI. At `0.0.1` with no changelog, consumers
  can't track breaking changes across the rename-heavy surface.
- 🟡 **CSS shipped from `src/`, not `dist/`** — the `exports` map points stylesheet
  subpaths at `./src/*.css`. Fine, but it means the published tarball ships raw
  source CSS with no minification/bundling step, while the WC layer *is* built to
  `dist/`. Inconsistent. Also the README's plain-HTML example hard-codes
  `/node_modules/@shelfwood/talos-ui/src/talos.css` — a fragile path for non-bundler
  consumers.

---

## 8. Documentation gaps 🟡

- README `bun add` instruction is **non-functional** until published (§7, still open).
- ✅ **Layout out of scope** is now called out in the README and CHANGELOG (§6).
- ✅ **Ambient grid** docs updated: getting-started recommends the shipped
  `/ambient` export and notes the raw snippet is the no-smoothing fallback (§4b).
- ✅ **Prose tokenization** done (§3) — `--talos-prose-*` are public overridable tokens.
- ⬜ Still open: a migration guide for the `--color-*` → `--talos-*` rename (the
  single largest mechanical change for an existing consumer).

---

## 9. What IS ready (so this isn't all negative) ✅

- **Core HUD CSS is 1:1.** `glass-panel`, `interactive-panel`, `hud-bracket*`,
  `chamfer-*`, `ambient-overlay` (CSS), `bento-stagger`, `cascade-in` are
  byte-identical to the consumer.
- **Token coverage is ~92%** — every `--color-*`/`--ease-*`/`--dur-*`/`--tracking-*`
  /`--radius-*` has a `--talos-*` twin.
- **Fonts** are the same Oxanium woff2 subsets; only the `@font-face` path differs.
- **`GlassPanel` and `TitlePanel`** are at functional parity (modulo §4a).
- **Build is green** — `bun run build:pkg` exits `0`; `dist/wc/index.{js,d.ts}`
  generated; showcase consumes all three layers (CSS subpaths, `/wc`, `/astro`)
  via `workspace:*` and builds.
- The pack's parameterized panels are genuinely **better-designed** than the
  consumer's hardcoded ones — the generalization direction is correct.

---

## 10. Prioritized path to "suitable"

**Prereqs — backport into the pack first**
1. ✅ **DONE** — `.anim-replay`, `.noise-overlay-subtle` added to `talos-layout.css`
   (tokenized, so they retheme — an improvement over the consumer's hardcoded greys).
2. ✅ **DONE** — GlassPanel wrapper now registers `astro:after-swap → repaintPanels`
   (ported from the consumer; fixes the Chromium clip-path repaint regression).
3. ✅ **DONE (glass)** — `--talos-glass-bg` / `--talos-glass-border` added to `tokens.css`.
   ✅ **DONE (prose)** — prose colours now read public `--talos-prose-*` tokens
   (body/heading/muted/link/border/code-bg), each defaulting to the palette, so
   prose can be rethemed from `:root` independently. *(The original §3 claim that
   prose was hard-inlined was already partly stale — the values referenced palette
   tokens via private `--_*` vars; the fix exposes them as overridable public tokens.)*
4. ✅ **DONE** — lerped, idempotent, capability-honest ambient script shipped as
   `@shelfwood/talos-ui/ambient` (`initAmbientCursor()`), built to `dist/ambient.js`.
5. 🟡 **PARTIAL** — `astro` declared as an *optional* peerDependency (`>=5`); the
   CSS/WC layers don't need Astro, only the `./astro/*` wrappers do. ⬜ Still TODO:
   Astro-6 smoke test and the actual `npm publish` of `0.0.x`.

   *Remaining unresolved from this list: §1 coverage decision, §6 layout/Tailwind
   docs, §7 tests/CHANGELOG/CI/publish, §8 doc updates for the new exports.*

**Phase 1 — mechanical (the ready 30%)**
6. Point shelfwood.co at the pack's `tokens.css` + `talos.css`; delete the
   duplicated `styles/components/{chamfer,glass-panel}.css` + local theme tokens.
   Keep Tailwind for layout.

**Phase 2 — per-panel rewire**
7. Swap each Hero/Mission/Project/Service/Title/Toolkit panel to the pack wrapper,
   lifting hardcoded content into props; resolve the icon-glyph decision (§5).

**Phase 3 — coverage**
8. Decide the design-system vs site-local line (§1); promote the chosen components
   into the pack. Everything else stays local.

---

*Bottom line: the pack is a high-quality aesthetic distillation that builds and
renders. It is **not** a drop-in for shelfwood.co yet — it needs the §2/§4 backports
to avoid visible regressions, the §1 coverage decision to have a defined endpoint,
and §7 release hygiene to be installable at all. Land the §10 prereqs and Phase 1
becomes a clean, low-risk swap.*
