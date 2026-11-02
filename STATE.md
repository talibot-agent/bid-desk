# STATE
Phase: 2 core done (Nov 2). Next: Phase 3 UI polish + demo (Nov 3–7), submit Nov 8.
Done Nov 2: PGlite/drizzle persistence (bid_opportunities, bid_profiles; migration plugin `bid_desk_migrations`), attachment ingest (PDF via unpdf, DOCX via fflate; per-file errors never throw), generic notice parser, chat skill `.agents/skills/bid-desk`, pipeline stages w/ transition rules, kanban board + ET deadline calendar (logic + basic /bids view). 18 tests pass; typecheck clean; 3 live SAM notices parsed.
Decisions: deterministic scoring (no paid key); any known gap caps verdict at pursue-with-caveats; fixtures as TS module; node-pty dropped; JSON payloads as text columns (single-tenant); no identity columns.
Remaining for Nov 8: board polish (move buttons), export MD/PDF, chat transcript with a free model, deploy, Clip recording, README refresh.
Pending (NOT signed up, need Mykel/account-registry): Builder.io account (Clips), Netlify deploy, free LLM for chat demo. Submission needs Mykel.
