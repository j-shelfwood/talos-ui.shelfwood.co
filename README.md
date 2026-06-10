# talos-ui.shelfwood.co

The showcase / documentation site for **[@j_shelfwood/talos-ui][pkg]** — the
dark-monochrome HUD design system. This repo is the site only; the design system
itself lives in its own repo and is consumed here as a published npm dependency.

- **Live:** <https://talos-ui.shelfwood.co>
- **Package repo:** <https://github.com/j-shelfwood/talos-ui> (`@j_shelfwood/talos-ui`)
- **Stack:** Astro (static), hand-built docs (no Starlight), nginx + Coolify deploy.

## Develop

```sh
bun install
bun run dev        # astro dev on :4321
bun --filter showcase check   # astro check (typecheck)
bun run build      # static build → apps/showcase/dist
```

## Layout

```
apps/showcase/      the Astro site (pages, docs content, layouts)
deploy/nginx.conf   static serving config (trailing-slash dirs, honest 404)
Dockerfile          build → nginx serve, built by Coolify from repo root
```

## Updating the design system

The site pins `@j_shelfwood/talos-ui` in `apps/showcase/package.json`. To pull a new
release, bump that version and `bun install`. The package is published from its own
repo via a tag-driven workflow (`git tag vX.Y.Z && git push --tags`).

[pkg]: https://www.npmjs.com/package/@j_shelfwood/talos-ui
