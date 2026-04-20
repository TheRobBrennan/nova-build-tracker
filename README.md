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

The API automatically runs database migrations and seeds sample Nova component data on first start.

## Development Commands

```bash
npm start           # Start all services (Docker)
npm run start:clean # Rebuild images and start
npm run stop        # Stop all services
npm run clean       # Stop and remove volumes (wipes DB)
npm run logs        # Tail all service logs
npm run logs:api    # Tail API logs only
npm run logs:web    # Tail web logs only
```

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

## Architecture Notes

- **Docker-first**: The entire stack starts with `npm start` — no local Node.js or Postgres required
- **DataLoader**: `buildStages` and `testEvents` on `Component` use DataLoader to batch DB queries per request, preventing the N+1 problem
- **Split link**: Apollo Client routes subscriptions to WebSocket and everything else to HTTP automatically
- **Idempotent seed**: The seed script checks for existing data before inserting — safe to run on every container start
- **Prisma Migrate**: Migrations run automatically via `prisma migrate deploy` in the Docker entrypoint before the server starts
