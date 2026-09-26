# DotUp V3 Platform Foundation

## Existing Repository Structure
The repository currently contains the frozen DotUp V3 Execution Engine (Bash-based CLI). The code is stored at the root and in subdirectories (`lib/`, `modules/`, `scripts/`, `tests/`, `config/`, etc.). 
- The executable is `dotup`.
- Tests are contained in `tests/` and can be executed via `./tests/run_all.sh`.
- The existing execution engine operates independently as a bash CLI.

## Frozen DotUp Service
The current DotUp CLI service is frozen. It will NOT be relocated into a `service/` directory during this foundation milestone in order to avoid unnecessary architecture disruption. It operates safely in its current directories. All new platform layers will be added around it.

## Target Platform Architecture
- **Next.js Frontend** (`frontend/` directory, default React frontend with Next.js App Router)
- **FastAPI Backend** (`backend/` directory, Python REST API)
- **PostgreSQL Database** (Containerized DB via Docker Compose)
- **Local Orchestration** (Docker Compose `docker-compose.yml` at the root)

## Technology Decisions
- **Frontend**: Next.js (TypeScript) for robust, stable UI.
- **Backend**: FastAPI (Python) for API logic.
- **Database**: PostgreSQL 15, well-supported and highly stable.
- **Migrations**: Alembic (Standard for Python / FastAPI + SQLAlchemy ecosystem).
- **Environment**: Docker Compose for local reproducibility. 

## Development Environment
The local development environment uses `docker compose up --build` to orchestrate services:
- `backend`: FastAPI running on port 8000.
- `frontend`: Next.js running on port 3000.
- `postgres`: PostgreSQL running on port 5432.
- Environment variables are defined via `.env` (copied from `.env.example`).

## Planned Container Architecture
```text
                    Docker Compose
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
     ┌─────────┐    ┌─────────┐    ┌──────────┐
     │ Next.js │    │ FastAPI │    │PostgreSQL│
     │ frontend│───▶│ backend │───▶│ database │
     └─────────┘    └─────────┘    └──────────┘
```

## Implementation Roadmap
1. [x] **Step 0**: Inspect repository & Architecture Plan
2. [ ] **Step 1**: Establish Backend Foundation
3. [ ] **Step 2**: Establish PostgreSQL Foundation
4. [ ] **Step 3**: Database Connection Layer
5. [ ] **Step 4**: Migration Infrastructure
6. [ ] **Step 5**: Establish Next.js Foundation
7. [ ] **Step 6**: Frontend → Backend Communication
8. [ ] **Step 7**: Backend → PostgreSQL Verification
9. [ ] **Step 8**: Docker Compose
10. [ ] **Step 9**: Service Startup Dependencies
11. [ ] **Step 10**: Environment Configuration
12. [ ] **Step 11**: Local Developer Experience
13. [ ] **Step 12**: Tests
14. [ ] **Step 13**: DotUp Regression
15. [ ] **Step 14**: Docker Build Verification
16. [ ] **Step 15**: Failure Testing
17. [ ] **Step 16**: Security Baseline
18. [ ] **Step 17**: Documentation Updates & Verification Report
