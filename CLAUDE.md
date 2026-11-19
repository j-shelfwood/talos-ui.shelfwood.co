# CLAUDE.md — talos-ui.shelfwood.co (the site)

This repo is the **showcase / documentation site** for the Talos UI design
system. It is the live demo and docs — it is NOT the design system itself.

The design system was split out on 2026-06-09 into its own repo. It is published
to npm, and **this site consumes the published package at an exact version**:

- **Package repo:** [`j-shelfwood/talos-ui`](https://github.com/j-shelfwood/talos-ui)
- **npm package:** `@j_shelfwood/talos-ui` (user scope — underscore, NOT `@shelfwood`)
- **Site dependency:** an exact npm version in `apps/showcase/package.json`, the only manifest that declares it

This repo does NOT contain `packages/` anymore. If you're looking for the
components/CSS source, it's in the package repo. Don't re-vendor it here.

## Layout

```
apps/showcase/      the Astro site (pages, docs content, layouts, components)
deploy/nginx.conf   static serving config (trailing-slash dirs, honest 404)
Dockerfile          build (bun) → nginx serve; built by Coolify from repo root
```

It's a one-app Bun workspace (`workspaces: ["apps/*"]`). The showcase pins
`@j_shelfwood/talos-ui` in `apps/showcase/package.json`.

## Develop

```sh
bun install
bun run dev                  # astro dev on :4321
bun --filter showcase check  # astro check (typecheck — also the CI gate)
bun run build                # static build → apps/showcase/dist
```

## Updating the design system

The site pins an exact npm version of `@j_shelfwood/talos-ui` in
`apps/showcase/package.json` (the root `package.json` does not declare it; a
second pin there drifted before). The package is published to npm from its own
repo via a tag-driven OIDC workflow (you don't publish from here); a release
there changes nothing here until the pin is bumped:

```sh
npm view @j_shelfwood/talos-ui version            # latest published
cd apps/showcase && bun add @j_shelfwood/talos-ui@X.Y.Z --exact
```

Before bumping, read the package's `CHANGELOG.md` for every version in between
(local checkout `~/Projects/talos-ui`): pre-1.0, a minor version may remove
classes or Astro components. Then `bun --filter showcase check` and
`bun run build`. A new CSS module needs a docs page and a `docs-nav.ts` entry
to show on the site; `BaseLayout.astro` loads it through `all.css` already.

## Deployment — Coolify (live Coolify state is the source of truth)

The live site is a **standalone Coolify application** on the
`infrastructure.shelfwood.co` host. Coolify builds this repo's `Dockerfile` from
the repo root on push to the deploy branch; Traefik fronts it with Let's Encrypt
TLS.

It is **intentionally not in** the infra repo's `state/wiring.yaml` — that file
tracks the agent platform's non-derivable plumbing (Mattermost, n8n, MCP,
Bugsink), not plain hosted sites whose state Coolify already exposes. Don't add
it there. Resolve live state from Coolify instead (commands below).

| Field | Value |
|---|---|
| Domain | https://talos-ui.shelfwood.co |
| Host | `infrastructure.shelfwood.co` (Coolify) |
| Coolify project | `shelfwood-services` (applicationId 6) |
| Coolify resource UUID | `g53eqpbkjzqlilcfjx0jkw1z` |
| Router | Traefik — `Host(talos-ui.shelfwood.co)`, http→https, certresolver letsencrypt |
| Serve | nginx (Dockerfile serve stage), container port 80 |

Resolve the live container fresh (Coolify names are dynamic):

```sh
ssh infrastructure.shelfwood.co \
  "docker ps --format '{{.Names}}' | grep g53eqpbkjzqlilcfjx0jkw1z"
```

Deploy = push to the branch Coolify watches; it rebuilds the Dockerfile. The
split does NOT change hosting — the deploy source is still this repo.

### Dockerfile / nginx gotchas (do not regress)

- **No Dockerfile `HEALTHCHECK`** — Coolify caches `custom_healthcheck_found` and
  wedges rolling updates on every later deploy. Coolify does its own probing.
- **`COPY --from=build`** the dist — `dist/` is gitignored/dockerignored and only
  exists inside the build stage after `bun run build`.
- **nginx `try_files … =404`** with `error_page 404 /404.html` — a genuine miss
  returns an honest 404 status, not a 200 with the 404 page.

## History

`FEEDBACK.md` is a **superseded** 2026-06-06 migration-readiness audit describing
the pre-split monorepo (version `0.0.1`, `workspace:*` linking, co-located
`packages/`). None of that reflects the current two-repo structure — keep it for
provenance only; don't treat its claims as current.
