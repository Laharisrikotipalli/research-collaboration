# Research Collaboration Explorer

A small web app for exploring how researchers, papers, and topics connect —
built on **CognoDB**, a managed graph database, via the official Neo4j driver.

Search for a researcher and see their co-authors, papers, and topics. Find the
shortest chain of collaboration between two researchers who've never worked
together directly. Explore a paper's citation neighborhood two hops out. Browse
by topic to see who's active in a field and which topics cluster together.

---

## Why a graph database?

The interesting questions in this domain are all about **relationships**, not
records:

- *"How are these two researchers connected?"* — a variable-length path
  question. In a relational schema this means repeated self-joins on an
  `authorships` table, or a recursive CTE that gets slower and harder to
  read with every extra hop. In Cypher it's a single pattern:
  `shortestPath((a)-[:AUTHORED*2..10]-(b))`.
- *"What does this paper's citation neighborhood look like two hops out?"* —
  again a variable-depth traversal. SQL can do 1 hop cheaply with a join,
  2 hops with a messier join, and rapidly becomes unmanageable beyond that.
  `MATCH (p)-[:CITES*1..2]->(related)` expresses it directly, at any depth,
  without changing the query shape.
- *"Which researchers work on the same topics but have never collaborated?"*
  — a negative relationship pattern (`NOT EXISTS { ... }` over a path). This
  is the kind of query that's technically possible in SQL with `NOT IN` /
  `LEFT JOIN ... IS NULL` subqueries, but reads far less naturally than the
  graph pattern that mirrors how you'd actually describe the question.

None of this is impossible in a relational database — it's that the queries
that matter most for this use case are exactly the ones a graph database is
built to make cheap and readable, while the things a relational database is
best at (rigid schemas, heavy aggregation over flat tables) aren't the
questions this application needs to answer.

---

## Data model

```
 (:Author {id, name, institution, h_index})
        │
        │ AUTHORED
        ▼
 (:Paper {id, title, year, abstract, citation_count})
        │                    │
        │ ABOUT              │ CITES
        ▼                    ▼
 (:Topic {id, name})   (:Paper)
```

**Nodes**
| Label    | Properties |
|----------|------------|
| `Author` | `id`, `name`, `institution`, `h_index` |
| `Paper`  | `id`, `title`, `year`, `abstract`, `citation_count` |
| `Topic`  | `id`, `name` |

**Relationships**
| Type | Direction | Meaning |
|------|-----------|---------|
| `AUTHORED` | `(Author)->(Paper)` | this author wrote this paper |
| `CITES` | `(Paper)->(Paper)` | this paper cites that paper |
| `ABOUT` | `(Paper)->(Topic)` | this paper covers this topic |

Co-authorship isn't stored as its own edge — it's *derived* by traversing
`Author-[:AUTHORED]->Paper<-[:AUTHORED]-Author`. That's a deliberate modeling
choice: storing it directly would duplicate information already implied by
the authorship edges and risk the two going out of sync.

A rendered diagram image is in `docs/data-model.png` (see Screenshots below
for how to regenerate it from your own console/whiteboard tool if needed).

---

## Project structure

```
research-collaboration-explorer/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, startup health check
│   │   ├── config.py        # env-var-only configuration
│   │   ├── db.py            # Neo4j driver wrapper, connection error handling
│   │   ├── routes/          # HTTP endpoints
│   │   └── queries/         # all Cypher, kept separate from route logic
│   ├── scripts/
│   │   └── seed.py          # deterministic seed data generator + loader
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/           # Author / Paper / Topic explorers, Collaboration Path
│   │   ├── components/      # shared layout, loading/empty/error states
│   │   └── services/api.js  # single place all backend calls go through
│   └── .env.example
├── docs/                    # data model diagram
├── screenshots/             # UI screenshots for submission
└── README.md
```

---

## Setup

### 1. Create your CognoDB instance

