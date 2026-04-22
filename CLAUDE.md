# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

| Category | Command | Description |
|---|---|---|
| Stack | `npm start` | Spin up Docker Compose (db + API + Web). Requires Docker. |
| Stack | `npm run start:clean` | Rebuild images then start stack. |
| Stack | `npm run start:dev` | Start stack **with Storybook** in a single profile (db + api + web + storybook). |
| Stack | `npm run start:dev:clean` | Rebuild all images then start dev stack. |
| Stack | `npm run stop` | Stop all services (incl. Storybook). |
| Stack | `npm run clean` | Stop containers and remove volumes (DB wiped). |
| Logs | `npm run logs` | Tail all Docker logs. |
| Logs | `npm run logs:api` | Tail API logs only. |
| Logs | `npm run logs:web` | Tail Web logs only. |
| Tests | `npm test` | Run service tests + workflow validation. |
| Tests | `npm run test:services` | Run API + Web unit tests. |
| Tests | `npm run test:api` | Run API tests. |
| Tests | `npm run test:web` | Run Web tests. |
| Tests | `npm run test:workflows:validate` | Quick workflow syntax check (≈1 s). |
| Tests | `npm run test:workflows` | Full workflow test using `act` (≈15 min). |
| Single Test | `npm run test:api -- -t <name>` | Run a single API test by name. |
| Single Test | `npm run test:web -- -t <name>` | Run a single Web test by name. |
| Storybook | `npm run storybook` | Run local Storybook (requires Node). |
| Storybook | `npm run storybook:build` | Build static Storybook output. |
| Storybook | `npm run storybook:docker` | Run Storybook container. |
| Prisma | `npm run db:migrate` | Apply Prisma migrations in API. |
| Prisma | `npm run db:seed` | Seed sample data in API. |
| Prisma | `npm run db:reset` | Reset DB (migrate + seed). |

## High‑Level Architecture

The repo is split into two main services, both under `services/`:

1. **API** (`services/api`)
   * Apollo Server v4 (end‑of‑life) with TypeScript.
   * Prisma ORM with PostgreSQL (`prisma/schema.prisma`).
   * GraphQL schema in `src/schema.ts`; resolvers live in `src/resolvers/`.
   * DataLoader factories (`src/loaders.ts`) to prevent N+1 queries.
   * PubSub (`src/pubsub.ts`) for real‑time subscriptions.
   * Docker image built by `docker-compose.yml` – the container starts the server on port 4000 and runs migrations on first boot.

2. **Web** (`services/web`)
   * React 18 with TypeScript, bundled by Vite.
   * Apollo Client setup in `src/apollo/` with split HTTP/WS link.
   * UI components under `src/components/`.
   * TailwindCSS for styling.
   * Storybook runs separately (profile `storybook` in Docker or local via `npm run storybook`).

The root `docker-compose.yml` defines services:

- `db` – PostgreSQL 16.
- `api` – API container.
- `web` – Web container.
- `storybook` – Optional Storybook container.

All services share the same Docker network; the API is exposed on `localhost:4000`, Web on `localhost:5173`, and Storybook on `localhost:6006`.

## Quick Tips for New Contributors

## Branch, Write, Review, Ship

| Step | Action | Command |
|---|---|---|
| 1 | Create a date‑prefixed branch | `git checkout -b $(date +%Y.%m.%d)/branch-name && git push --set-upstream origin $(date +%Y.%m.%d)/branch-name` |
| 2 | Edit or add files | Edit files locally. |
| 3 | Pause for review | Verify changes, fix linter warnings. |
| 4 | Commit | Stage relevant files, use a semantic commit and sign: `git commit -S -m "feat: <desc>"` |
| 5 | Push and create PR | `gh pr create --title "feat: <description>" --body "..."` |
| 6 | Review diff | `gh pr diff <PR_NUMBER>` |
| 7 | Auto‑approve & watch CI | `gh pr review <PR_NUMBER> --approve && gh pr checks <PR_NUMBER> --watch` |
| 8 | Merge & delete branch | `gh pr merge <PR_NUMBER> --merge --delete-branch` |
| 9 | Sync main | `git checkout main && git pull` |


## Merge & Release

| Action | Command | Description |
|---|---|---|
| Create a PR | `gh pr create --title "feat: <description>" --body "..."` | Open a GitHub pull request |
| Review & Approve | `gh pr review <PR_NUMBER> --approve` | Approve the PR |
| Watch CI | `gh pr checks <PR_NUMBER> --watch` | Watch CI status |
| Merge PR | `gh pr merge <PR_NUMBER> --merge --delete-branch` | Merge the PR and delete branch |
| Sync main | `git checkout main && git pull` | Pull latest main |


- **Local dev**: `npm run start:dev` to get everything up. No local Node needed if you use Docker.
- **Testing**: Run `npm test` for fast CI‑style checks. Use `-t` to target a single test.
- **Schema**: GraphQL types live in `services/api/src/schema.ts`; use `services/api/src/resolvers/` for query/mutation logic.
- **Database**: Run `npm run db:migrate` after pulling a branch that changes the Prisma schema.
- **Storybook**: `npm run storybook` for local dev; `npm run storybook:build` for static site.

---

Feel free to edit this file if you discover missing or outdated commands.
