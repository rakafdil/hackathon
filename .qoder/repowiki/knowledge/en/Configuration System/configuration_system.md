The AgriNexus Monorepo Orchestrator employs a layered configuration strategy combining environment variables, Docker Compose service definitions, and framework-specific configuration modules. 

### 1. Environment Variables & `.env` Files
Each application (`api`, `ai-service`, `web`) maintains its own `.env` and `.env.example` files for local development and runtime secrets. 
- **API (NestJS):** Uses `@nestjs/config` with `ConfigModule.forRoot({ isGlobal: true })` to load environment variables. Key configurations include `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, and `ALLOWED_ORIGINS`. 
- **AI Service (FastAPI):** Relies on Python's `os.getenv()` for simple variable retrieval, such as `API_KEY_EXTERNAL` and `ALLOWED_ORIGINS`.
- **Web (Next.js):** Uses `NEXT_PUBLIC_API_URL` for client-side API endpoint configuration, leveraging Next.js's built-in environment variable handling.

### 2. Docker Compose Orchestration
The root `docker-compose.yaml` serves as the primary configuration orchestrator for the microservices architecture. It:
- Injects environment variables into services using `env_file` directives pointing to each app's `.env` file.
- Overrides or provides default values for critical settings like `DATABASE_URL`, `JWT_SECRET`, and service URLs using the `environment` key.
- Manages service discovery by exposing internal ports and defining dependencies (e.g., `api` depends on `db`).

### 3. Framework-Specific Configuration
- **NestJS:** The `ConfigService` is injected into providers (e.g., `JwtStrategy`) to access typed configuration values, ensuring that missing secrets (like `JWT_SECRET`) throw errors at startup.
- **Next.js:** Configuration is minimal in `next.config.js`, relying heavily on environment variables for dynamic settings like API base URLs.
- **FastAPI:** Configuration is handled imperatively in `main.py` using standard library `os` methods.

### 4. Conventions for Developers
- **Secrets Management:** Never commit `.env` files. Use `.env.example` as a template for required variables.
- **Service Communication:** Use the service names defined in `docker-compose.yaml` (e.g., `db`, `api`) for internal networking.
- **CORS & Origins:** Ensure `ALLOWED_ORIGINS` in the API matches the deployed frontend URL to prevent cross-origin issues.
- **Database Connectivity:** The `DATABASE_URL` is constructed dynamically in Docker Compose using interpolated environment variables to ensure consistency across environments.