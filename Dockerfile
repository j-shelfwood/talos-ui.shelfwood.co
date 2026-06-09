# Talos UI showcase — static Astro site, served by nginx. Consumes the published
# @shelfwood/talos-ui package from npm (the design system lives in its own repo,
# github.com/j-shelfwood/talos-ui). Coolify builds this Dockerfile from the repo
# root; Traefik fronts it with TLS for talos-ui.shelfwood.co.

# ---- build stage ----------------------------------------------------------
FROM oven/bun:1.2 AS build
WORKDIR /app

# Install deps with the lockfile for reproducible builds. Copy manifests first so
# the dependency layer caches independently of source changes.
COPY package.json bun.lock ./
COPY apps/showcase/package.json apps/showcase/
RUN bun install --frozen-lockfile

# Copy the rest and build the static site.
COPY . .
RUN bun run build

# ---- serve stage ----------------------------------------------------------
FROM nginx:1.27-alpine AS serve
# Copy the built site FROM the build stage (not the host context — dist is
# gitignored/dockerignored and only exists inside the build stage after `bun run build`).
COPY --from=build /app/apps/showcase/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# NOTE: deliberately NO Dockerfile HEALTHCHECK — Coolify caches
# custom_healthcheck_found and then wedges rolling updates on every later deploy
# (see infrastructure.shelfwood.co/docs/COOLIFY_API.md gotchas). Coolify does its
# own container health probing.
