# DocuFlow — Project Plan & Roadmap

Balanced full-stack build, daily cadence, optimized to become **resume-listable as early as honestly possible**, then hardened.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the system design this plan builds.

---

## The key idea: the "resume-ready" checkpoint

You do **not** wait until everything is done to put this on your resume. The moment the core loop works end-to-end, is public, and has a README + demo, it is a legitimate, defensible project. That happens at the end of **Phase 4** — roughly **week 3** at a daily cadence.

Everything after that makes it *stronger*, but you're already listing it and answering interview questions from it.

```
Week 1 ──▶ Week 2 ──▶ Week 3 ──▶ Week 4 ──▶ Week 5+
 P0/P1     P2/P3       P4          P5/P6      P7 polish
                        ▲
                RESUME-READY CHECKPOINT
                (public + README + demo)
```

---

## Cadence & sizing assumptions

- ~1.5–3 focused hrs/day, most days, alongside interview prep.
- Phases are sequential but each ends in something that **runs and demos** — never a half-migration.
- Timeline below is realistic-daily. If you have a heavy weekend, you'll beat it.

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
**Interview payload:** Docker Compose, service topology, Celery/broker wiring.

---

## Phase 1 — Auth & RBAC (≈ 3–4 days)

**Goal:** real users, roles, and guarded routes on both ends.

- [ ] Custom `User` model (email login, `role` enum), migrations.
- [ ] SimpleJWT: login, refresh, `me`; register (admin-created or open, your call).
- [ ] DRF permission classes for admin/reviewer/auditor.
- [ ] Frontend: login page, token storage + refresh interceptor, Redux auth slice, role-based route guards.
- [ ] Seed script: one user per role.

**Done when:** you log in as each role and see different nav; API rejects unauthorized calls with 403.
**Interview payload:** JWT vs sessions, refresh-token strategy, where RBAC is *actually* enforced.

---

## Phase 2 — Applications, upload & storage (≈ 3–4 days)

**Goal:** create an application, drag-drop a document, it lands in MinIO with a DB record.

- [ ] `Application` + `Document` models, serializers, viewsets, pagination/filter/order.
- [ ] MinIO integration; presigned URLs for upload/download; checksum + version on `Document`.
- [ ] Frontend: applications list + detail, react-dropzone upload with progress, document list.

**Done when:** upload a PDF → it's in MinIO → appears in the UI with status `uploaded`.
**Interview payload:** object storage vs blobs-in-DB, presigned URLs, file versioning.

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
**Interview payload:** RabbitMQ, Celery, retries/backoff, dead-letter, idempotency, timeouts, the pluggable-AI design. **This is the phase you'll talk about most — build it carefully.**

---

## Phase 4 — Human review UI (≈ 4–5 days) → 🎯 RESUME-READY

**Goal:** a reviewer opens a document, sees fields highlighted, and accepts/edits/rejects.

- [ ] `GET /documents/{id}/fields`, `PATCH /fields/{id}` (accept/edit/reject, records corrected value).
- [ ] Review screen: document viewer + `bbox` highlight overlay + field side-panel with confidence badges.
- [ ] Accept/edit/reject controls; low-confidence fields visually flagged.
- [ ] Submit review → app moves to `pending_approval`.
- [ ] **Write the README, record a 5-min demo, push public.**

**Done when:** the full loop runs — upload → extract → review → submit — and a stranger can clone, `compose up`, and try it.
**➡️ At this point: put it on your resume.**
**Interview payload:** the end-to-end product story, optimistic UI + mutation invalidation (TanStack Query), rendering AI confidence to humans.

---

## Phase 5 — Workflow engine & audit log (≈ 3–4 days)

**Goal:** enforce the state machine and record everything.

- [ ] Server-side transition validation (`POST /applications/{id}/transition`); illegal jumps → 409.
- [ ] `StateTransition` log on every change; admin approve/reject.
- [ ] `AuditLog` written in the same transaction as each mutation (old/new value); `GET /audit` with filters for auditor/admin.
- [ ] Frontend: workflow status timeline, audit log viewer.

**Done when:** you can't skip states via the API, and the audit view shows who changed what, when, from→to.
**Interview payload:** state machines, transactional audit integrity, append-only logs.

---

## Phase 6 — Dashboard & notifications (≈ 3–4 days)

**Goal:** the analytics + comms layer.

- [ ] `GET /dashboard/metrics`: pending reviews, avg processing time, failures/dead jobs, throughput, AI accuracy (accepted vs edited), reviewer performance. Cache in Redis.
- [ ] Dashboard UI with MUI charts.
- [ ] `Notification` model + in-app notifications; email on assignment/approval (console backend in dev); one outbound webhook.
- [ ] Comments on documents.

**Done when:** the dashboard reflects real activity and reviewers get notified when work lands.
**Interview payload:** aggregation queries, cached metrics, event-driven notifications.

---

## Phase 7 — Hardening, tests, CI, docs (≈ 4–6 days, ongoing)

**Goal:** make it look like production, not a demo.

- [ ] Backend tests: pytest + factory_boy — auth, RBAC, the pipeline (with MockExtractor), transitions, audit. Aim for the critical paths, not 100%.
- [ ] Frontend tests: Jest + RTL + MSW — auth flow, review interactions.
- [ ] GitHub Actions: lint + test + build on push.
- [ ] Nginx prod config, gunicorn, prod compose profile.
- [ ] Structured logging + correlation id; `/healthz` + `/readyz`.
- [ ] Docs: finish README (architecture, trade-offs, how-to-run), embed the ER + sequence diagrams, link Swagger, polish the demo video.

**Done when:** CI is green, a fresh clone runs, and the README could stand alone in an interview.
**Interview payload:** testing strategy, CI/CD, MSW, why you tested what you tested.

---

## Timeline summary

| Milestone | Phases | Daily-cadence estimate |
|---|---|---|
| Stack runs | P0 | end of week 1 |
| Auth + upload | P1–P2 | ~week 2 |
| **Pipeline + review = RESUME-READY** | P3–P4 | **~week 3** |
| Workflow + audit + dashboard | P5–P6 | ~week 4–5 |
| Polished, tested, CI, docs | P7 | ~week 5–6 |

**≈ 3 weeks to listable, ≈ 5–6 weeks to polished.** Extras from the original spec stay in the deferred backlog in ARCHITECTURE.md §11.

---

## Interview-prep integration (since you're doing both)

This project *is* your study guide. As you build each phase, you're rehearsing its questions live:

- **Phase 1** → JWT vs sessions, refresh rotation, RBAC placement, CORS.
- **Phase 3** → message queues, at-least-once delivery, retries/backoff, idempotency, dead-letter — the highest-value backend topics.
- **Phase 4** → React rendering, controlled inputs, TanStack Query cache/invalidation, optimistic updates.
- **Phase 5** → transactions, isolation, ACID, state modeling.
- **Phase 6** → SQL aggregation, N+1 avoidance, caching strategy.
- **Phase 7** → testing pyramid, CI/CD, mocking boundaries.

Keep a running `docs/INTERVIEW_NOTES.md`: after each phase, write the 3–5 questions it prepares you for and your answer. By the end you have a study doc *and* a portfolio.

---

## Immediate next step

When you're ready to build, we start at **Phase 0**: scaffold the repo and get `docker compose up` green. Say the word and I'll generate it.
