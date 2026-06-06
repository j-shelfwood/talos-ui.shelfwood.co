# Talos UI showcase — static Astro site, built in the monorepo and served by nginx.
# Coolify builds this Dockerfile from the repo root; Traefik fronts it with TLS for
# talos-ui.shelfwood.co. The package is built before the site (the site imports the
# workspace package), which `bun run build` already orders correctly.

# ---- build stage ----------------------------------------------------------
FROM oven/bun:1.2 AS build
WORKDIR /app

# Install deps with the lockfile for reproducible builds. Copy manifests first so
# the dependency layer caches independently of source changes.
COPY package.json bun.lock tsconfig.base.json ./
COPY packages/talos-ui/package.json packages/talos-ui/
COPY apps/showcase/package.json apps/showcase/
RUN bun install --frozen-lockfile

# Copy the rest and build (build:pkg → build:site).
COPY . .
RUN bun run build

# ---- serve stage ----------------------------------------------------------
FROM nginx:1.27-alpine AS serve
COPY apps/showcase/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
