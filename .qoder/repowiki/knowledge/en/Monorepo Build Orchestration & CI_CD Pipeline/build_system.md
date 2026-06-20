The AgriNexus Monorepo Orchestrator employs a polyglot monorepo strategy managed by **Turborepo** and **pnpm workspaces**, with containerized deployment via **Docker Compose** and automated CI/CD through **GitHub Actions**.

### 1. Build System & Tooling
- **Package Manager**: `pnpm` (v9) is used for efficient dependency management across the workspace, defined in `pnpm-workspace.yaml` which includes `apps/*` and `packages/*`.
- **Task Runner**: `Turbo` (v2) orchestrates build, lint, test, and type-checking tasks. It leverages remote caching and pipeline dependencies (e.g., `build` depends on `^build`) to optimize execution order and speed.
- **Polyglot Support**: 
  - **Node.js/TypeScript**: Used for `apps/api` (NestJS), `apps/web` (Next.js), and shared packages.
  - **Python**: Used for `apps/ai-service` (FastAPI), managed via `uv` for fast package installation.

### 2. Containerization Strategy
Each service has a dedicated multi-stage `Dockerfile` optimized for size and build cache:
- **API (NestJS)**: Uses a 3-stage build (`base` -> `deps` -> `build` -> `runner`). It isolates dependency installation to cache layers effectively and copies only the compiled `dist` and necessary `node_modules` to the final runner image.
- **Web (Next.js)**: Utilizes Next.js standalone output mode. The builder stage installs all monorepo deps to ensure shared packages are included, then copies the `.next/standalone` output to a minimal runner image.
- **AI Service (FastAPI)**: Uses `python:3.11-slim` and `uv` for rapid dependency resolution. It installs requirements system-wide and runs via `python -m uvicorn`.
- **Orchestration**: `docker-compose.yaml` defines the full stack including `postgres`, `nginx` (reverse proxy), and the three application services, managing networking and environment variables centrally.

### 3. CI/CD Pipeline (GitHub Actions)
The `.github/workflows/ci-cd.yaml` defines a two-stage pipeline:
1. **CI (Test & Lint)**: 
   - Runs on `ubuntu-latest`.
   - Sets up Node 20, pnpm 9, Python 3.11, and `uv`.
   - Executes `pnpm turbo run lint` and `pnpm turbo run test` to validate code quality across the monorepo.
2. **CD (Deploy)**: 
   - Triggered only after successful CI.
   - Uses `appleboy/ssh-action` to SSH into a remote server.
   - Pulls latest code, runs Prisma migrations (`prisma migrate deploy`), and rebuilds/restarts containers via `docker compose up -d --build`.
   - Includes cleanup steps (`docker image prune`) to manage disk space.

### 4. Developer Conventions
- **Scripts**: Root `package.json` exposes turbo-powered scripts: `pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm check-types`.
- **Environment Management**: Each app uses `.env.example` for documentation and `.env` for local secrets. Docker Compose injects env vars at runtime.
- **Code Quality**: Shared `eslint-config` and `prettier` configurations are enforced via Turbo pipelines.