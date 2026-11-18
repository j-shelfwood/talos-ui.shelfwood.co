# talos-ui.shelfwood.co

The showcase / documentation site for **[@j_shelfwood/talos-ui][pkg]** — the
dark-monochrome HUD design system. This repo is the site only; the design system
itself lives in its own repo and is consumed here as the **published npm
package**, pinned to an exact version.

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

The site pins an exact npm version of `@j_shelfwood/talos-ui` in
`apps/showcase/package.json` (the only manifest that declares it). The package is
published from its own repo by a tag-driven workflow; a release there changes nothing
here until the pin is bumped:

```sh
cd apps/showcase && bun add @j_shelfwood/talos-ui@X.Y.Z --exact
```

Read the package's `CHANGELOG.md` for every version in between first: pre-1.0, a
minor version may remove classes or components the docs use.

[pkg]: https://www.npmjs.com/package/@j_shelfwood/talos-ui
