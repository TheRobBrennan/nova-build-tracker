# Nova Build Tracker

A manufacturing component build tracker for advanced hardware teams — inspired by the Boltline platform at Stoke Space.

Tracks rocket components through their full build lifecycle: fabrication, inspection, testing, and acceptance — with real-time status updates via GraphQL subscriptions.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Apollo Client |
| API | Apollo Server v4, Node.js, TypeScript, GraphQL |
| Database | PostgreSQL 16, Prisma ORM |
| Real-time | GraphQL Subscriptions over WebSocket (`graphql-ws`) |
| Infrastructure | Docker, Docker Compose |

> **Note**: Apollo Server v4 is end-of-life as of January 26, 2026. An upgrade to Apollo Server v5 is planned for future releases.

## Documentation

| Document | Description |
| --- | --- |
| [Interview Demo Guide](docs/INTERVIEW_DEMO_GUIDE.md) | What this project is, why it was built, how to demo it, and domain vocabulary for the aerospace manufacturing context |

## Quick Start

```bash
# Clone and start entire stack
git clone https://github.com/TheRobBrennan/nova-build-tracker
cd nova-build-tracker
npm start
```

**Access Points:**

- Frontend: <http://localhost:5173>
- GraphQL API: <http://localhost:4000/graphql>
- PostgreSQL: `localhost:5432` (user: `nova`, db: `nova_build_tracker`)
- Storybook: <http://localhost:6006> (separate — see [Storybook](#storybook) below)

The API automatically runs database migrations and seeds sample Nova component data on first start.

## Development Commands

```bash
npm start              # Start core stack: db + api + web (Docker)
npm run start:clean    # Rebuild images and start core stack
npm run start:dev      # Start full dev stack: db + api + web + Storybook
npm run start:dev:clean # Rebuild all images and start full dev stack
npm run stop           # Stop all services
npm run clean          # Stop and remove volumes (wipes DB)
npm run logs           # Tail all service logs
npm run logs:api       # Tail API logs only
npm run logs:web       # Tail web logs only
npm run storybook          # Run Storybook locally (port 6006, requires local Node.js)
npm run storybook:build    # Build static Storybook
npm run storybook:docker   # Run only Storybook in Docker (port 6006)
npm run storybook:logs     # Tail Storybook container logs
```

## Testing

### Test Suite Overview

```bash
npm test            # Run service tests + workflow validation (fast)
npm run test:services      # Service tests only (API + web)
npm run test:workflows:validate  # Quick workflow validation (seconds)
npm run test:workflows     # Full workflow testing with Docker (15+ minutes)
```

### Test Coverage

**Service Tests (`test:services`):**

- API unit tests and type checking
- Web component tests and type checking
- Fast feedback for code changes

**Workflow Validation (`test:workflows:validate`):**

- GitHub Actions workflow syntax and structure
- Required steps and permissions validation
- Test data completeness check
- Documentation presence verification
- Runs in ~1 second

**Full Workflow Testing (`test:workflows`):**

- Complete GitHub Actions execution using `act`
- Docker container builds and workflow simulation
- Integration testing for version bump automation
- Requires Docker and can take 15+ minutes
- Authentication errors expected locally (works in GitHub)

## Storybook

Storybook runs independently of the main Docker stack. It renders components in isolation with no live API or database required.

**Full dev stack (recommended — Docker, no local Node.js required):**

```bash
npm run start:dev:clean    # clean build: db + api + web + Storybook
npm run start:dev          # subsequent runs (no rebuild)
```

Access points when using `start:dev`:

- Web app → <http://localhost:5173>
- Storybook → <http://localhost:6006>

**Storybook only (Docker):**

```bash
npm run storybook:docker
```

**Build static output:**

```bash
npm run storybook:build
```

**Local (Node.js must be installed in `services/web`):**

```bash
cd services/web && npm install
npm run storybook          # http://localhost:6006
```

> On first run, or after adding Storybook dependencies, rebuild the image: `docker compose build storybook`

### Stories

| Component | Stories |
| --- | --- |
| `StatusBadge` | Pending, In Progress, Testing, Accepted, Rejected, All Statuses |
| `ComponentCard` | Pending, In Progress, Testing, Accepted, Rejected, No Stages, All Stages Complete |
| `LaunchLoader` | Connecting (animated full-screen overlay) |
| `CreateComponentForm` | Default (empty form modal) |
| `LiveFeed` | Waiting for Events (empty state) |

