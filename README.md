# DocuFlow

AI-assisted enterprise document workflow: **upload → AI extraction → human review → approval → audit.**

> 🚧 In active development. Currently at **Phase 0 — Foundation**.

## Stack

React 19 · TypeScript · Vite · MUI · Redux Toolkit · TanStack Query
Django · DRF · Celery · RabbitMQ · PostgreSQL · Redis · MinIO · Docker Compose · Nginx

## Docs

- [Architecture](./docs/ARCHITECTURE.md) — system design, data model, state machine, pipeline
- [Project plan](./docs/PROJECT_PLAN.md) — phased build roadmap

## Running locally

Requires Docker Desktop.

```bash
cp .env.example .env
docker compose up -d
```

| Service | URL | Credentials |
|---|---|---|
| RabbitMQ management | http://localhost:15672 | `docuflow` / `docuflow` |
| MinIO console | http://localhost:9001 | `docuflow` / `docuflow123` |
| PostgreSQL | `localhost:5432` | `docuflow` / `docuflow` |
| Redis | `localhost:6379` | — |

Backend, worker, frontend and Swagger docs land here as Phase 0 progresses.

## License

MIT — see [LICENSE](./LICENSE).
