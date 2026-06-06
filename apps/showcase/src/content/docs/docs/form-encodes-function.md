---
title: Form encodes function
description: How to apply the law in practice — bind every colour, motion, and shape to domain state.
---

The [philosophy](/docs/philosophy/) states the law: **form encodes function.**
This is the working guide — how to actually build to it with the Talos
primitives, and how to tell when you have broken it.

## The one test

Before shipping any visual property, ask:

> **Does this render meaning, or does it just look cool?**

If it renders meaning, keep it. If it just looks cool, bind it to something or
cut it. Every recipe below is an answer to that question.

## 1. Colour is state, not decoration

A value alone is data; a value with a *band* is state. Bind the colour to the
band, never to taste.

- **Don't:** pick a colour because it looks good next to the number.
- **Do:** map the value to `nominal` / `warning` / `critical` and let that drive
  the colour. The Talos primitives do this with `warn` / `crit` thresholds:

```html
<!-- 78 is ≥ warn(70) → the gauge renders amber, on its own -->
<talos-gauge value="78" warn="70" crit="90" unit="%" label="CPU"></talos-gauge>
```

The arc, needle, readout, and hub all recolour together. The colour *is* the
state — change the value and the colour changes with it, no extra code.

**The failure mode:** a green glow that means nothing. The first time a user
learns "the green doesn't actually mean anything," every green signal in your
interface stops working. Decoration that mimics a signal is worse than no
signal.

## 2. Motion is telemetry, not transition

Animate the *state*, not the change between states.

- A `<talos-trend>` line is a moving window over a stream — its **shape and
  slope are the rate**. The motion is the data advancing.
- A `<talos-flow>` dash travels at a speed bound to `rate`; **zero rate = no
  motion**. The animation is the throughput, not a shimmer.

```html
<!-- dash speed is the rate; idle links simply don't move -->
<talos-flow rate="80" max="100" warn="70"></talos-flow>
```

**The test:** if a frozen screenshot loses information the moving interface
carried, your motion is doing its job. If the screenshot loses nothing, the
motion was decoration — cut it.

## 3. Position and length are quantity

The needle angle, the fill length, the dot height — these *are* the number, read
spatially. Keep the mapping honest: a linear value gets a linear position
(`<talos-meter>` fill is `(value - min) / (max - min)`), and thresholds appear
**on the scale itself** as ticks, so the breakpoints are part of the instrument,
not hidden in config.

## 4. Degrade honestly (the honesty clause)

Everything must survive `prefers-reduced-motion`. The rule: **when the motion is
removed, the information it carried must remain** in a static form.

- A gauge needle that eases to a new reading — under reduced motion it *snaps*;
  the number and band colour are still exact.
- A flow that shows throughput as travel — under reduced motion the dashes stop
  travelling and **static directional chevrons + an aria rate** carry "there is
  flow, this fast, this way" instead.

If a signal disappears entirely when motion is off, it was decoration wearing a
function's coat. Move the meaning into something static and let the motion be the
enhancement.

## 5. The frame has state too

An instrument is never neutral. Aggregate health can drive the shell: the
[console](/docs/recipes/) status bar colour, or the ambient grid hue via
`--talos-ambient-hsl`. Bind it to a real aggregate (peak load, worst band) and
swap only when the band changes, so it reads as a mood, not a flicker.

```js
// retint the ambient grid only on band change — see the homepage source
root.style.setProperty(
  "--talos-ambient-hsl",
  band === "nominal" ? "0 0% 100%" : `var(--talos-${band}-hsl)`,
);
```

## Checklist

- [ ] Every colour maps to a band or a category — none chosen for looks alone.
- [ ] Every animation depicts a live quantity; idle states are visibly idle.
- [ ] Position / length / angle map linearly and honestly to the value.
- [ ] Reduced-motion preserves the information, not just the aesthetics.
- [ ] Decorative-only properties have been cut or bound to something.

See the [recipes](/docs/recipes/) for copy-paste instruments that already pass
this checklist.
