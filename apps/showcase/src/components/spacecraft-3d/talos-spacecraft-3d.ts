/**
 * <talos-spacecraft-3d> — the deepest drill of the constellation wall, rendered
 * as real geometry. The 3D sibling of the pack's 2D <talos-spacecraft>: same
 * part taxonomy, same `.parts` data contract, same "each part IS an instrument,
 * its COLOUR is its health band" thesis — but lit, depth-sorted, and slowly
 * orbiting so the form reads as an object, not a diagram.
 *
 * STUB / FICTIONAL: every part is procedural primitive geometry built in code
 * (boxes / planes / a cone) — no model file, no DRACO, no GLB. It is deliberately
 * a schematic satellite, not a photoreal one; the point is the data binding.
 *
 *   - PARTS    `.parts = { bus, gpu, solarL, solarR, radL, radR, antenna }`,
 *              each `{ band?: 0|1|2 }` (nominal|warning|critical). Drives each
 *              part's emissive colour. Identical shape to <talos-spacecraft>.
 *   - SELECT   hover or click a part → emits `talos:part` { part } (composed),
 *              and the `selected` attribute (a part id) ring-highlights it.
 *   - ECLIPSE  the `eclipse` flag dims the solar wings — no sun, no glow.
 *   - MOTION   idle slow auto-orbit; paused under prefers-reduced-motion (the
 *              static frame is still fully readable — every part + its band).
 *
 * Lives in the showcase only (consumes Three.js); it is NOT part of the
 * @j_shelfwood/talos-ui package. If it earns its place it can be promoted later
 * — the `.parts` API is already pack-shaped for exactly that.
 */
import * as THREE from "three";

type Band = 0 | 1 | 2;
type PartState = { band?: Band };
type Parts = Record<string, PartState>;

const PART_IDS = ["bus", "gpu", "solarL", "solarR", "radL", "radR", "antenna"] as const;
type PartId = (typeof PART_IDS)[number];

/** Parse an `H S% L%` channel triplet (the token storage format) into a Color.
 *  THREE.Color's CSS parser wants comma-separated hsl(); the tokens are
 *  space-separated, so we parse the triplet ourselves and use setHSL (which
 *  takes 0..1 values and is colour-space correct). */
function hslTripletToColor(triplet: string, fallbackHsl: [number, number, number]): THREE.Color {
  const m = triplet.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  const c = new THREE.Color();
  if (m) {
    c.setHSL(parseFloat(m[1]) / 360, parseFloat(m[2]) / 100, parseFloat(m[3]) / 100);
  } else {
    c.setHSL(fallbackHsl[0] / 360, fallbackHsl[1] / 100, fallbackHsl[2] / 100);
  }
  return c;
}

/** Resolve a `--token-hsl` custom property (an `H S% L%` triplet) off :root. */
function tokenColor(name: string, fallbackHsl: [number, number, number]): THREE.Color {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return hslTripletToColor(raw, fallbackHsl);
}