1. Sign up at [console.cognodb.com/signup](https://console.cognodb.com/signup) (no card required).
2. Create a free **c0** instance and pick a region — provisioning takes under a minute.
3. Copy the connection URI (`bolt+s://<instance-id>.databases.cognodb.cloud`)
   and the generated password for the `cognodb` user. **The password is shown
   once** — store it immediately.

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env with your COGNODB_URI and COGNODB_PASSWORD

python -m scripts.seed        # loads ~150 authors, 400 papers, 15 topics
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/api/health` — it should return `{"status": "ok"}`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:8000
npm run dev
```

Visit `http://localhost:5173`.

### Option: run both with one command

Once the backend venv and frontend `node_modules` are set up (steps above) and
both `.env` files are filled in, start everything from the repo root:

```bash
./run.sh
```

This runs the backend and frontend together in one terminal and stops both
cleanly on Ctrl+C.

### Option: Docker Compose

No local Python/Node setup needed — just Docker.

```bash
cp .env.example .env    # fill in COGNODB_URI and COGNODB_PASSWORD
docker compose run --rm seed     # loads seed data (one-off)
docker compose up                # starts backend on :8000, frontend on :5173
```

---

## Seed data

`backend/scripts/seed.py` generates a **deterministic** (seeded RNG, no
external API calls) but realistic graph: 150 authors clustered into
collaboration groups, 400 papers with topic assignments and a citation graph
that only points backward in time, and 15 research topics. Re-running the
script wipes and reloads the database, so it's safe to run repeatedly during
development.

---

## Main queries, explained

All queries live in `backend/app/queries/` and are executed as **parameterised**
Cypher through the official driver — no string concatenation anywhere.

**Shortest collaboration path** (`queries/authors.py::SHORTEST_COLLABORATION_PATH`)
```cypher
MATCH path = shortestPath(
  (a:Author {id: $author_a})-[:AUTHORED*2..10]-(b:Author {id: $author_b})
)
RETURN [n IN nodes(path) | {...}] AS nodes, length(path) AS hops
```
Finds the shortest chain of shared papers connecting two researchers — the
assignment's required 2+ hop traversal. Powers the **Collaboration Path** tab.

**2-hop citation neighborhood** (`queries/papers.py::CITATION_NEIGHBORHOOD`)
```cypher
MATCH path = (p:Paper {id: $paper_id})-[:CITES*1..2]->(related:Paper)
RETURN [n IN nodes(path) | {...}] AS chain, length(path) AS hops
```
Shows what a paper cites, and what those papers cite in turn — the kind of
expanding neighborhood query that gets unwieldy in SQL past 1-2 joins.

**Potential collaborators** (`queries/authors.py::POTENTIAL_COLLABORATORS`)
```cypher
MATCH (a:Author {id: $author_id})-[:AUTHORED]->(:Paper)-[:ABOUT]->(t:Topic)
MATCH (b:Author)-[:AUTHORED]->(:Paper)-[:ABOUT]->(t)
WHERE a <> b
  AND NOT EXISTS { MATCH (a)-[:AUTHORED]->(:Paper)<-[:AUTHORED]-(b) }
RETURN DISTINCT b.id AS id, b.name AS name, ...
```
The query a relational database would find awkward: "same topic, never
co-authored" is a relationship-shaped negative condition, not a simple filter.

---

## Error handling

- The FastAPI app checks CognoDB connectivity on startup and logs a warning
  (rather than crashing) if it's unreachable, so the process stays up and
  reports a clear health status.
- Every route catches connection failures and returns **503** with a plain
  message; the frontend surfaces this as a retryable error state rather than
  a blank screen or raw stack trace.
- Every list view has an explicit **empty state** (e.g. "No authors found")
  distinct from the loading and error states.

---

## Deployment

- **Backend:** deploy `backend/` to Render, Railway, or Fly.io (free tier).
  Set `COGNODB_URI`, `COGNODB_USERNAME`, `COGNODB_PASSWORD`, and `CORS_ORIGINS`
  as environment variables in the platform's dashboard — never in code.
- **Frontend:** deploy `frontend/` to Vercel or Netlify. Set `VITE_API_URL`
  to your deployed backend's URL.
- **Demo link:** _add your hosted URL here before submitting_.
- **Screen recording:** _add your recording link here before submitting_.

---

## Screenshots

_Add screenshots of the four main views (Author Explorer, Paper Explorer,
Topic Explorer, Collaboration Path) to `screenshots/` and reference them here
before submitting._

---

## Tech stack

- **Database:** CognoDB (openCypher over Bolt)
- **Backend:** Python, FastAPI, official `neo4j` driver
- **Frontend:** React + Vite, Tailwind CSS, React Router
