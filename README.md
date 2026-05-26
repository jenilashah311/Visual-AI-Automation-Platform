# Visual AI Agent Workflow Builder

A drag-and-drop platform for designing and running multi-step AI agent pipelines.
Inspired by Langflow and n8n, built from scratch.

## Features

- Visual canvas with React Flow
- 6 node types: Input, LLM Agent, Web Search, Code Executor, Condition, Output
- Live execution streaming via WebSocket
- Save and load workflows from PostgreSQL
- 3 starter templates
- Execution history per workflow

## Tech stack

**Frontend:** React · TypeScript · React Flow · Zustand · Tailwind CSS

**Backend:** FastAPI · Python · SQLAlchemy · Alembic · Redis

**Infrastructure:** PostgreSQL · Redis · Docker Compose

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and fill in API keys (at minimum `GROQ_API_KEY` for LLM nodes):

```bash
cp backend/.env.example backend/.env
```

2. Start Postgres and Redis (uses ports **5433** and **6380** to avoid conflicts with other local projects):

```bash
docker compose up -d
```

3. Backend:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

4. Frontend:

```bash
cd frontend
npm install
npm run dev
```

5. Open http://localhost:5173

## API keys needed

- **GROQ_API_KEY** — https://console.groq.com (keys start with `gsk_`)
- **TAVILY_API_KEY** — https://tavily.com (free tier available)
- **E2B_API_KEY** — https://e2b.dev (free tier available)

## Architecture

### High-level overview

```mermaid
flowchart LR
  U[Browser UI\nReact + React Flow] -->|REST (save/load)| API[FastAPI backend]
  U -->|WebSocket (stream node updates)| WS[WebSocket /ws/executions/{id}]
  API --> Orch[Workflow Orchestrator]
  Orch --> Redis[(Redis)\nnode state cache]
  Orch --> PG[(PostgreSQL)\nworkflows + executions]
  Orch --> LLM[Groq LLM (LLM nodes)]
  Orch --> Tavily[Tavily (Web Search nodes)]
  Orch --> E2B[E2B sandbox (Code Executor nodes)]
```

### Execution flow

```mermaid
sequenceDiagram
  participant UI as UI
  participant API as FastAPI
  participant Orch as Orchestrator
  participant Redis as Redis
  participant PG as PostgreSQL
  participant LLM as Groq

  UI->>API: POST /api/executions (status=pending)
  UI->>API: WebSocket connect /ws/executions/{id}
  API->>PG: update execution status -> running
  Orch->>Orch: validate + topological sort
  loop for each node in DAG order
    Orch->>Redis: set node state (TTL 1h)
    Orch->>LLM: call LLM node (if present)
    Orch->>UI: node_update (status/output/error/duration)
    alt node failed
      Orch->>PG: update execution -> failed
      Orch->>UI: execution_failed
      break
    end
  end
  Orch->>PG: update execution -> completed (+output_data)
  Orch->>UI: execution_completed (final output)
```

## Project structure

```
visual-ai-workflow-builder/
├── frontend/          # React + Vite + TypeScript
├── backend/           # FastAPI + Python
├── docker-compose.yml
└── README.md
```

## Completion checklist

- [ ] `docker compose up -d` starts Postgres and Redis with no errors
- [ ] `alembic upgrade head` runs migrations cleanly
- [ ] Backend starts with `uvicorn main:app --reload` and `/docs` loads
- [ ] Frontend starts with `npm run dev` with no TypeScript errors
- [ ] Can drag an LLM node onto the canvas and configure a prompt
- [ ] Can connect nodes with edges
- [ ] Save workflow → appears in database
- [ ] Load a template → canvas populates correctly
- [ ] Run a "Document Q&A" workflow → WebSocket streams node updates
- [ ] Run a condition workflow → correct branch executes
- [ ] Failing node shows red status and error in log panel
- [ ] All API keys are in `.env` and `.env` is in `.gitignore`
