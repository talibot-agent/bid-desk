# Bid Desk — PLAN
## Phase 1: MVP (Oct 27) — DONE
- [x] Scaffold chat template (Node 22.23, pnpm 10.29). Verify: `pnpm install`.
- [x] `shared/biddesk/` core: SAM normalize/search, RFI parser, fit scorer, drafts, deadlines. Verify: `pnpm test` (6 pass).
- [x] Actions `search-sam`, `analyze-opportunity`, `track-deadlines`. Verify: `pnpm action ...` returns live + demo data.
- [x] `/bids` route. Verify: dev server returns 200.
- [x] README/SPEC/PLAN, secrets scan, push to talibot-agent/bid-desk.

## Phase 2: Real product flow (Oct 28 – Nov 2; after S20 Airwallex test)
- [x] Persist pipeline + profile in DB (drizzle/PGlite, migration plugin); `save-opportunity`, `list-pipeline`, `update-opportunity`, `update-profile` actions; `track-deadlines` reads DB. Verify: 5 PGlite tests + `pnpm action` writes (Nov 2).
- [x] Generic notice ingest: SAM public resources endpoint, PDF (unpdf/pdfjs) + DOCX (fflate) text extraction, generic question/requirement/Q&A-date parse. Verify: 5 tests incl. real SILVAH PDF; `npx tsx scripts/verify-live-ingest.ts software 3` parsed 3 live notices (Nov 2).
- [x] Agent skill `.agents/skills/bid-desk/SKILL.md` (search → save/score/draft → pipeline → deadlines → profile), rule-based; test checks it only names real actions. Pending: live chat transcript (needs a model; no paid key).
- [ ] Optional LLM polish of drafts behind a flag; deterministic fallback.

## Phase 3: Design + demo (Nov 3 – Nov 7)
- [~] Kanban pipeline + deadline calendar: logic + stage-transition rules + basic /bids board done (Nov 2). Remaining: drag/move UI polish, export to Markdown/PDF.
- [ ] Attend Nov 3/5 office hours (optional) for framework questions.
- [ ] Deploy (Netlify free) with demo data; Builder account for Clips under Tali identity via account-registry.
- [ ] Record public Clip (2-3 min): SILVAH in → packet out, agent + UI sharing actions.

## Phase 4: Submit (Nov 8)
- [ ] Mykel reviews, accepts rules, submits form with Clip link; confirm receipt. Buffer day Nov 9.
