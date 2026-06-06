# syntax=docker/dockerfile:1
# Single-origin production image: build the web SPA, then run the Elysia API
# which serves both /api and the built static frontend on one port.

# ── Build stage: install workspace deps + build apps/web → dist ──────────────
FROM oven/bun:1.3.14 AS builder
WORKDIR /app

# Manifests first so `bun install` is cached unless dependencies change.
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json
RUN bun install --frozen-lockfile

# Source + build (turbo builds the web SPA and typechecks api + ui).
COPY . .
RUN bun run build

# ── Runtime stage: the API serves /api + the SPA (single origin) ─────────────
FROM oven/bun:1.3.14-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Bun runs the API TypeScript directly — no separate API build artifact.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/apps/web/dist ./apps/web/dist

WORKDIR /app/apps/api
# The API binds to $PORT (Render sets it; defaults to 3001) on 0.0.0.0.
EXPOSE 3001
# Run migrations on start, then hand off to the server. This keeps the blueprint
# free-tier compatible (no preDeployCommand, which needs a paid instance).
# `exec` makes bun PID 1 so it receives SIGTERM for the graceful shutdown.
CMD ["sh", "-c", "bun run db:migrate && exec bun run src/index.ts"]