export class TalosSpacecraft3D extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["selected", "eclipse"];
  }

  private root: ShadowRoot;
  private host: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private rig!: THREE.Group; // the whole craft; auto-orbits on Y
  private partMeshes = new Map<PartId, THREE.Object3D>();
  private partMat = new Map<PartId, THREE.MeshStandardMaterial>();
  private _parts: Parts = {};
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(-2, -2);
  private hovered: PartId | null = null;
  private frame = 0;
  private ro?: ResizeObserver;
  private bandColors!: { nominal: THREE.Color; warning: THREE.Color; critical: THREE.Color };
  private running = false;
  private camDir!: THREE.Vector3;
  private fitRadius = 1;
  private pickables: THREE.Mesh[] = [];
  private partOffset = new Map<PartId, THREE.Vector3>(); // exploded nudge direction
  private selPulse = 0; // animates the selected-part glow

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    this.root.innerHTML = /* html */ `
      <style>
        :host { display: block; width: 100%; height: 100%; position: relative; }
        .stage { width: 100%; height: 100%; display: block; cursor: grab; }
        .label {
          position: absolute; left: 0; top: 0; pointer-events: none;
          font-family: var(--talos-font-display, system-ui);
          font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--talos-foreground, #e7e9ec);
          background: hsl(0 0% 0% / 0.6); border: 1px solid var(--talos-glass-border, hsl(0 0% 100% / 0.12));
          padding: 0.15rem 0.4rem; transform: translate(-50%, -160%); white-space: nowrap;
          opacity: 0; transition: opacity 120ms ease;
        }
        .label[data-show] { opacity: 1; }
      </style>
      <canvas class="stage" part="canvas"></canvas>
      <span class="label" part="label"></span>
    `;
    this.host = this.root.host as HTMLElement;
  }

  set parts(v: Parts) {
    this._parts = v || {};
    this.applyBands();
  }
  get parts(): Parts { return this._parts; }

  connectedCallback(): void {
    // The element upgrade runs synchronously inline with the host page's script;
    // a WebGL/geometry fault must degrade gracefully here, never throw upward and
    // take the page's own logic down with it.
    try {
      this.initThree();
      this.buildCraft();
      this.frameModel();
      this.applyBands();
      const canvas = this.root.querySelector("canvas")!;
      canvas.addEventListener("pointermove", this.onPointerMove);
      canvas.addEventListener("pointerleave", this.onPointerLeave);
      canvas.addEventListener("click", this.onClick);
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this);
      this.resize();
      this.start();
    } catch (err) {
      console.error("[talos-spacecraft-3d] init failed:", err);
    }
  }

  disconnectedCallback(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.ro?.disconnect();
    this.renderer?.dispose();
  }

  attributeChangedCallback(): void {
    this.applyBands(); // `selected` highlight + `eclipse` dim re-evaluated
  }

  private reducedMotion(): boolean {
    return typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private initThree(): void {
    const canvas = this.root.querySelector("canvas") as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    // Camera direction (unit vector); distance is computed by frameModel() to fit
    // the whole craft with margin, regardless of geometry.
    this.camDir = new THREE.Vector3(0.62, 0.42, 0.88).normalize();
    this.camera.position.copy(this.camDir).multiplyScalar(7);
    this.camera.lookAt(0, 0, 0);

    // HUD lighting is deliberately LOW — the bodies must read near-black so the
    // band emissive (and the edge wirelines) carry the colour, not a lit surface.
    // A soft key gives just enough form; a cool rim catches the silhouette edge.
    const key = new THREE.DirectionalLight(0xffffff, 0.55);
    key.position.set(4, 6, 5);
    const rim = new THREE.DirectionalLight(0x9fb8ff, 0.5);
    rim.position.set(-5, 1, -4);
    const amb = new THREE.AmbientLight(0xffffff, 0.12);
    this.scene.add(key, rim, amb);

    this.rig = new THREE.Group();
    this.scene.add(this.rig);

    // Seat the craft in space: a faint star field + a HUD reference grid plane.
    this.scene.add(this.makeStarfield());
    const grid = new THREE.GridHelper(14, 28, 0x1a4031, 0x0e1a16);
    (grid.material as THREE.Material).opacity = 0.35;
    (grid.material as THREE.Material).transparent = true;
    grid.position.y = -2.2;
    this.scene.add(grid);

    this.bandColors = {
      nominal: tokenColor("--talos-success-hsl", [140, 90, 60]),
      warning: tokenColor("--talos-warning-hsl", [38, 92, 60]),
      critical: tokenColor("--talos-danger-hsl", [0, 80, 62]),
    };
  }

  /** A faint star field — cheap Points, parallax depth behind the craft. */
  private makeStarfield(): THREE.Points {
    const COUNT = 320;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // deterministic scatter on a shell (no Math.random — stable across reloads)
      const a = i * 2.399963, r = 18 + ((i * 7.13) % 10);
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = ((i * 5.7) % 24) - 12;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: 0x8aa0b8, size: 0.06, sizeAttenuation: true, transparent: true, opacity: 0.7 });
    return new THREE.Points(g, m);
  }

  /** A near-black matte body material; emissive is set per-part from its band. */
  private bodyMat(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0, 0, 0.045), // near-black HUD body
      metalness: 0.2,
      roughness: 0.75,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
    });
  }

  /** Add a faint band-coloured edge wireline to a mesh — the HUD schematic look
   *  that makes the dark geometry read against the dark background. */
  private addEdges(obj: THREE.Object3D, id: PartId): void {
    // Collect meshes first — never mutate the tree mid-traverse.
    const meshes: THREE.Mesh[] = [];
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry && (m as THREE.Mesh).isMesh) meshes.push(m);
    });
    for (const m of meshes) {
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(m.geometry, 25),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }),
      );
      edges.userData.part = id;
      edges.userData.edge = true;
      edges.raycast = () => {}; // edges shouldn't catch the raycaster; the solid mesh does
      m.add(edges);
    }
  }

  private register(id: PartId, obj: THREE.Object3D, mat: THREE.MeshStandardMaterial): void {
    obj.traverse((o) => ((o as THREE.Mesh).userData.part = id));
    obj.userData.part = id;
    // Curate the pickable solid meshes BEFORE adding edge lines, so the
    // raycaster only ever tests faces — never the zero-thickness wirelines that
    // were stealing hits and making the lower parts feel unclickable.
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) this.pickables.push(m);
    });
    this.addEdges(obj, id);
    this.partMeshes.set(id, obj);
    this.partMat.set(id, mat);
    this.rig.add(obj);
  }

  private buildCraft(): void {
    const M = () => this.bodyMat();

    // BUS — central rounded box (the body).
    const busMat = M();
    const bus = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 1.6), busMat);
    this.register("bus", bus, busMat);

    // GPU — compute payload, a smaller raised box on top of the bus.
    const gpuMat = M();
    const gpu = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.34, 0.9), gpuMat);
    gpu.position.set(0, 0.62, 0);
    this.register("gpu", gpu, gpuMat);

    // SOLAR WINGS — thin wide planes on ±X booms.
    for (const side of [-1, 1] as const) {
      const id: PartId = side < 0 ? "solarL" : "solarR";
      const wing = new THREE.Group();
      const boom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8),
        new THREE.MeshStandardMaterial({ color: 0x222428, metalness: 0.6, roughness: 0.4 }),
      );
      boom.rotation.z = Math.PI / 2;
      boom.position.x = side * 0.85;
      const panelMat = M();
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.04, 1.05), panelMat);
      panel.position.x = side * 2.05;
      // cell grid lines as a subtle wireframe overlay (emissive edges)
      const grid = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1.7, 0.045, 1.05, 6, 1, 4)),
        new THREE.LineBasicMaterial({ color: 0x3a3f46, transparent: true, opacity: 0.5 }),
      );
      grid.position.copy(panel.position);
      wing.add(boom, panel, grid);
      this.register(id, wing, panelMat);
    }

    // RADIATORS — big flat panels splayed DOWN-and-OUT below the bus, like
    // deployed wings, so each has clear screen area and never hides under the bus.
    for (const side of [-1, 1] as const) {
      const id: PartId = side < 0 ? "radL" : "radR";
      const radMat = M();
      const rad = new THREE.Group();
      // one solid panel (the clickable face) + a few raised fin ridges on it.
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.8), radMat);
      rad.add(panel);
      for (let f = 0; f < 4; f++) {
        const fin = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.05, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x2a2e34, metalness: 0.5, roughness: 0.5 }),
        );
        fin.position.set(0, 0.05, -0.3 + f * 0.2);
        rad.add(fin);
      }
      // splay the whole panel down and outward on a short stub from the bus base.
      rad.position.set(side * 0.95, -0.95, -0.1);
      rad.rotation.z = side * 0.5;
      this.register(id, rad, radMat);
    }

    // ANTENNA — a bigger downlink dish on a clear forward boom (+Z), well clear
    // of the body so it's easy to read and click.
    const antMat = M();
    const ant = new THREE.Group();
    const dish = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.55, 28, 1, true), antMat);
    dish.rotation.x = -Math.PI / 2.1;
    dish.position.set(0, 0.15, 1.55);
    const feed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a3f46, metalness: 0.6, roughness: 0.4 }),
    );
    feed.rotation.x = Math.PI / 2;
    feed.position.set(0, 0.05, 1.1);
    ant.add(dish, feed);
    this.register("antenna", ant, antMat);
  }

  /** Recenter the craft on the orbit pivot and remember its bounding radius so
   *  the camera can fit the whole thing with margin (robust to any geometry). */
  private frameModel(): void {
    const box = new THREE.Box3().setFromObject(this.rig);
    const center = box.getCenter(new THREE.Vector3());
    // shift every part so the bbox centre sits at the rig origin → clean spin + frame.
    for (const child of this.rig.children) child.position.sub(center);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    this.fitRadius = sphere.radius;
    // Capture each part's outward direction (from centre) + its home position, so
    // a selected part can nudge OUTWARD (an "exploded view" hint) and ease back.
    for (const child of this.rig.children) {
      const id = child.userData.part as PartId;
      if (!id) continue;
      const dir = child.position.clone();
      if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0); // bus sits at centre → nudge up
      dir.normalize();
      this.partOffset.set(id, dir);
      child.userData.home = child.position.clone();
    }
    this.placeCamera();
  }

  /** Position the camera along camDir at a distance that fits fitRadius in view,
   *  accounting for the current aspect (portrait stages need more pull-back). */
  private placeCamera(): void {
    if (!this.camDir) return;
    const vFov = (this.camera.fov * Math.PI) / 180;
    const fitH = this.fitRadius / Math.sin(vFov / 2);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect);
    const fitW = this.fitRadius / Math.sin(hFov / 2);
    const dist = Math.max(fitH, fitW) * 1.25; // 25% margin
    this.camera.position.copy(this.camDir).multiplyScalar(dist);
    this.camera.lookAt(0, 0, 0);
  }

  private bandOf(id: PartId): Band {
    return (this._parts[id]?.band ?? 0) as Band;
  }

  /** Push the current band data → each part's emissive colour + intensity. */
  private applyBands(): void {
    if (!this.partMat.size || !this.bandColors) return;
    const selected = this.getAttribute("selected");
    const eclipse = this.hasAttribute("eclipse");
    for (const id of PART_IDS) {
      const mat = this.partMat.get(id);
      if (!mat) continue;
      const band = this.bandOf(id);
      const col = band === 2 ? this.bandColors.critical : band === 1 ? this.bandColors.warning : this.bandColors.nominal;
      mat.emissive.copy(col);
      // A HEALTHY craft reads near-monochrome — nominal barely glows so the form
      // and edges carry it; anomalies (warn/crit) are what light up. Selection
      // and hover add a deliberate boost on top.
      let intensity = band === 2 ? 0.85 : band === 1 ? 0.5 : 0.05;
      if ((id === "solarL" || id === "solarR") && eclipse) intensity *= 0.2; // no sun
      if (id === this.hovered) intensity = Math.max(intensity, 0.55);
      if (id === selected) {
        // Selected part PULSES bright — a clear "this is what you're reading".
        const pulse = 0.85 + Math.sin(this.selPulse * 4) * 0.35;
        intensity = Math.max(intensity, pulse);
        mat.opacity = 1;
      } else if (selected) {
        // Focus isolation: everything else recedes so the selection stands out.
        intensity *= 0.25;
        mat.transparent = true;
        mat.opacity = 0.45;
      } else {
        mat.transparent = false;
        mat.opacity = 1;
      }
      mat.emissiveIntensity = intensity;
    }
  }

  private resize(): void {
    const w = this.clientWidth || 1, h = this.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.placeCamera(); // re-fit on aspect change so the craft never crops
  }

  private onPointerMove = (e: PointerEvent): void => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };
  private onPointerLeave = (): void => { this.pointer.set(-2, -2); };

  private onClick = (e: MouseEvent): void => {
    // Raycast FRESH from the click position — never depend on stale hover (the
    // model spins; a click can land on a part that wasn't last hovered).
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const py = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const hit = this.raycastPart(px, py);
    if (hit) {
      // toggle off if you click the already-selected part
      if (this.getAttribute("selected") === hit) {
        this.removeAttribute("selected");
        this.dispatchEvent(new CustomEvent("talos:part", { detail: { part: null }, bubbles: true, composed: true }));
      } else {
        this.setAttribute("selected", hit);
        this.dispatchEvent(new CustomEvent("talos:part", { detail: { part: hit }, bubbles: true, composed: true }));
      }
    }
  };

  /** One-shot raycast at normalised coords → the part id under it (or null). */
  private raycastPart(nx: number, ny: number): PartId | null {
    this.scene.updateMatrixWorld(true);
    this.raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
    const hits = this.raycaster.intersectObjects(this.pickables, false);
    return (hits[0]?.object.userData.part ?? null) as PartId | null;
  }

  private pick(): void {
    // World matrices must be current (the rig spins) before casting, and we cast
    // ONLY against the curated solid meshes — never the edge wirelines.
    this.scene.updateMatrixWorld(true);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickables, false);
    const part = (hits[0]?.object.userData.part ?? null) as PartId | null;
    if (part !== this.hovered) {
      this.hovered = part;
      const canvas = this.root.querySelector("canvas") as HTMLElement;
      canvas.style.cursor = part ? "pointer" : "grab";
      const lbl = this.root.querySelector(".label") as HTMLElement;
      if (part) {
        lbl.textContent = part.replace(/([A-Z])/g, " $1").toUpperCase();
        lbl.toggleAttribute("data-show", true);
      } else {
        lbl.toggleAttribute("data-show", false);
      }
      this.applyBands();
    }
    // keep the label tracking the pointer when shown
    if (this.hovered) {
      const lbl = this.root.querySelector(".label") as HTMLElement;
      const rect = this.getBoundingClientRect();
      lbl.style.left = `${((this.pointer.x + 1) / 2) * rect.width}px`;
      lbl.style.top = `${((1 - this.pointer.y) / 2) * rect.height}px`;
    }
  }

  private start(): void {
    if (this.running) return;
    this.running = true;
    let last = performance.now();
    const tmp = new THREE.Vector3();
    const loop = (now: number) => {
      if (!this.running) return;
      try {
        const dt = (now - last) / 1000; last = now;
        const rm = this.reducedMotion();
        // Auto-orbit slows while a part is selected, and PAUSES while hovering, so
        // a moving target never frustrates a click.
        const spin = this.hovered ? 0 : this.getAttribute("selected") ? 0.08 : 0.35;
        if (!rm) this.rig.rotation.y += dt * spin;
        this.selPulse += dt;

        // Exploded-view ease: the selected part slides OUT along its offset; the
        // rest ease home. A focused subsystem literally steps forward.
        const sel = this.getAttribute("selected");
        for (const child of this.rig.children) {
          const id = child.userData.part as PartId;
          const home = child.userData.home as THREE.Vector3 | undefined;
          const off = this.partOffset.get(id);
          if (!id || !home || !off) continue;
          const want = id === sel ? tmp.copy(home).addScaledVector(off, 0.55) : home;
          child.position.lerp(want, Math.min(1, dt * 6));
        }

        this.pick();
        if (this.hovered || this.getAttribute("selected")) this.applyBands(); // only when it can change
        this.renderer.render(this.scene, this.camera);
      } catch (err) {
        console.error("[talos-spacecraft-3d] frame error:", err);
      }
      this.frame = requestAnimationFrame(loop);
    };
    this.frame = requestAnimationFrame(loop);
  }
}

if (typeof customElements !== "undefined" && !customElements.get("talos-spacecraft-3d")) {
  customElements.define("talos-spacecraft-3d", TalosSpacecraft3D);
}
