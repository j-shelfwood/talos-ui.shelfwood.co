# talos-ui.shelfwood.co

The showcase / documentation site for **[@j_shelfwood/talos-ui][pkg]** — the
dark-monochrome HUD design system. This repo is the site only; the design system
itself lives in its own repo and is consumed here as a **git dependency** that
tracks the package repo's `main` branch (not a pinned npm version).

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

The site depends on `github:j-shelfwood/talos-ui#main` in `apps/showcase/package.json`
(lockfile-pinned to a commit). There is no npm version to bump — run
`bun update @j_shelfwood/talos-ui` to re-resolve `#main` HEAD and rewrite the lock.
The package is *also* published to npm from its own repo via a tag-driven workflow
(`git tag vX.Y.Z && git push --tags`), but this site consumes the git ref, not that
published artifact.

[pkg]: https://www.npmjs.com/package/@j_shelfwood/talos-ui
