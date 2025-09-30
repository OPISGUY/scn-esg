# Agent Operations Guide

_Last updated: 30 September 2025_

## Purpose

This guide maps the human roles, automated scripts, and AI helpers that keep the SCN ESG platform moving. Use it to understand who or what owns each workflow, how agents hand off work, and where to look when you need deeper context.

## Platform Snapshot

- **Product**: SCN ESG sustainability intelligence platform (React + Django)
- **Frontend host**: Vercel (Vite React build served from `main` branch)
- **Backend host**: Vercel serverless functions running the Django API (temporary until Railway reactivation)
- **Data sources**: PostgreSQL (PlanetScale migration in progress) and GitHub-hosted ESRS datasets
- **Key docs**: `README.md`, `DEPLOYMENT_GUIDE.md`, `AUTHENTICATION_IMPLEMENTATION_PLAN.md`

> ✅ Before adding or modifying an agent, skim the roadmap documents to stay aligned with the current phase.

## Agent Directory

| Agent | Type | Responsibilities | Entry Points & Artifacts | Escalation / Notes |
| --- | --- | --- | --- | --- |
| **Product Navigator** | Human (PM/Lead) | Prioritize ESG feature roadmap, approve deployment gates, coordinate compliance requirements | `PROJECT_DOCUMENTATION.md`, `AUTHENTICATION_ROADMAP_DETAILED.md`, GitHub Projects board | Escalate blockers to sponsor stakeholders within 12h |
| **Frontend Delivery Agent** | Human / Dev | Own React component delivery, tailwind theming, accessibility, and bundle performance | `src/`, `vite.config.ts`, `npm run dev`, Vercel preview deployments | Notify Product Navigator when bundle score < 90 in Vercel Analytics |
| **Backend Operations Agent** | Human / DevOps | Maintain Django API, Celery tasks, migrations, and environment variables | `backend/manage.py`, `backend/settings_render.py`, `deploy.ps1`, Vercel env dashboard | Page via Slack if API error rate > 2% for 10m |
| **Compliance Data Agent** | Human / Data | Manage ESRS datapoint ingestion and validation, schedule reruns of `populate_esrs_datapoints.py` | `backend/populate_esrs_datapoints.py`, `backend/test_compliance.py` | Coordinate with Backend Ops before schema changes |
| **AI Integration Agent** | Human / AI | Configure Google Gemini keys, prompt libraries, and guardrails; validate AI outputs | `backend/test_real_ai.py`, `backend/quick_ai_test.py`, environment secrets vault | Rotate Gemini API keys quarterly |
| **QA Automation Agent** | Human / QA | Run end-to-end suites, file regression tickets, own release sign-off | `test_render_comprehensive.py`, `backend/test_full_deployment.py`, GitHub Actions workflow | Execute smoke tests on every Vercel production promotion |
| **Docs Curator** | Human / Technical Writer | Keep guides in sync, ensure docs reflect latest workflows and fixes | `/AUTHENTICATION_*.md`, `/DEPLOYMENT_*.md`, this file | Combine doc updates with related PRs to preserve history |
| **Deployment Scripts** | Automation | Reusable scripts for shipping to Vercel, Railway, and Render | `deploy.ps1`, `deploy_render.ps1`, `render-build.sh`, `render-start.sh` | Treat as immutable infrastructure; PR required for edits |
| **Debugging Utilities** | Automation | Scriptable helpers for auth, API, and infrastructure diagnostics | `backend/debug_*.py`, `debug-auth.html`, `browser-test.html` | Run in isolated test environments with mock credentials |
| **GitHub Copilot & Pair Agents** | AI Assistants | Accelerate implementation, suggest tests, flag gaps in docs | Integrated in IDE, documented in `AUTHENTICATION_PROGRESS_TRACKER.md` | Always review suggestions before commit |

## Collaborative Workflows

1. **Feature Delivery Loop**
   - Product Navigator logs scope → Frontend & Backend Agents estimate → QA Automation defines acceptance.
   - Implementation branches use preview deployments; QA validates via `npm run test` and Django test suites.
   - Product Navigator signs off before production promotion in Vercel.

2. **Compliance & Reporting Updates**
   - Compliance Data Agent syncs ESRS datasets → AI Integration Agent reviews AI insights for regulatory shifts → Docs Curator publishes summary in `PROJECT_DOCUMENTATION_CLEANED.md`.

3. **Incident Response**
   - Backend Ops monitors Vercel error dashboards and Sentry (once enabled).
   - On alert, Debugging Utilities runbooks isolate issue → QA Automation reproduces → Docs Curator logs postmortem.

## Operating Playbooks

- **Auth & Session Issues**: Start with `debug-auth.html`, review `AUTHENTICATION_QUICKSTART.md`, then escalate to Backend Ops.
- **Data Inconsistencies**: Trigger `backend/test_compliance.py`; if failing, involve Compliance Data Agent.
- **AI Drift**: Use `backend/test_phase5_ai.py`, coordinate with AI Integration Agent for prompt refresh.
- **Deployment Blockers**: Execute `deploy.ps1` locally (Windows PowerShell) or `deploy.sh` (Unix), capture logs in issue tracker.

## Onboarding Checklist for New Agents

1. Fork repo, clone locally, and run both stacks (`npm run dev`, `python manage.py runserver`).
2. Read through `PROJECT_DOCUMENTATION.md` → `AUTHENTICATION_IMPLEMENTATION_PLAN.md` → this guide.
3. Request Vercel project access (frontend + backend) and environment variable secrets bundle.
4. Run smoke tests: `npm run test`, `pytest backend/test_full_deployment.py -k smoke`.
5. Pair with current role owner for first feature or incident rotation.

## Communication Channels

- **Daily stand-up**: Slack `#scn-esg-core`
- **Incident bridge**: Google Meet link stored in Vercel incident response doc
- **Async updates**: GitHub Discussions / project board notes
- **Escalation ladder**: Product Navigator → Sponsor → External partners

## Change Management Rules

- Every agent change (role swap, new automation) must land with an ADR or doc PR referencing this file.
- Production deployments require at least one QA sign-off and Product Navigator approval.
- Secrets and API keys flow through the secure vault; never commit keys to the repo.

## Future Agents & Gaps

- **Observability Bot**: Planned New Relic integration for automated anomaly detection.
- **Customer Success Agent**: Will own white-glove onboarding once Phase 7 stabilizes.
- **Localization Pipeline**: Need an agent to manage multi-lingual content rollout for Phase 8.

---

Keep this document updated whenever responsibilities shift or new automation lands. Treat agents as living contracts between people, tools, and workflows.
