# DocuFlow — Project Plan & Roadmap

A phased full-stack build. Each phase ends in something that runs and demos —
never a half-migration.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the system design this plan builds.

---

## The MVP checkpoint

The core vertical slice — upload → extract → review → submit — is complete at
the end of **Phase 4**. That's the first fully demoable milestone: a stranger
can clone, `docker compose up`, and run the whole loop. Everything after Phase 4
hardens and extends it.

```
Phase 0/1 ──▶ Phase 2/3 ──▶ Phase 4 ──▶ Phase 5/6 ──▶ Phase 7
                              ▲
                        MVP CHECKPOINT
                       (public + README + demo)
```

---

## Sizing assumptions

- Phases are sequential; each ends in a running, demoable state.
- Estimates are rough and assume a steady daily cadence.

---

## Phase 0 — Foundation (≈ 2–3 days)

**Goal:** `docker compose up` gives you empty-but-wired frontend + backend + infra.

- [ ] Repo init, `git init`, sensible `.gitignore`, MIT license, README stub.
- [ ] `docker-compose.yml`: postgres, redis, rabbitmq, minio, backend, worker, frontend, nginx.
- [ ] Django project + DRF + settings split (base/dev/prod) + `.env` handling.
- [ ] Celery app wired to RabbitMQ (broker) + Redis (results); one `ping` task proves it.
- [ ] Vite + React 19 + TS + MUI + React Router skeleton, one page hitting a backend `/healthz`.
- [ ] `drf-spectacular` serving Swagger at `/api/docs`.

**Done when:** you can up the stack, load the React page, and it shows a green health check from Django.
**Engineering focus:** Docker Compose, service topology, Celery/broker wiring.

---

## Phase 1 — Auth & RBAC (≈ 3–4 days)

**Goal:** real users, roles, and guarded routes on both ends.

- [ ] Custom `User` model (email login, `role` enum), migrations.
- [ ] SimpleJWT: login, refresh, `me`; register (admin-created or open, your call).
- [ ] DRF permission classes for admin/reviewer/auditor.
- [ ] Frontend: login page, token storage + refresh interceptor, Redux auth slice, role-based route guards.
- [ ] Seed script: one user per role.

**Done when:** you log in as each role and see different nav; API rejects unauthorized calls with 403.
**Engineering focus:** JWT vs sessions, refresh-token strategy, where RBAC is *actually* enforced.

---

## Phase 2 — Applications, upload & storage (≈ 3–4 days)

**Goal:** create an application, drag-drop a document, it lands in MinIO with a DB record.

- [ ] `Application` + `Document` models, serializers, viewsets, pagination/filter/order.
- [ ] MinIO integration; presigned URLs for upload/download; checksum + version on `Document`.
- [ ] Frontend: applications list + detail, react-dropzone upload with progress, document list.

**Done when:** upload a PDF → it's in MinIO → appears in the UI with status `uploaded`.
**Engineering focus:** object storage vs blobs-in-DB, presigned URLs, file versioning.

---

## Phase 3 — The async extraction pipeline ⭐ (≈ 4–5 days)

**Goal:** the centerpiece. Upload triggers a queued job that produces extracted fields.

- [ ] `ExtractionJob` + `ExtractedField` models.
- [ ] `ExtractorBackend` interface + **MockExtractor** (deterministic fixtures, default).
- [ ] Celery task `extract_document`: fetch from S3 → extract → write fields + confidence → advance state → audit + notify.
- [ ] Retries with exponential backoff, max attempts, dead-letter → `dead` status, task time limit, idempotent re-run.
- [ ] `GET /jobs/{id}` polling endpoint; frontend polls and shows job status.
- [ ] (Optional now, easy later) real backend: Tesseract OCR + Claude API prompt template behind the same interface.

**Done when:** upload → within seconds the app flips to `review` and fields appear; killing/failing a job shows retries then a dead-letter state.
**Engineering focus:** RabbitMQ, Celery, retries/backoff, dead-letter, idempotency, timeouts, the pluggable-AI design. This is the most involved phase — build it carefully.

---

## Phase 4 — Human review UI (≈ 4–5 days) → 🎯 MVP

**Goal:** a reviewer opens a document, sees fields highlighted, and accepts/edits/rejects.

- [ ] `GET /documents/{id}/fields`, `PATCH /fields/{id}` (accept/edit/reject, records corrected value).
- [ ] Review screen: document viewer + `bbox` highlight overlay + field side-panel with confidence badges.
- [ ] Accept/edit/reject controls; low-confidence fields visually flagged.
- [ ] Submit review → app moves to `pending_approval`.
- [ ] **Write the README, record a demo, push public.**

**Done when:** the full loop runs — upload → extract → review → submit — and a stranger can clone, `compose up`, and try it.
**Engineering focus:** the end-to-end product story, optimistic UI + mutation invalidation (TanStack Query), rendering AI confidence to humans.

---

## Phase 5 — Workflow engine & audit log (≈ 3–4 days)

**Goal:** enforce the state machine and record everything.

- [ ] Server-side transition validation (`POST /applications/{id}/transition`); illegal jumps → 409.
- [ ] `StateTransition` log on every change; admin approve/reject.
- [ ] `AuditLog` written in the same transaction as each mutation (old/new value); `GET /audit` with filters for auditor/admin.
- [ ] Frontend: workflow status timeline, audit log viewer.

**Done when:** you can't skip states via the API, and the audit view shows who changed what, when, from→to.
**Engineering focus:** state machines, transactional audit integrity, append-only logs.

---

## Phase 6 — Dashboard & notifications (≈ 3–4 days)

**Goal:** the analytics + comms layer.

- [ ] `GET /dashboard/metrics`: pending reviews, avg processing time, failures/dead jobs, throughput, AI accuracy (accepted vs edited), reviewer performance. Cache in Redis.
- [ ] Dashboard UI with MUI charts.
- [ ] `Notification` model + in-app notifications; email on assignment/approval (console backend in dev); one outbound webhook.
- [ ] Comments on documents.

**Done when:** the dashboard reflects real activity and reviewers get notified when work lands.
**Engineering focus:** aggregation queries, cached metrics, event-driven notifications.

---

## Phase 7 — Hardening, tests, CI, docs (≈ 4–6 days, ongoing)

**Goal:** make it look like production, not a demo.

- [ ] Backend tests: pytest + factory_boy — auth, RBAC, the pipeline (with MockExtractor), transitions, audit. Aim for the critical paths, not 100%.
- [ ] Frontend tests: Jest + RTL + MSW — auth flow, review interactions.
- [ ] GitHub Actions: lint + test + build on push.
- [ ] Nginx prod config, gunicorn, prod compose profile.
- [ ] Structured logging + correlation id; `/healthz` + `/readyz`.
- [ ] Docs: finish README (architecture, trade-offs, how-to-run), embed the ER + sequence diagrams, link Swagger, polish the demo video.

**Done when:** CI is green, a fresh clone runs, and the README stands on its own.
**Engineering focus:** testing strategy, CI/CD, MSW, why you tested what you tested.

---

## Timeline summary

| Milestone | Phases | Estimate |
|---|---|---|
| Stack runs | P0 | week 1 |
| Auth + upload | P1–P2 | ~week 2 |
| **Pipeline + review = MVP** | P3–P4 | **~week 3** |
| Workflow + audit + dashboard | P5–P6 | ~week 4–5 |
| Polished, tested, CI, docs | P7 | ~week 5–6 |

Extras from the original spec stay in the deferred backlog in ARCHITECTURE.md §11.
