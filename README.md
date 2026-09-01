# Shiny Stone Sales OS

Enterprise Sales CRM and Business Automation platform — frontend MVP with mock backend.

---

## Description

Shiny Stone Sales OS provides CRM modules for customers, contacts, deals, pipeline, inbox, purchase orders, follow-ups, automation, reports, and admin settings. The UI is production-quality and **frozen** for backend integration.

**Current runtime:** Mock services + in-memory store + browser `localStorage` (default).

---

## Main modules

| Module | Route |
|--------|-------|
| Dashboard | `/dashboard` |
| Customers | `/customers` |
| Contacts | `/contacts` |
| Deals | `/deals` |
| Pipeline | `/pipeline` |
| Inbox | `/inbox` |
| Purchase Orders | `/purchase-orders` |
| Follow-ups | `/follow-ups` |
| Automation | `/automation` |
| Reports | `/reports` |
| Users | `/users` |
| Settings | `/settings` |

---

## Architecture

```
UI (Next.js 15, React 19)
  ↓
Service interfaces (src/services/interfaces.ts)
  ↓
Mock implementations (default) → crmStore → localStorage
Production stubs (throws until backend phases complete)
```

Target: Supabase (Postgres + Auth + Storage) + server API routes.

---

## Local development

```bash
npm install
cp .env.example .env.local
# Keep NEXT_PUBLIC_USE_MOCK_SERVICES=true
npm run dev:clean
```

Open http://localhost:3000/dashboard

If styling breaks: stop dev server, delete `.next`, run `npm run dev:clean` — see `docs/STABILITY.md`.

---

## Production build

```bash
npm run build
npm start
```

---

## Environment setup

See `docs/ENVIRONMENT.md`. **No secrets in repo.**

---

## What is production-ready vs simulated

| Feature | Status |
|---------|--------|
| Frontend UI & responsive layout | **Production-ready** |
| CRM CRUD workflows (mock) | **Demo-ready** |
| Relational mock store | **Demo-ready** |
| Supabase database | **Not implemented** |
| Authentication | **Simulated** (login UI only) |
| Authorization / RLS | **Not implemented** |
| Email (Gmail/Outlook) | **Simulated** |
| AI (LLM/OCR) | **Simulated** (keyword rules) |
| PO document storage | **Not implemented** |
| Automation engine | **Simulated** |

---

## External credentials required (full platform)

- Supabase (URL, anon key, service role)
- Email OAuth provider (if approved)
- AI API key (server-side only)
- Hosting platform env (e.g. Vercel)

---

## Deployment

See `docs/DEPLOYMENT.md`. Deploy frontend with mock mode for UI demos only until backend integration completes.

---

## Documentation index

| Doc | Purpose |
|-----|---------|
| `FRONTEND_FREEZE.md` | UI freeze line |
| `FRONTEND_BACKEND_BOUNDARY.md` | Mock vs production map |
| `BACKEND_INTEGRATION_PLAN.md` | Phased backend roadmap |
| `FINAL_PRE_DEPLOYMENT_AUDIT.md` | Pre-deploy audit |
| `FINAL_HANDOFF_REPORT.md` | Pilot readiness decision |
| `FINAL_DEMO_REPORT.md` | ABC Corporation workflow |
| `API_CONTRACT.md` | Target API shapes |
| `DATA_MODEL.md` | Entity reference |
| `DEPLOYMENT.md` | Hosting guide |
| `ENVIRONMENT.md` | Env variables |
| `STABILITY.md` | CSS/dev cache recovery |

---

## Internal pilot status

**NOT READY** — see `docs/FINAL_HANDOFF_REPORT.md`.

---

## License

Private — Shiny Stone Industries
