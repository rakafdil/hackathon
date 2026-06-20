# Dependency Management System

## Overview

The AgriNexus monorepo employs a **polyglot dependency management strategy** combining two distinct package ecosystems:

1. **pnpm workspaces** for TypeScript/JavaScript packages (root-level orchestration)
2. **uv** for Python dependencies in the AI service

This dual-system approach reflects the repository's microservices architecture, where each service uses its language-native tooling while sharing common infrastructure through Turborepo.

---

## JavaScript/TypeScript Ecosystem (pnpm)

### Package Manager Configuration

- **Manager**: `pnpm@9.0.0` (pinned in root `package.json` via `packageManager` field)
- **Lockfile format**: v9.0 (`pnpm-lock.yaml` at repo root)
- **Workspace definition**: `pnpm-workspace.yaml` declares two workspace patterns:
  - `apps/*` — application services (api, web)
  - `packages/*` — shared libraries (constants, dto, eslint-config, lib, typescript-config, ui, utils)

### Workspace Protocol Usage

Internal dependencies use the `workspace:*` protocol, which pnpm resolves to local symlinks rather than fetching from npm registries. Examples:

```json
"@repo/constants": "workspace:*"
"@repo/dto": "workspace:*"
"@repo/lib": "workspace:*"
"@repo/utils": "workspace:*"
```

In the lockfile, these resolve as `link:../../packages/constants`, confirming zero network fetches for internal packages.

### Version Pinning Strategy

- **Root-level devDependencies** pin exact versions for build tooling:
  - `turbo`: `^2.9.18` (caret allows minor updates)
  - `typescript`: `5.9.2` (exact version across all packages)
  - `prettier`: `^3.7.4`

- **Application-level dependencies** use caret ranges (`^`) for most third-party packages, allowing automatic minor/patch updates within semver bounds.

- **Critical overrides** in `apps/api/package.json` force specific versions to avoid known issues:
  ```json
  "overrides": {
    "@angular-devkit/core": "19.2.23",
    "@angular-devkit/schematics": "19.2.23",
    "@angular-devkit/schematics-cli": "19.2.23",
    "path-to-regexp": "8.4.2",
    "lodash": "4.18.1"
  }
  ```
  These overrides apply security patches or compatibility fixes that upstream dependencies haven't yet adopted.

### Engine Constraints

- Root: `node >= 18`
- `apps/api`: `node >= 22.0.0` (stricter requirement for NestJS 11)
- Python service: `requires-python = ">=3.12"`

### Registry Configuration

The `.npmrc` file exists but is empty, meaning pnpm defaults to the public npm registry (`https://registry.npmjs.org`). No private registries or custom scopes are configured.

---

## Python Ecosystem (uv)

### Package Manager

- **Tool**: `uv` — a fast Python package installer and resolver
- **Manifest**: `apps/ai-service/pyproject.toml` (PEP 621 format)
- **Lockfile**: `apps/ai-service/uv.lock` (uv native lock format, version 1, revision 3)
- **Fallback**: `apps/ai-service/requirements.txt` (auto-generated via `uv pip compile`)

### Dependency Declaration

```toml
[project]
name = "ai-service"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.137.1",
    "uvicorn>=0.49.0",
]
```

The `uv.lock` file contains full transitive dependency resolution with cryptographic hashes for both source distributions (`.tar.gz`) and wheels (`.whl`), covering multiple platforms (Linux x86_64/aarch64, macOS, Windows).

### Isolation Strategy

The `uv.lock` marks the project as `source = { virtual = "." }`, indicating it operates in a virtual environment context without installing into the system Python. This aligns with the `.python-version` file (present but not read) that likely pins the Python runtime version.

---

## Build Orchestration (Turborepo)

Turborepo (`turbo.json`) coordinates dependency-aware task execution across workspaces:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "!.next/dev/**"]
    },
    "lint": { "dependsOn": ["^lint"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

The `^build` syntax ensures that when `apps/web` builds, all its workspace dependencies (`@repo/ui`, `@repo/constants`, etc.) are built first. This creates an implicit dependency graph derived from `package.json` declarations.

---

## Key Architectural Decisions

### 1. Single Lockfile for JS/TS Monorepo

All JavaScript/TypeScript dependencies across apps and packages are resolved into a single `pnpm-lock.yaml`. This guarantees:
- Consistent transitive dependency versions across the entire monorepo
- Deduplication of shared dependencies (e.g., `typescript`, `eslint` appear once despite being used by multiple packages)
- Atomic installs — either all packages install correctly or none do

### 2. Separate Lockfiles Per Polyglot Service

The Python AI service maintains its own `uv.lock` isolated from the pnpm ecosystem. This prevents cross-language dependency conflicts and allows independent update cycles.

### 3. Workspace-Scoped Shared Packages

Seven shared packages under `packages/` provide reusable code:
- `@repo/constants` — compiled with tsup, distributed as CJS + ESM
- `@repo/dto` — Zod-based schema definitions
- `@repo/eslint-config` — shared ESLint configuration
- `@repo/lib` — utility functions depending on `@repo/constants`
- `@repo/typescript-config` — shared tsconfig presets
- `@repo/ui` — React component library (direct source exports, no build step)
- `@repo/utils` — standalone utilities

These packages use `private: true` and are never published to npm; they exist solely for intra-monorepo consumption.

### 4. Postinstall Hooks for Code Generation

`apps/api/package.json` includes:
```json
"postinstall": "prisma generate"
```
This ensures Prisma client types are regenerated after every `pnpm install`, keeping database bindings synchronized with `schema.prisma`.

---

## Developer Conventions

### Adding Dependencies

- **To an app**: Run `pnpm add <package>` from the app directory (e.g., `cd apps/api && pnpm add lodash`)
- **To a shared package**: Run `pnpm add <package> --filter @repo/<package-name>`
- **To root (dev tools only)**: Run `pnpm add -D <package>` at repo root

### Updating Dependencies

- Run `pnpm update` at root to update all workspaces respecting semver ranges
- Run `pnpm update --latest` to ignore semver constraints (use with caution)
- For Python: `uv lock --upgrade` in `apps/ai-service/`

### Installing

- `pnpm install` at repo root installs all workspace dependencies
- The lockfile is authoritative — modifications to `package.json` without corresponding lockfile updates will cause CI failures

### Version Conflicts

When multiple apps require different versions of the same dependency, pnpm hoists a single compatible version to the root `node_modules/`. Incompatible major versions result in nested installations. Use `pnpm why <package>` to diagnose hoisting decisions.

---

## Security Considerations

- **No private registries**: All dependencies come from public npm/PyPI registries
- **Override pins**: The `apps/api` overrides section pins `lodash` to `4.18.1` (likely addressing a known vulnerability in earlier versions)
- **Lockfile integrity**: The `pnpm-lock.yaml` includes integrity hashes (sha512) for every package, preventing supply-chain tampering
- **Python hash verification**: The `uv.lock` file includes SHA-256 hashes for all distribution files
