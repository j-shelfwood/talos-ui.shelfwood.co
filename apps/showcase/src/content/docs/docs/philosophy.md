---
title: Philosophy
description: The interface is an instrument, not a document. Form encodes function.
---

## The thesis

**The interface is an instrument, not a document.**

A document presents information that was true when it was authored. You *read*
it, top to bottom, and then you are done. The web inherited this from print —
the scrolling page, the A4/Letter column, the margins, the reading line — and
most UI kits are still, underneath the styling, decorated documents.

An instrument is different. It depicts a **live system** and lets you
**operate** it. A speedometer, an oscilloscope, a mixing console, a flight HUD,
a synth, a reactor panel — these earn their density because every glowing thing
is bound to something real and present. You don't read an instrument. You
*monitor* it and you *act* on it.

Talos UI is the toolkit for building instruments — consoles, monitors, control
panels, dashboards that are actually dashes-of-board — not prettier versions of
document-shaped pages.

## The law

**Form encodes function.** Every color, motion, glow, and shape is bound to
domain state. There is no purely decorative visual property.

If a panel pulses, something is happening at that rate. If an edge is green,
that channel is healthy. If a value is visually loud, it is large. Decoration
that carries no information is forbidden — not because it is ugly, but because
it *lies*. It implies meaning where there is none, and that trains the user to
ignore your signals.

Every component must pass one test:

> **Does this render meaning, or does it just look cool?**

Render meaning → ship it. Just looks cool → bind it to something, or cut it.

## The five principles

1. **Reject the page, embrace the panel.** Viewport-native zones over scrolling
   columns; persistent ambient context over page-by-page navigation; update in
   place over reflow. A cockpit does not scroll.
2. **Form encodes function.** The law, first among equals — the other four
   serve it.
3. **Motion is telemetry, not transition.** Animate the *state itself*, not the
   change between states. A flow line's speed *is* its throughput. A frozen
   screenshot should lose information the moving interface carries.
4. **Density is a feature, legibility is the discipline.** Pack 10× the
   information of a "clean" dashboard while being *more* legible — because every
   element is doing semantic work.
5. **The system has a state, and it shows.** The interface is never neutral; it
   always depicts idle / nominal / degraded / alarmed. The ambient layer and
   the "doodads" are welcome only when they encode state.

## The honesty clause

All of this degrades honestly under `prefers-reduced-motion`. When motion is
removed, the information it carried must survive in a static form — a number, a
color band, a position. Telemetry that vanishes when motion is off was
decoration wearing a function's coat.

## What it means for the library

The center of gravity is the **data-binding primitive layer** — components that
take a value and render its *meaning* (gauges, trend lines, threshold meters,
flow lines) — and the **non-document layouts** that show the alternative to the
A4 column. The chamfered panels and the card gallery are the frame and the
reference. The point is the instruments.
