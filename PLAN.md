# Bid Desk — PLAN
## Phase 1: MVP (Oct 27) — DONE
- [x] Scaffold chat template (Node 22.23, pnpm 10.29). Verify: `pnpm install`.
- [x] `shared/biddesk/` core: SAM normalize/search, RFI parser, fit scorer, drafts, deadlines. Verify: `pnpm test` (6 pass).
- [x] Actions `search-sam`, `analyze-opportunity`, `track-deadlines`. Verify: `pnpm action ...` returns live + demo data.
- [x] `/bids` route. Verify: dev server returns 200.
- [x] README/SPEC/PLAN, secrets scan, push to talibot-agent/bid-desk.

## Phase 2: Real product flow (Oct 28 – Nov 2; after S20 Airwallex test)
- [ ] Persist pipeline + profile in DB (drizzle/PGlite); `save-opportunity`, `update-profile` actions. Verify: tests + UI reflects agent writes.
- [ ] Generic notice ingest: fetch SAM attachments via public resources endpoint, `pdftotext`-free parsing (pdfjs). Verify: 3 live notices parsed.
- [ ] Agent skill `skills/bid-desk.md` so chat runs search → score → draft; free/local LLM (Ollama small model or Builder gateway if free). Verify: chat transcript.
- [ ] Optional LLM polish of drafts behind a flag; deterministic fallback.

## Phase 3: Design + demo (Nov 3 – Nov 7)
- [ ] Kanban pipeline UI (New / Scoring / Drafting / Submitted), deadline calendar, export to Markdown/PDF.
- [ ] Attend Nov 3/5 office hours (optional) for framework questions.
- [ ] Deploy (Netlify free) with demo data; Builder account for Clips under Tali identity via account-registry.
- [ ] Record public Clip (2-3 min): SILVAH in → packet out, agent + UI sharing actions.

## Phase 4: Submit (Nov 8)
- [ ] Mykel reviews, accepts rules, submits form with Clip link; confirm receipt. Buffer day Nov 9.
