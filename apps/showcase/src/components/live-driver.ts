// Drives the <talos-*> instruments inside a live demo (`<Demo live>` renders
// `data-live` on its wrapper) with synthetic telemetry on a timer, so the docs
// show what each instrument does when its data moves.
//
// - One timer per live demo, started when the demo scrolls into view and
//   stopped when it leaves (IntersectionObserver).
// - prefers-reduced-motion slows the cadence; the values still change, because
//   a changing reading is the information, not decoration.
// - Every instrument is driven through its public API at the pinned package
//   version: attributes for the declarative instruments, properties or methods
//   (`nodes`, `push`, `stats`, `cells`, ...) for the imperative ones.

type Driver = (el: HTMLElement, tick: number) => void;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const num = (el: Element, name: string, fallback: number) => {
  const v = parseFloat(el.getAttribute(name) ?? "");
  return Number.isFinite(v) ? v : fallback;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Random walk inside [lo, hi]; the step is a fraction of the span, and the
 *  walk is pulled back toward the middle so it keeps crossing the bands. */
const walk = (cur: number, lo: number, hi: number, step = 0.14) => {
  const span = hi - lo;
  const mid = lo + span / 2;
  const pull = (mid - cur) * 0.08;
  return clamp(cur + (Math.random() * 2 - 1) * span * step + pull, lo, hi);
};

const round = (v: number, span: number) => (span >= 200 ? Math.round(v) : Math.round(v * 10) / 10);

/** Domain for a value-bound instrument: its min/max, or a range wide enough to
 *  cross its own warn/crit thresholds. */
const domain = (el: Element): [number, number] => {
  const lo = num(el, "min", 0);
  const hi = num(el, "max", 100);
  return [lo, hi];
};

const state = new WeakMap<HTMLElement, number>();

const walkAttr = (el: HTMLElement, attr: string, lo: number, hi: number, step?: number) => {
  const cur = state.get(el) ?? num(el, attr, (lo + hi) / 2);
  const next = walk(cur, lo, hi, step);
  state.set(el, next);
  el.setAttribute(attr, String(round(next, hi - lo)));
  return next;
};

const valueWalker: Driver = (el) => {
  const [lo, hi] = domain(el);
  walkAttr(el, "value", lo, hi);
};

const ORBITAL_POOL = ["api", "db", "cache", "queue", "auth", "edge", "store", "mail", "cron", "search"];
interface OrbitalNode { id: string; ring: number; value: number; load: number; rate: number; label?: string }
const orbitalState = new WeakMap<HTMLElement, OrbitalNode[]>();

const orbital: Driver = (el, tick) => {
  const rings = Math.max(1, Math.round(num(el, "rings", 3)));
  const warn = num(el, "warn", 70);
  const crit = num(el, "crit", 90);
  const make = (id: string): OrbitalNode => ({
    id,
    ring: 1 + Math.floor(Math.random() * rings),
    value: Math.random() * warn,
    load: 0.25 + Math.random() * 0.7,
    rate: 10 + Math.random() * 70,
    label: id.toUpperCase(),
  });
  let nodes = orbitalState.get(el);
  if (!nodes) nodes = ORBITAL_POOL.slice(0, 5).map(make);
  // Readings walk across the bands; rates and loads drift.
  nodes = nodes.map((n) => ({
    ...n,
    value: walk(n.value, 0, Math.max(100, crit + 10), 0.18),
    load: clamp(n.load + (Math.random() - 0.5) * 0.2, 0.15, 1),
    rate: Math.random() < 0.1 ? 0 : clamp(n.rate + (Math.random() - 0.5) * 30, 5, 90),
  }));
  // Membership changes: every few ticks a node joins or leaves.
  if (tick % 3 === 2) {
    const free = ORBITAL_POOL.filter((id) => !nodes!.some((n) => n.id === id));
    if ((Math.random() < 0.5 && nodes.length > 3) || free.length === 0) {
      nodes.splice(Math.floor(Math.random() * nodes.length), 1);
    } else {
      nodes.push(make(free[Math.floor(Math.random() * free.length)]));
    }
  }
  orbitalState.set(el, nodes);
  (el as HTMLElement & { nodes: OrbitalNode[] }).nodes = nodes.map((n) => ({ ...n }));
};

const series = (n: number, lo = 20, hi = 80) => {
  let v = (lo + hi) / 2;
  return Array.from({ length: n }, () => (v = walk(v, lo, hi)));
};

const TICKER_MSGS = [
  ["deploy 4f2c1 rolled out", "nominal"],
  ["cache hit ratio 0.94", "nominal"],
  ["queue depth above 800", "warning"],
  ["p99 latency 412 ms", "warning"],
  ["db replica lag 9 s", "critical"],
  ["gateway gw-07 reconnected", "nominal"],
  ["disk /var 91% full", "critical"],
  ["cert renewal in 6 days", "warning"],
] as const;

const drivers: Record<string, Driver> = {
  "talos-gauge": valueWalker,
  "talos-meter": valueWalker,
  "talos-readout": valueWalker,
  "talos-stat": valueWalker,
  "talos-led": (el) => {
    if (el.hasAttribute("value") || el.hasAttribute("warn")) return valueWalker(el, 0);
    const states = ["ok", "ok", "ok", "warn", "crit", "idle"];
    el.setAttribute("state", states[Math.floor(Math.random() * states.length)]);
  },
  "talos-dots": (el) => {
    const total = Math.max(1, Math.round(num(el, "total", 10)));
    const next = walk(state.get(el) ?? num(el, "value", total / 2), 0, total, 0.2);
    state.set(el, next);
    el.setAttribute("value", String(Math.round(next)));
  },
  "talos-delta": (el) => {
    // Delta reports the change since the last reading, so the walk itself is
    // the demo: each tick is a step up or down.
    const cur = state.get(el) ?? num(el, "value", 100);
    const next = cur + (Math.random() * 2 - 1) * Math.max(1, Math.abs(cur) * 0.05);
    state.set(el, next);
    const prec = Math.max(0, Math.round(num(el, "precision", 0)));
    el.setAttribute("value", next.toFixed(prec));
  },
  "talos-trend": (el) => {
    const lo = el.hasAttribute("min") ? num(el, "min", 0) : 0;
    const hi = el.hasAttribute("max") ? num(el, "max", 100) : 100;
    const next = walk(state.get(el) ?? (lo + hi) / 2, lo, hi, 0.12);
    state.set(el, next);
    (el as HTMLElement & { push(v: number): void }).push(Math.round(next * 10) / 10);
  },
  "talos-spark": (el) => {
    const [lo, hi] = domain(el);
    const next = walk(state.get(el) ?? (lo + hi) / 2, lo, hi, 0.14);
    state.set(el, next);
    (el as HTMLElement & { push(v: number): void }).push(Math.round(next * 10) / 10);
  },
  "talos-flow": (el) => walkAttr(el, "rate", 0, num(el, "max", 100), 0.18),
  "talos-toggle": (el) => {
    const opts = (el.getAttribute("options") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (opts.length < 2) return;
    const cur = el.getAttribute("value");
    const rest = opts.filter((o) => o !== cur);
    el.setAttribute("value", rest[Math.floor(Math.random() * rest.length)]);
  },
  "talos-orbital": orbital,
  "talos-compass": (el) => {
    const cur = state.get(el) ?? num(el, "heading", 0);
    const next = (cur + (Math.random() * 2 - 1) * 40 + 360) % 360;
    state.set(el, next);
    el.setAttribute("heading", String(Math.round(next)));
  },
  "talos-odometer": (el) => {
    const cur = state.get(el) ?? num(el, "value", 0);
    const next = cur + Math.round(5 + Math.random() * 120);
    state.set(el, next);
    el.setAttribute("value", String(next));
  },
  "talos-percentile": (el) => {
    const base = state.get(el) ?? 60;
    const p50 = walk(base, 30, 110, 0.1);
    state.set(el, p50);
    // Spread the tail well apart so the marker labels stay legible.
    const p90 = p50 * (2.4 + Math.random() * 0.8);
    const p99 = p90 * (2 + Math.random() * 1.2);
    (el as HTMLElement & { stats: unknown }).stats = {
      p05: Math.round(p50 * 0.4),
      p25: Math.round(p50 * 0.75),
      p50: Math.round(p50),
      p75: Math.round(p50 * 1.3),
      p90: Math.round(p90),
      p99: Math.round(p99),
    };
  },
  "talos-ticker": (el) => {
    const [msg, level] = TICKER_MSGS[Math.floor(Math.random() * TICKER_MSGS.length)];
    (el as HTMLElement & { push(e: { msg: string; level: string }): void }).push({ msg, level });
  },
  "talos-histogram": (el, tick) => {
    const [lo, hi] = domain(el);
    const centre = lo + (hi - lo) * (0.5 + 0.35 * Math.sin(tick / 3));
    const values = Array.from({ length: 400 }, () => {
      const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      return clamp(centre + g * (hi - lo) * 0.3, lo, hi);
    });
    (el as HTMLElement & { values: number[] }).values = values;
  },
  "talos-matrix": (el, tick) => {
    const cols = Math.round(num(el, "cols", 72));
    const rows = Math.round(num(el, "rows", 22));
    const prev = (el as HTMLElement & { cells: ArrayLike<number> }).cells;
    const cells = new Float32Array(cols * rows);
    for (let i = 0; i < cells.length; i++) {
      const p = prev && prev.length === cells.length ? prev[i] : 30 + Math.random() * 30;
      cells[i] = clamp(p + (Math.random() - 0.5) * 18 + (Math.random() < 0.004 ? 40 : 0), 0, 100);
    }
    (el as HTMLElement & { cells: Float32Array }).cells = cells;
    if (el.hasAttribute("terminator")) el.setAttribute("terminator", String(((tick * 0.04) % 1).toFixed(3)));
  },
  "talos-groundtrack": (el, tick) => {
    const inc = num(el, "inclination", 53);
    const sats = Array.from({ length: 12 }, (_, i) => {
      const phase = (i / 12) * 360 + tick * 6;
      const lon = ((phase + 180) % 360) - 180;
      const lat = inc * Math.sin(((phase + i * 37) * Math.PI) / 180);
      return { lon, lat, band: i % 7 === 3 ? 2 : i % 4 === 1 ? 1 : 0 };
    });
    const ground = [
      { lon: -122, lat: 37 },
      { lon: -3, lat: 51 },
      { lon: 139, lat: 35 },
      { lon: 151, lat: -33 },
      { lon: -47, lat: -23 },
    ];
    const gateways = ground.map((g) => ({
      ...g,
      active: sats.some((s) => Math.abs(s.lon - g.lon) < 25 && Math.abs(s.lat - g.lat) < 25),
    }));
    const t = el as HTMLElement & { sats: unknown; gateways: unknown };
    t.sats = sats;
    t.gateways = gateways;
  },
  "talos-plane": (el, tick) => {
    const slots = Math.round(num(el, "slots", 22));
    const from = ((tick * 0.05) % 1.2) - 0.2;
    const to = from + 0.3;
    el.setAttribute("eclipse-from", clamp(from, 0, 1).toFixed(3));
    el.setAttribute("eclipse-to", clamp(to, 0, 1).toFixed(3));
    const sats = Array.from({ length: slots }, (_, i) => {
      const pos = slots > 1 ? i / (slots - 1) : 0;
      const eclipse = pos >= from && pos <= to;
      const r = Math.random();
      return { band: r < 0.06 ? 2 : r < 0.18 || eclipse ? 1 : 0, eclipse };
    });
    (el as HTMLElement & { sats: unknown }).sats = sats;
  },
  "talos-spacecraft": (el, tick) => {
    const eclipse = Math.floor(tick / 4) % 2 === 1;
    eclipse ? el.setAttribute("eclipse", "") : el.removeAttribute("eclipse");
    const band = () => {
      const r = Math.random();
      return r < 0.1 ? 2 : r < 0.3 ? 1 : 0;
    };
    const parts: Record<string, { value: number; band: number }> = {};
    for (const id of ["bus", "gpu", "solarL", "solarR", "radL", "radR", "antenna"]) {
      parts[id] = { value: Math.round(Math.random() * 100), band: band() };
    }
    if (eclipse) parts.solarL.band = parts.solarR.band = 1;
    (el as HTMLElement & { parts: unknown }).parts = parts;
  },
};

const SELECTOR = Object.keys(drivers).join(",");

function start(root: HTMLElement) {
  const targets = [...root.querySelectorAll<HTMLElement>(SELECTOR)];
  if (!targets.length) return;
  let tick = 0;
  let timer: number | undefined;
  const step = () => {
    for (const el of targets) drivers[el.localName]?.(el, tick);
    tick++;
  };
  const run = () => {
    if (timer !== undefined) return;
    step();
    timer = window.setInterval(step, reduced() ? 3200 : 1100);
  };
  const stop = () => {
    window.clearInterval(timer);
    timer = undefined;
  };
  new IntersectionObserver((entries) => {
    for (const e of entries) (e.isIntersecting ? run : stop)();
  }).observe(root);
}

export async function startLiveDemos() {
  const roots = [...document.querySelectorAll<HTMLElement>("[data-live]")];
  if (!roots.length) return;
  // Drive only after the elements have upgraded, so properties land on the
  // instrument's own setters rather than shadowing them on the plain element.
  const names = new Set(roots.flatMap((r) => [...r.querySelectorAll(SELECTOR)].map((el) => el.localName)));
  await Promise.all([...names].map((n) => customElements.whenDefined(n)));
  roots.forEach(start);
}
