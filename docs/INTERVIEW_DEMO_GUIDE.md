# Nova Build Tracker — Interview Demo Guide

## What Is This?

Nova Build Tracker is a **manufacturing component lifecycle tracker** — a simplified version of the kind of platform used by advanced hardware companies (including aerospace manufacturers like Stoke Space) to track physical parts from first fabrication through final acceptance.

Each component — a heat shield panel, an engine nozzle, an avionics board — moves through a defined build lifecycle:

```text
PENDING → IN_PROGRESS → TESTING → ACCEPTED (or REJECTED)
```

At every stage, engineers log what happened: which fabrication steps were completed, which tests were run, and what the results were. This data becomes the **traceability record** for that part — critical for quality assurance, regulatory compliance, and post-flight review.

---

## Why Was This Built?

This project was purpose-built as a **technical interview demonstration** for a Senior Full-Stack Software Developer role at [Stoke Space](https://www.stokespace.com), focused on their **Boltline** platform.

Boltline is Stoke's internal manufacturing operations platform — the system that tracks rocket components as they're built, inspected, tested, and accepted for flight. The job description specifically called out:

- React + TypeScript frontend development
- GraphQL API design (Apollo Client + Apollo Server)
- Real-time data via GraphQL subscriptions
- PostgreSQL with an ORM
- Docker-first development

Rather than talking abstractly about these skills, this project **demonstrates them working together in a domain that directly mirrors the role** — hardware build tracking with real-time updates.

---

## What Does It Actually Do?

### The Domain

Five sample **Nova vehicle components** are seeded at startup:

| Component | Type | Starting Status |
| --- | --- | --- |
| TPS Panel — Windward Segment 1 | Heat Shield | Testing |
| Main Engine Nozzle Assembly | Engine Component | In Progress |
| Flight Computer Board Rev 3 | Avionics | Accepted |
| Fuel Tank Ring Frame — Segment 19 | Structural | Pending |
| LOX Feed Line Assembly | Propulsion | In Progress |

Each component has:

- **Build Stages** — a sequenced list of fabrication steps (e.g., Raw Material Inspection → Machining → NDT Inspection). Each stage can be marked complete with a timestamp.
- **Test Events** — discrete quality/acceptance test records (e.g., `DIMENSIONAL_INSPECTION: PASS`, `VIBRATION_TEST: PASS`).

### The Features

**Filter by status** — tabs at the top filter the component grid by lifecycle stage.

**Advance status** — each card has an "Advance →" button that moves the component to the next lifecycle state. This is where the real-time magic happens.

**Create components** — "+ New Component" opens a form to add a new part with serial number, part number, and type.

**Live Updates feed** — a real-time sidebar that receives WebSocket events whenever any component's status changes. This updates across all connected browser sessions simultaneously.

---

## The Technical Architecture (What to Talk About)

This is the part worth knowing cold for an interview.

### GraphQL Schema Design

```graphql
enum BuildStatus { PENDING | IN_PROGRESS | TESTING | ACCEPTED | REJECTED }
enum ComponentType { HEAT_SHIELD | ENGINE_COMPONENT | AVIONICS | STRUCTURAL | PROPULSION }

type Component {
  id, name, serialNumber, partNumber, type, status, notes
  buildStages: [BuildStage!]!   # resolved via DataLoader
  testEvents: [TestEvent!]!     # resolved via DataLoader
}
```

The schema is intentionally shaped around what **engineers actually need** — status-filtered queries, stage completion mutations, test event logging, and real-time status broadcasts.

### The N+1 Problem — Solved with DataLoader

Fetching a list of 20 components and then fetching `buildStages` and `testEvents` for each would naively make **41 database queries** (1 for the list + 20 + 20). This is the classic N+1 problem.

The solution: **DataLoader** batches all `buildStages` requests across a single GraphQL request into one SQL query with `WHERE componentId IN (...)`. Same for `testEvents`. The result is always **3 queries** no matter how many components are on the page.

```typescript
// services/api/src/loaders.ts
buildStagesByComponentId: new DataLoader(async (ids: readonly string[]) => {
  const stages = await db.buildStage.findMany({
    where: { componentId: { in: [...ids] } },
    orderBy: { sequence: 'asc' },
  });
  return ids.map((id) => stages.filter((s) => s.componentId === id));
}),
```

### Real-Time Subscriptions

When a mutation changes a component's status, the server publishes to a PubSub channel:

```typescript
// mutation resolver
const updated = await ctx.db.component.update({ ... });
await pubsub.publish(COMPONENT_STATUS_CHANGED, { componentStatusChanged: updated });
```

Any connected browser receives this instantly via a WebSocket maintained by `graphql-ws`. The Apollo Client's **split link** routes:

- Queries and mutations → HTTP (`POST /graphql`)
- Subscriptions → WebSocket (`ws://[host]/graphql`)

```typescript
// services/web/src/apollo/client.ts
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,   // ← subscriptions go here
  httpLink  // ← everything else goes here
);
```

### Per-Request Context and Loader Lifecycle

Each GraphQL request gets a fresh `Context` object:

```typescript
// services/api/src/context.ts
export function createContext(db: PrismaClient): Context {
  return {
    db,
    loaders: createLoaders(db),  // new DataLoader instances per request
  };
}
```

New DataLoader instances per request is intentional — it prevents stale cache from leaking between requests.

### Docker Compose Stack

```text
┌─────────────────────────────────────────────────┐
│  Browser (localhost:5173)                        │
│    HTTP queries ─────────────────────────────┐  │
│    WS subscriptions ─────────────────────┐   │  │
└──────────────────────────────────────┬───┼───┼──┘
                                       │   │   │
                          Vite Proxy (ws: true)
                                       │   │   │
┌─────────────────────────────────────────────────┐
│  web container (Vite dev server :5173)           │
│    proxy /graphql → http://api:4000             │
│    proxy /graphql WS → ws://api:4000            │
└──────────────────────────────────────┬──────────┘
                                       │ Docker internal network
┌─────────────────────────────────────────────────┐
│  api container (Apollo Server :4000)             │
│    HTTP: expressMiddleware                       │
│    WS: WebSocketServer + graphql-ws              │
└──────────────────────────────────────┬──────────┘
                                       │
┌─────────────────────────────────────────────────┐
│  db container (PostgreSQL :5432)                 │
│    Prisma ORM / schema push on startup          │
└─────────────────────────────────────────────────┘
```

**Why Vite proxy?** On macOS Docker Desktop, WebSocket connections to directly-mapped container ports (`ws://localhost:4000`) are unreliable. Routing everything through the Vite dev server's proxy (which uses the container-internal network `api:4000`) solves this cleanly.

---

## How to Use This in an Interview

### Showing the Demo Live

1. `npm start` from the project root starts the full stack
2. Open `http://localhost:5173` — components appear immediately
3. Open a second browser window to the same URL — both windows receive real-time updates
4. Click **"Advance →"** on a component in one window — watch it appear in the Live Feed of both windows simultaneously
5. Click **"+ New Component"** — fill the form and create a new part — it appears in the grid instantly

### Conversation Pivots

**If asked about GraphQL schema design:**
> "I shaped the schema around the read patterns first — the most common query is a filtered list of components with their build stages. That immediately raised the N+1 question, which I solved with DataLoader..."

**If asked about real-time features:**
> "Subscriptions over WebSocket using graphql-ws. The Apollo Client uses a split link to route subscription operations to the WebSocket transport automatically. On the server side, mutations publish to a PubSub channel that feeds the subscription resolver..."

**If asked about the database layer:**
> "Prisma with PostgreSQL. The schema has three models: `Component`, `BuildStage`, and `TestEvent`. Build stages have a sequence field so they render in order. Prisma's type-safe client means the resolver code has full TypeScript inference on the query results..."

**If asked about the Docker setup:**
> "Fully Docker Compose — one `npm start` spins up Postgres, the API, and the frontend. The API runs `prisma db push` on startup so the schema is always in sync. I hit an interesting macOS Docker Desktop issue with WebSocket port forwarding and solved it with Vite's built-in proxy..."

**If asked about production considerations:**
> "A few things I'd add for production: `prisma migrate` instead of `db push`, authentication middleware on the GraphQL context, replacing the in-memory PubSub with Redis for horizontal scaling, and `wss://` instead of `ws://` behind a load balancer..."

---

## Domain Vocabulary (Rocket Hardware Context)

Understanding this vocabulary helps when speaking about the demo with aerospace engineers:

| Term | Meaning |
| --- | --- |
| **TPS** | Thermal Protection System — the heat shield that protects the vehicle during reentry |
| **Serial Number** | Unique identifier for a specific physical unit of a part |
| **Part Number** | Identifier for the design/spec — all units of the same design share a part number |
| **Build Stage** | A discrete fabrication or assembly step with a defined completion state |
| **Test Event** | A formal quality or acceptance test with a pass/fail result |
| **Acceptance** | Final sign-off that a component meets spec and is cleared for use in the vehicle |
| **NDT** | Non-Destructive Testing — inspecting parts without damaging them (X-ray, ultrasound) |
| **GNC** | Guidance, Navigation, and Control — the avionics system that flies the rocket |
| **LOX** | Liquid Oxygen — one of the propellants; LOX feed lines carry it from tank to engine |
| **Boltline** | Stoke Space's internal manufacturing operations platform (what this demo is inspired by) |
