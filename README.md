# Research Collaboration Explorer

### A graph-powered research discovery application backed by CognoDB

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://research-collaboration-iota.vercel.app/)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://research-collaboration.onrender.com/)
[![Database](https://img.shields.io/badge/Database-CognoDB-1E88E5?style=for-the-badge)](https://cognodb.com/)

Research Collaboration Explorer is a full-stack graph database application for discovering relationships between researchers, research papers, topics, citations, and potential collaborators.

Instead of treating research information as isolated rows, the application models the research ecosystem as a connected graph and uses graph traversal to answer relationship-oriented questions.

---

## 🚀 Live Demo

### Frontend

https://research-collaboration-iota.vercel.app/

### Backend API

https://research-collaboration.onrender.com/

### API Documentation

https://research-collaboration.onrender.com/docs

---

## 📌 Project Overview

Research is highly interconnected:

- Researchers write papers.
- Researchers collaborate with other researchers.
- Papers cite other papers.
- Papers belong to multiple research topics.
- Researchers work across multiple topics.
- Researchers can be connected indirectly through collaboration networks.

A traditional relational schema can represent these entities, but relationship-heavy questions quickly become more complex as the number of hops increases.

Research Collaboration Explorer uses **CognoDB as the graph database layer** to model and traverse these relationships directly.

The application allows users to:

- Search for researchers
- Explore researcher profiles
- View publications
- Discover co-authors
- Explore research topics
- Visualize research networks
- Find collaboration paths between researchers
- Explore citation relationships
- Discover potential collaborators based on shared research interests

---

# ✨ Features

## 👩‍🔬 Researcher Explorer

Search for researchers and explore:

- Researcher information
- Institution
- h-index
- Published papers
- Co-authors
- Research topics
- Potential collaborators

---

## 📄 Paper Explorer

Explore research papers and their relationships.

Users can discover:

- Paper title
- Publication year
- Citation information
- Authors
- Research topics
- Cited papers
- Citation relationships

---

## 🏷️ Topic Explorer

Explore research areas and discover researchers and papers associated with a topic.

Example topics include:

- Natural Language Processing
- Cryptography
- Distributed Systems
- Systems Security
- Causal Inference
- Computational Biology

---

## 🔗 Collaboration Path

The Collaboration Path feature demonstrates one of the primary advantages of a graph database.

Users can select two researchers and discover how they are connected through collaboration relationships.

Example:

```text
Researcher A
     │
   AUTHORED
     │
   Paper 1
     │
   AUTHORED
     │
Researcher B
     │
   AUTHORED
     │
   Paper 2
     │
   AUTHORED
     │
Researcher C
```

The application can traverse multiple relationships to discover connections that are not necessarily direct.

---

## 🕸️ Research Network Visualization

The application provides an interactive representation of research relationships.

The graph can represent connections between:

```text
Authors
   │
   ├── Papers
   │
   ├── Co-authors
   │
   └── Topics

Papers
   │
   ├── CITES → Papers
   │
   └── ABOUT → Topics
```

This makes relationship-heavy research data easier to understand visually.

---

## 🔍 Citation Network

Research papers are connected through citation relationships.

The application supports citation traversal to explore papers connected through multiple citation hops.

For example:

```text
Paper A
   │
  CITES
   ↓
Paper B
   │
  CITES
   ↓
Paper C
```

This allows users to explore citation neighborhoods instead of viewing papers independently.

---

## 🤝 Potential Collaborators

The application identifies researchers who have overlapping research interests but have not directly collaborated.

Potential collaborators are discovered using graph relationships between:

```text
Author → Paper → Topic ← Paper ← Author
```

This provides a graph-native way to identify researchers working in related areas.

---

# 🧠 Why a Graph Database?

Research data is fundamentally relationship-oriented.

The important questions are often not:

> "What papers exist?"

but:

> "How are these researchers connected?"

> "Who has collaborated with this researcher?"

> "What papers are connected through citations?"

> "Which researchers work on related topics?"

> "What is the shortest collaboration path between two researchers?"

These queries involve traversing relationships across multiple entities.

## Relational approach

In a relational database, answering a multi-hop relationship question can require:

- Multiple JOINs
- Self-joins
- Recursive CTEs
- Intermediate result sets
- Increasingly complex query logic as traversal depth grows

For example, finding a collaboration path across several researchers can require repeatedly joining researcher and paper tables.

## Graph approach

In CognoDB, the relationships are first-class graph edges.

A traversal can directly express the relationship:

```text
Author → Paper → Author → Paper → Author
```

This makes relationship-heavy queries more natural and easier to reason about.

The project therefore uses CognoDB specifically because the core application questions are about **connections and paths**, rather than simply retrieving independent records.

---

# 🗂️ Data Model

The application uses the following graph model.

## Nodes

### Author

```text
(:Author {
    id,
    name,
    institution,
    h_index
})
```

### Paper

```text
(:Paper {
    id,
    title,
    year,
    abstract,
    citation_count
})
```

### Topic

```text
(:Topic {
    id,
    name
})
```

---

# 🔗 Relationships

### Author → Paper

```text
(:Author)-[:AUTHORED]->(:Paper)
```

Represents authorship.

---

### Paper → Paper

```text
(:Paper)-[:CITES]->(:Paper)
```

Represents a citation relationship.

---

### Paper → Topic

```text
(:Paper)-[:ABOUT]->(:Topic)
```

Represents the research topics associated with a paper.

---

## Graph Model Diagram

```text
                       ┌──────────────┐
                       │    Topic     │
                       └──────▲───────┘
                              │
                           ABOUT
                              │
┌──────────────┐          ┌───┴──────────┐
│    Author    │ AUTHORED │    Paper     │
└──────┬───────┘─────────►└──────┬───────┘
       │                         │
       │                         │ CITES
       │                         │
       │                         ▼
       │                  ┌──────────────┐
       │                  │    Paper     │
       │                  └──────────────┘
       │
       │
       └────── AUTHORED ──────► Paper
```

---

# 🧬 Example Graph

A simplified example:

```text
(Aisha Chen)
      │
   AUTHORED
      ↓
(Towards Robust Causal Inference)
      │
    ABOUT
      ↓
(Causal Inference)

(Aisha Chen)
      │
   AUTHORED
      ↓
(Towards Robust Cryptography)
      │
    CITES
      ↓
(Previous Cryptography Paper)
```

This structure allows the application to traverse relationships directly.

---

# 🔎 Graph Queries

The application uses parameterized Cypher queries through the official Neo4j driver.

No user-provided values are concatenated directly into Cypher strings.

---

## 1. Author Search

Conceptually:

```cypher
MATCH (a:Author)
WHERE toLower(a.name) CONTAINS toLower($name)
RETURN a
ORDER BY a.name
```

The search value is supplied as a query parameter.

---

## 2. Author's Papers

```cypher
MATCH (a:Author {id: $authorId})-[:AUTHORED]->(p:Paper)
RETURN p
ORDER BY p.year DESC
```

---

## 3. Co-authors

The application can discover researchers who have collaborated through shared papers.

Conceptually:

```cypher
MATCH (a:Author {id: $authorId})
      -[:AUTHORED]->(p:Paper)
      <-[:AUTHORED]-(co:Author)
WHERE co.id <> a.id
RETURN co, count(p) AS sharedPapers
ORDER BY sharedPapers DESC
```

This is naturally represented as a graph traversal:

```text
Author
  ↓
Paper
  ↑
Author
```

---

## 4. Multi-hop Collaboration Path

One of the core graph-native features is multi-hop traversal.

Conceptually:

```cypher
MATCH path =
  (a:Author {id: $fromId})
  -[:AUTHORED|CITES*1..6]-
  (b:Author {id: $toId})
RETURN path
LIMIT 1
```

The exact query is implemented in the backend query layer according to the application's collaboration model.

The important characteristic is that the application can traverse multiple relationship hops instead of requiring a fixed number of joins.

---

## 5. Citation Traversal

Citation relationships can be explored across multiple hops.

Conceptually:

```cypher
MATCH path =
  (p:Paper {id: $paperId})
  -[:CITES*1..2]-
  (related:Paper)
RETURN related
```

The application uses this relationship to create citation neighborhoods.

---

## 6. Potential Collaborators

Researchers can be discovered through shared research topics while excluding researchers who have already collaborated directly.

Conceptually:

```cypher
MATCH (a:Author {id: $authorId})
      -[:AUTHORED]->(:Paper)
      -[:ABOUT]->(t:Topic)
      <-[:ABOUT]-(:Paper)
      <-[:AUTHORED]-(candidate:Author)

WHERE candidate.id <> a.id

RETURN candidate,
       collect(DISTINCT t.name) AS sharedTopics
ORDER BY size(sharedTopics) DESC
```

This demonstrates how multiple graph relationships can be combined to answer a relationship-oriented discovery problem.

---

# 🏗️ Architecture

The project follows a three-layer architecture.

```text
                    USER
                     │
                     ▼
        ┌────────────────────────┐
        │   React + Vite         │
        │   Frontend             │
        └────────────┬───────────┘
                     │
                  REST API
                     │
                     ▼
        ┌────────────────────────┐
        │   FastAPI              │
        │   Backend              │
        │                        │
        │   Routes               │
        │      ↓                 │
        │   Queries              │
        │      ↓                 │
        │   Neo4j Driver         │
        └────────────┬───────────┘
                     │
                  Bolt
                     │
                     ▼
        ┌────────────────────────┐
        │       CognoDB          │
        │    Graph Database      │
        └────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- react-force-graph-2d

## Backend

- Python
- FastAPI
- Uvicorn
- Official Neo4j Python Driver

## Database

- CognoDB
- openCypher
- Bolt protocol

## Deployment

- Vercel — Frontend
- Render — Backend
- CognoDB — Graph database

---

# 📁 Project Structure

```text
research-collaboration/
│
├── backend/
│   ├── app/
│   │   ├── queries/
│   │   │   ├── authors.py
│   │   │   ├── papers.py
│   │   │   └── topics.py
│   │   │
│   │   ├── routes/
│   │   │   ├── authors.py
│   │   │   ├── graph.py
│   │   │   ├── papers.py
│   │   │   └── topics.py
│   │   │
│   │   ├── config.py
│   │   ├── db.py
│   │   └── main.py
│   │
│   ├── scripts/
│   │   └── seed.py
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
│
├── docker-compose.yml
├── run.sh
├── .env.example
├── .gitignore
└── README.md
```

---

# ⚙️ Local Setup

## Prerequisites

Install:

- Python 3.12+
- Node.js 18+
- npm
- Git
- A CognoDB Cloud account

---

## 1. Clone the Repository

```bash
git clone https://github.com/Laharisrikotipalli/research-collaboration.git
```

```bash
cd research-collaboration
```

---

## 2. Create a CognoDB Instance

Create a CognoDB Cloud account and provision a free instance.

CognoDB provides a Bolt connection URI and credentials for connecting through the official Neo4j driver.

Save the generated credentials securely.

Do not commit them to Git.

---

## 3. Configure Backend Environment Variables

Create:

```text
backend/.env
```

using:

```text
backend/.env.example
```

Configure:

```env
COGNODB_URI=bolt+s://YOUR-INSTANCE.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=YOUR_PASSWORD
CORS_ORIGINS=http://localhost:5173
```

Never commit this file.

---

## 4. Configure Frontend Environment Variables

Create:

```text
frontend/.env
```

Configure:

```env
VITE_API_URL=http://localhost:8000
```

Never commit this file.

---

## 5. Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 6. Seed the Database

Run the included seed script:

```bash
python -m scripts.seed
```

The script creates the realistic research graph data used by the application.

---

## 7. Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API should be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

## 8. Start the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application should be available at:

```text
http://localhost:5173
```

---

# 🌐 Production Deployment

The application is deployed using:

```text
Frontend → Vercel
Backend  → Render
Database → CognoDB
```

## Frontend

Live frontend:

https://research-collaboration-iota.vercel.app/

The Vercel deployment uses:

```env
VITE_API_URL=https://research-collaboration.onrender.com
```

---

## Backend

Live backend:

https://research-collaboration.onrender.com/

API documentation:

https://research-collaboration.onrender.com/docs

---

## Production CORS

The backend is configured to accept requests from the deployed Vercel frontend.

```env
CORS_ORIGINS=https://research-collaboration-iota.vercel.app
```

---

# 🔐 Security

Database credentials are never stored in source code.

The following values are provided through environment variables:

```text
COGNODB_URI
COGNODB_USERNAME
COGNODB_PASSWORD
CORS_ORIGINS
VITE_API_URL
```

The repository contains only example environment files:

```text
.env.example
backend/.env.example
frontend/.env.example
```

Actual `.env` files are excluded using `.gitignore`.

The frontend never connects directly to CognoDB.

The architecture is:

```text
Browser
   ↓
Frontend
   ↓
FastAPI API
   ↓
CognoDB
```

---

# 🧪 Error Handling

The application handles common runtime states including:

### Loading state

Displayed while data is being retrieved.

### Empty state

Displayed when a search or query returns no results.

### Error state

Displayed when the backend or database cannot be reached.

### Database unavailable

The backend handles database connectivity failures without exposing database credentials or internal connection details to the user.

---

# 🎨 UI/UX

The application uses a dark research-oriented visual design with:

- Responsive layout
- Clear navigation
- Search interfaces
- Researcher cards
- Paper cards
- Topic exploration
- Graph visualization
- Collaboration path visualization
- Loading states
- Empty states
- Error states
- Responsive layouts
- Research-focused illustrations

The goal is to make graph relationships understandable to a non-technical user rather than exposing raw database structures.

---

# 🎥 Demo Video

A short walkthrough demonstrates:

1. Homepage
2. Researcher search
3. Researcher details
4. Research network
5. Paper exploration
6. Citation traversal
7. Collaboration path
8. Potential collaborators
9. Graph database architecture

**Demo Video:**
https://drive.google.com/file/d/1DR0li0u8AmlzZvbuu6gc8KvXCFhRjPgL/view?usp=sharing

---

# 📊 Example User Flow

A typical user session:

```text
Open Research Collaboration Explorer
              ↓
Search for a researcher
              ↓
View researcher profile
              ↓
Explore publications
              ↓
Explore research topics
              ↓
Visualize collaboration network
              ↓
Find potential collaborators
              ↓
Select another researcher
              ↓
Calculate collaboration path
              ↓
Explore connected papers
              ↓
Traverse citation relationships
```

---

# 💡 Example Graph Questions

The application is designed around questions such as:

### Researcher relationships

> Who has collaborated with this researcher?

### Multi-hop collaboration

> How are Researcher A and Researcher B connected?

### Citation exploration

> Which papers are connected to this paper within multiple citation hops?

### Research discovery

> Which researchers work on similar research topics?

### Collaboration discovery

> Which researchers could be potential collaborators based on shared research interests?

These questions are relationship-centric and therefore map naturally to a graph data model.

---

# 🧩 Graph-Native Operations

The most important graph operations in this project are:

```text
Author → Paper
```

Authorship traversal.

```text
Author → Paper → Author
```

Co-author discovery.

```text
Paper → Paper
```

Citation traversal.

```text
Author → Paper → Topic ← Paper ← Author
```

Research-interest based collaborator discovery.

```text
Author → Paper → Author → Paper → Author
```

Multi-hop collaboration discovery.

---

# 📐 Engineering Design

The backend follows separation of concerns.

```text
Routes
  ↓
Query Layer
  ↓
Database Driver
  ↓
CognoDB
```

### Routes

Responsible for:

- HTTP requests
- Parameter validation
- HTTP responses
- Error handling

### Query Layer

Contains the Cypher queries used by the application.

### Database Layer

Manages the Neo4j driver connection and interaction with CognoDB.

### Configuration

Loads connection details from environment variables.

This structure keeps database logic separate from HTTP routing and makes the code easier to maintain.

---

# 🔄 Data Loading

The repository includes:

```text
backend/scripts/seed.py
```

The seed script creates the initial graph dataset used by the application.

The dataset contains interconnected:

- Authors
- Papers
- Topics
- Authorship relationships
- Citation relationships
- Topic relationships

The script allows the graph database to be recreated without manually entering data.

---

# 🐳 Docker

The project includes Docker support.

Backend:

```text
backend/Dockerfile
```

Frontend:

```text
frontend/Dockerfile
```

Local orchestration:

```text
docker-compose.yml
```

Docker support allows the application components to be run in a consistent environment.

---

# 📋 API Overview

The backend exposes API routes for the main application domains:

```text
Authors
Papers
Topics
Graph / Collaboration
```

Interactive API documentation is available at:

https://research-collaboration.onrender.com/docs

The Swagger interface can be used to inspect and test the backend endpoints.

---

# 🚀 Future Improvements

Potential future improvements include:

- Larger research datasets
- More advanced graph centrality metrics
- Community detection
- Research trend analysis
- Institution-level collaboration networks
- Advanced citation ranking
- Personalized researcher recommendations
- More sophisticated collaborator scoring
- Additional graph visualization controls

These are intentionally outside the current core scope.

---

# 📚 Assignment Context

This project was built as a take-home assessment for the **Software Engineer (Full-Stack / Web)** role.

The assignment evaluates:

- Graph data modeling
- Engineering architecture
- Cypher querying
- Multi-hop traversal
- Application development
- UI/UX
- Error handling
- Code organization
- Ability to explain and defend technical decisions

The project uses CognoDB as the graph database layer and the official Neo4j driver for database communication.

---

# 👩‍💻 Author

**Lahari Sri Kotipalli**

B.Tech — Computer Science and Engineering

Aditya College of Engineering and Technology

---

# 🔗 Links

### Live Application

https://research-collaboration-iota.vercel.app/

### Backend API

https://research-collaboration.onrender.com/

### API Documentation

https://research-collaboration.onrender.com/docs

### GitHub Repository

https://github.com/Laharisrikotipalli/research-collaboration

---

# 📄 License

This project was created as part of a technical assessment and portfolio work.
