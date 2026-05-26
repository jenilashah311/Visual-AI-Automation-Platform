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
  U["Browser UI"] -->|REST save load workflows| API["FastAPI backend"]
  U -->|REST create execution| API
  U -->|WebSocket stream updates| WS["WebSocket endpoint"]
  API --> Orch["Workflow orchestrator"]
  Orch --> Redis["Redis node state cache"]
  Orch --> PG["PostgreSQL workflows and executions"]
  Orch --> LLM["Groq LLM"]
  Orch --> Tavily["Tavily web search"]
  Orch --> E2B["E2B sandbox"]
```

### Execution flow

```mermaid
sequenceDiagram
  participant UI
  participant API
  participant Orchestrator
  participant Redis
  participant PostgreSQL
  participant LLM
  participant Tavily
  participant E2B

  UI->>API: POST /api/executions
  UI->>API: WS connect to /ws/executions
  API->>PostgreSQL: execution running
  Orchestrator->>Orchestrator: validate and topological sort
  Orchestrator->>Redis: save node state
  Orchestrator->>LLM: call LLM node
  Orchestrator->>Tavily: call Web Search node if present
  Orchestrator->>E2B: run Code Executor node if present
  Orchestrator->>UI: node_update
  Orchestrator->>PostgreSQL: set execution completed or failed
  Orchestrator->>UI: execution_completed
  Orchestrator->>UI: execution_failed (if any node fails)
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
