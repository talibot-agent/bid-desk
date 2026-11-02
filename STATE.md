# STATE
Phase: 2 core + Nov 8 items done (Nov 2): stage-move buttons, MD/PDF export, keyless chat demo (HF free tier if HF_TOKEN, else Ollama qwen2.5:3b, else rule-based), README refresh with model disclosure. 24 tests, typecheck clean.
Done Nov 2: PGlite/drizzle persistence (bid_opportunities, bid_profiles; migration plugin `bid_desk_migrations`), attachment ingest (PDF via unpdf, DOCX via fflate; per-file errors never throw), generic notice parser, chat skill `.agents/skills/bid-desk`, pipeline stages w/ transition rules, kanban board + ET deadline calendar (logic + basic /bids view). 18 tests pass; typecheck clean; 3 live SAM notices parsed.
Decisions: deterministic scoring (no paid key); any known gap caps verdict at pursue-with-caveats; fixtures as TS module; node-pty dropped; JSON payloads as text columns (single-tenant); no identity columns.
Remaining for Nov 8 (owner-side): deploy (needs account, owner handles), Clip recording, hackathon submission form. Optional: UI polish, HF_TOKEN run of chat demo.
Pending (NOT signed up, need Mykel/account-registry): Builder.io account (Clips), Netlify deploy, free LLM for chat demo. Submission needs Mykel.
