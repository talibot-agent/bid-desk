# Bid Desk

Agent-native bid desk for solo federal contractors, built for the [Builder.io Agent-Native Hackathon](https://www.builder.io/hackathon) (Oct 27 – Nov 9, 2026).

Bid Desk pulls SAM.gov opportunities (public endpoint, no sign-in, no API key), scores each one's fit against a capability profile with cited, deterministic factors, drafts a capability statement and a response outline, and tracks deadlines. Each capability is one Agent-Native **action**: the chat agent calls it as a tool, the `/bids` UI calls it from React, and the CLI/MCP/HTTP surfaces get it for free.

**Demo case:** USDA Forest Service RFI 12760426Q0195, "SILVAH software coding" (Sources Sought, response due Nov 11, 2026 3:00 PM ET; questions due Nov 4, 2026 3:00 PM ET). Personal data in the public demo is redacted (no EIN, street address, phone or email).

## What it does
- **Ingest**: live SAM.gov search plus attachment parsing (PDF via `unpdf`, DOCX via `fflate`) to pull questions, requirements and the questions deadline.
- **Score**: deterministic, cited fit factors against your capability profile.
- **Draft**: capability statement and response outline.
- **Pipeline**: persistent board (PGlite/Postgres via Drizzle) with stages new → scoring → drafting → submitted → won/lost (or passed). The `/bids` board has one-click buttons for legal stage moves only.
- **Calendar**: deadlines grouped by day in ET with urgency status.
- **Export**: a bid packet as Markdown or PDF (dependency-free PDF writer), from the board or from `export-opportunity`.

## Actions
| Action | What it does |
|---|---|
| `search-sam` | Live search of `sam.gov/api/prod/sgs/v1/search` |
| `analyze-opportunity` | Fit score, capability statement, response outline and deadlines |
| `save-opportunity` | Ingest a notice (and its attachments), analyze it and save it to the pipeline |
| `list-pipeline` | Board by stage plus deadline calendar (ET) |
| `update-opportunity` | Read one item, or move its stage / set notes (illegal moves rejected) |
| `update-profile` | Edit the capability profile used for scoring |
| `track-deadlines` | Deadlines for saved items, with urgency status |
| `export-opportunity` | Bid packet as `md` text or `pdf` (base64) |

## Run
Node ≥ 22.22, pnpm 10.
```bash
pnpm install
pnpm test && pnpm typecheck
pnpm action save-opportunity --id 12760426Q0195     # SILVAH demo into the pipeline
pnpm action export-opportunity --id 12760426Q0195 --format md
pnpm action search-sam --query SILVAH
pnpm dev                                            # UI at /bids
pnpm exec tsx scripts/chat-demo.ts                  # keyless chat demo -> docs/chat-demo-transcript.md
```

## Models used (disclosure)
Scoring, drafting, deadlines and export are **deterministic code with no LLM**. Only the chat demo uses a model, and it never needs a paid key. It tries these in order:
1. **Hugging Face Inference Providers, free tier**: `Qwen/Qwen2.5-7B-Instruct`. Used only if `HF_TOKEN` is set in your environment; override the model with `HF_MODEL`.
2. **Local Ollama**: `qwen2.5:3b` by default (override with `OLLAMA_MODEL`). If that model isn't installed, it uses `gemma3:4b` or `llama3.2:3b`. Install with `ollama pull qwen2.5:3b`.
3. **Rule-based reply** built from the same tool facts, if no model is reachable.

The committed transcript `docs/chat-demo-transcript.md` was produced with **local Ollama `qwen2.5:3b`** (no HF token was used). The model only phrases the reply. Every fact comes from the deterministic tools and is shown alongside the reply. The in-app Agent-Native chat panel can use any provider the framework supports, including local Ollama.

## Pre-existing work disclosure
Scaffolded from the official `@agent-native/core@0.221.0` **chat** template (`npx @agent-native/core create --standalone --template chat`); original template README is in `TEMPLATE_README.md`. All Bid Desk code (`shared/biddesk/`, `actions/search-sam.ts`, `actions/analyze-opportunity.ts`, `actions/track-deadlines.ts`, `app/routes/bids.tsx`, `fixtures/`, `server/db/`, the other actions listed above, `scripts/`, `docs/`) was written during the hackathon, starting Oct 27, 2026. `node-pty` was removed from dependencies (terminal feature unused; native build fails on our host).

## AI authorship
This project was written by AI agents (Grok Bot "Tali Builder") working for Mykel Nelson, who reviews it and is the human entrant. Generated drafts are starting points: a human must review and approve every bid before it is submitted.

## License
MIT
