# Quire

A collaborative document editor (Google Docs–inspired), built for the Ajaia assignment — write rich-text documents and share them with per-document roles, from a single-page app.

## Live demo

**https://quire-1f21.onrender.com/**

Seeded accounts (all password `password123`):

| Email               | Password      | Role                                |
| ------------------- | ------------- | ----------------------------------- |
| `alice@example.com` | `password123` | Admin — owns the two demo documents |
| `bob@example.com`   | `password123` | Editor on Alice's "Product Roadmap" |
| `carol@example.com` | `password123` | Viewer on Alice's "Product Roadmap" |

To see the sharing flow, log in as **Bob** (editor) or **Carol** (viewer): Alice's "Product Roadmap" appears under **Shared with me** — editable for Bob, read-only for Carol.

> The free Render tier spins down after ~15 min idle, so the first request may take 30–60s to wake.

## Features

- **Rich-text editing** (TipTap) — bold, italic, underline, H1/H2/H3, paragraph, bullet list, numbered list. Stored as TipTap JSON.
- **File upload** — import `.md` or `.txt` files (max **2 MB**); parsed client-side into a new, editable document (Markdown → formatted, text → paragraphs).
- **Sharing & access** — each document has an owner plus document-scoped roles (viewer / commenter / editor). The dashboard splits **My documents** vs **Shared with me**; only the owner can manage sharing or delete.
- **Persistence** — documents and their formatting survive reload (debounced autosave); each content edit writes a version snapshot.
- **Auth** — session-based register / login / logout (httpOnly cookie, argon2id hashing). Sessions are server-side rows — no signing secret to configure.

## Tech stack

Bun · Elysia · Kysely · PostgreSQL · React · TanStack Router (+ Query) · shadcn/ui · TipTap · Eden Treaty (end-to-end typed client). **Single-origin**: in production the API serves the built SPA; in dev Vite proxies `/api` to the API.

## Local setup

Prerequisites: **Bun ≥ 1.3.0** and **Docker** (for Postgres).

```bash
git clone <repo-url> && cd ajaia-text-editor
bun install
cp .env.example apps/api/.env        # defaults match the bundled Postgres
docker compose up -d postgres        # Postgres on :5432
bun run db:migrate                   # create the schema
bun run db:seed                      # seed demo accounts + documents
bun run dev                          # API on :3001, web on :5173
```

Open **http://localhost:5173**. Vite proxies `/api` to the API (:3001), so the browser stays same-origin.

## Environment variables

Set in `apps/api/.env` (copied from `.env.example`).

| Variable                                                                 | Purpose                                                    | Required            |
| ------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------- |
| `DATABASE_URL`                                                           | PostgreSQL connection string                               | Yes                 |
| `NODE_ENV`                                                               | `development` / `production` (prod sends `Secure` cookies) | No (dev)            |
| `PORT`                                                                   | API port                                                   | No (3001)           |
| `LOG_LEVEL`                                                              | `debug` / `info` / `warn` / `error`                        | No                  |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Cloudflare R2 — enables attachment storage                 | No                  |
| `R2_PUBLIC_BASE_URL`                                                     | Public base URL for R2 files                               | No                  |
| `RESEND_API_KEY`, `EMAIL_FROM`                                           | Resend — enables welcome / document-shared emails          | No                  |
| `APP_URL`                                                                | Base URL used in email links                               | No (localhost:3001) |

## Testing

With Postgres running and migrated:

```bash
cd apps/api && bun test     # or, from the root: bun run test
```

The meaningful test is an integration test for the access-control layer (`apps/api/src/services/access/access.service.test.ts`) against a real Postgres. It asserts permissions for **owner / editor / viewer / non-shared** users and a **soft-deleted** document, plus a route-level **404** when a non-shared user requests a document.

## Project structure

```
apps/
  api/    Elysia API — auth, documents, sharing, access control, Kysely migrations, seed
  web/    React SPA — TanStack Router routes, TipTap editor, shadcn UI, Eden client
packages/
  ui/             shared shadcn/ui components (@repo/ui)
  eslint-config/  shared ESLint config
  tsconfig/       shared TypeScript configs
Dockerfile, render.yaml   single-origin production deploy (Render)
```

## Scope & tradeoffs

Intentionally cut to keep the assignment focused:

- **No real-time collaboration** — debounced autosave + version snapshots instead of live cursors / CRDT.
- **No comment UI** — the `commenter` role exists in the access model but currently behaves like a viewer.
- **Attachment storage built, upload UI deferred** — the R2 storage layer and `attachments` table exist, but the upload UI isn't wired.
- **Version snapshots aren't coalesced** — every content save writes a new snapshot.

With another 2–4 hours I'd: wire the attachment upload UI to R2, coalesce rapid version snapshots into one, and add the comment UI for the `commenter` role.

Full rationale and design decisions live in [ARCHITECTURE.md](./ARCHITECTURE.md).
