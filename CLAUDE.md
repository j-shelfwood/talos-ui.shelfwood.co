# CLAUDE.md — talos-ui.shelfwood.co (the site)

This repo is the **showcase / documentation site** for the Talos UI design
system. It is the live demo and docs — it is NOT the design system itself.

The design system was split out on 2026-06-09 into its own repo. It is published
to npm, but **this site consumes it as a git dependency** — it tracks the package
repo's `main` branch directly, not a pinned npm version:

- **Package repo:** [`j-shelfwood/talos-ui`](https://github.com/j-shelfwood/talos-ui)
- **npm package:** `@j_shelfwood/talos-ui` (user scope — underscore, NOT `@shelfwood`) — published, but not how this site pulls it
- **Site dependency:** `github:j-shelfwood/talos-ui#main` in `apps/showcase/package.json` (lockfile-pinned to a commit)

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

The site consumes the package as a **git dependency** pinned to the package
repo's `main` branch (`github:j-shelfwood/talos-ui#main` in
`apps/showcase/package.json`, resolved to a specific commit in `bun.lock`).
There is no npm version to bump. To pull newer package work:

```sh
bun update @j_shelfwood/talos-ui   # re-resolve #main HEAD, rewrite the lockfile pin
```

This couples the site's build output to whatever is on the package repo's
`main` — a push there + a reinstall here changes what this site ships. The
package is still published to npm from its own repo via a tag-driven OIDC
workflow (you don't publish from here), but this site does not consume that
published artifact.

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