Apollo mutations/subscriptions are wrapped in a `MockedProvider` (no mocked responses). The local WebSocket state module (`apollo/client`) is replaced with a no-op mock via a Vite alias, so components never wait on a real WebSocket connection.

## Project Structure

```text
nova-build-tracker/
├── docker-compose.yml
├── services/
│   ├── api/                   # Apollo Server + Prisma
│   │   ├── prisma/
│   │   │   └── schema.prisma  # DB schema + enums
│   │   └── src/
│   │       ├── index.ts       # Server entry + WebSocket setup
│   │       ├── schema.ts      # GraphQL SDL (typeDefs)
│   │       ├── context.ts     # Per-request context + DataLoaders
│   │       ├── loaders.ts     # DataLoader factory (N+1 prevention)
│   │       ├── pubsub.ts      # PubSub for subscriptions
│   │       ├── seed.ts        # Sample data
│   │       └── resolvers/
│   │           ├── query.ts
│   │           ├── mutation.ts
│   │           ├── subscription.ts
│   │           └── component.ts  # Field resolvers (buildStages, testEvents)
│   └── web/                   # React + Apollo Client
│       └── src/
│           ├── apollo/        # Apollo Client setup (HTTP + WS split link)
│           ├── graphql/       # Typed query/mutation/subscription documents
│           ├── types/         # Shared TypeScript types
│           └── components/
│               ├── ComponentList.tsx
│               ├── ComponentCard.tsx
│               ├── CreateComponentForm.tsx
│               └── LiveFeed.tsx
└── README.md
```

## GraphQL Schema

### Key Types

```graphql
enum BuildStatus { PENDING | IN_PROGRESS | TESTING | ACCEPTED | REJECTED }
enum ComponentType { HEAT_SHIELD | ENGINE_COMPONENT | AVIONICS | STRUCTURAL | PROPULSION }

type Component {
  id, name, serialNumber, partNumber, type, status, notes
  buildStages: [BuildStage!]!   # loaded via DataLoader (N+1 safe)
  testEvents: [TestEvent!]!     # loaded via DataLoader (N+1 safe)
}
```

### Operations

```graphql
# Queries
components(status: BuildStatus, type: ComponentType): [Component!]!
component(id: ID!): Component

# Mutations
createComponent(input: CreateComponentInput!): Component!
updateComponentStatus(id: ID!, status: BuildStatus!): Component!
completeBuildStage(stageId: ID!, notes: String): BuildStage!
logTestEvent(componentId: ID!, input: LogTestEventInput!): TestEvent!

# Subscriptions
componentStatusChanged: Component!   # real-time via WebSocket
```

## Version Management

### Automated Version Bumping

This project uses automated version management that triggers on merges to `main`:

- **Major bump**: `feat!`, `fix!`, `refactor!` (breaking changes)
- **Minor bump**: `feat:` (new features)
- **Patch bump**: `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`

The version bump workflow:

1. Detects bump type from commit message
2. Identifies which services changed (API, web, or both)
3. Updates version numbers in affected `package.json` files
4. Creates an automated PR with version changes
5. Waits for CI checks and merges automatically

### Testing Workflows Locally

**Quick Validation (Recommended):**

```bash
# Fast syntax and logic validation (seconds)
npm run test:workflows:validate
```

**Full Integration Testing:**

```bash
# Install act (macOS)
brew install act

# Complete workflow testing with Docker (minutes)
npm run test:workflows

# Test specific workflow
act pull_request -e .github/test-data/pr-events/valid.json -W .github/workflows/ci.yml
```

See [Act Setup Guide](docs/ACT_SETUP.md) for detailed setup instructions.

## Architecture Notes

- **Docker-first**: The entire stack starts with `npm start` — no local Node.js or Postgres required
- **DataLoader**: `buildStages` and `testEvents` on `Component` use DataLoader to batch DB queries per request, preventing the N+1 problem
- **Split link**: Apollo Client routes subscriptions to WebSocket and everything else to HTTP automatically
- **Idempotent seed**: The seed script checks for existing data before inserting — safe to run on every container start
- **Prisma Migrate**: Migrations run automatically via `prisma migrate deploy` in the Docker entrypoint before the server starts
- **Automated versioning**: Semantic version bumps triggered by conventional commit messages on merge to main
- **Note**: This line tests version bump automation
- **Fixed**: Workflow now uses --admin flag for automatic merging
- **Final test**: Verifying complete automation works correctly
- **Fixed workflow**: Now uses direct commits instead of PRs
