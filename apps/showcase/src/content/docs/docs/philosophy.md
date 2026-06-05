---
title: Philosophy
description: Live, not static — the interface depicts a running system. Form encodes function.
---

## The thesis

**Live, not static.** The interface depicts a *running system*, not an authored
snapshot.

A word of precision first, because the easy version of this is wrong. A
*document* is just information presented — and that says nothing about layout.
Documents are already multi-column, landscape, varied in proportion: a
newspaper, a broadsheet, a foldout map, a dense financial statement. "Document"
is not the enemy. The alternative to a boring interface was never "not a
document."

The real distinction is **static vs. live**. A static presentation — any
layout, however spatial — shows information that was true when it was authored;
read it twice, see the same thing. A live presentation shows information that is
true *now* and changes as the system does; read it twice, see different things,
because it is bound to a live source.

We call a live, operable interface an **instrument** — a speedometer, an
oscilloscope, a mixing console, a flight HUD. The word means *live + operable*,
not a claim about shape. You don't read an instrument once and finish; you
*monitor* it and you *act* on it.

Talos UI is the toolkit for building instruments — consoles, monitors, control
panels, live dashboards. Not prettier static snapshots.

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

1. **Reject the default reading-line, use the whole field.** Not about
   documents — print solved spatial layout a century ago. The target is the
   *web's lazy default*: the single tall portrait column you scroll
   top-to-bottom. Reject that. Use the full 2D field — zones, columns, varied
   proportion, persistent ambient context, update-in-place over reflow.
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
