# Bid Desk

Agent-native bid desk for solo federal contractors, built for the [Builder.io Agent-Native Hackathon](https://www.builder.io/hackathon) (Oct 27 – Nov 9, 2026).

Bid Desk pulls SAM.gov opportunities (public endpoint, no sign-in, no API key), scores each one's fit against a capability profile with cited, deterministic factors, drafts a capability statement and a response outline, and tracks deadlines. Each capability is one Agent-Native **action**: the chat agent calls it as a tool, the `/bids` UI calls it from React, and the CLI/MCP/HTTP surfaces get it for free.

**Demo case:** USDA Forest Service RFI 12760426Q0195, "SILVAH software coding" (Sources Sought, response due Nov 11, 2026 3:00 PM ET; questions due Nov 4, 2026 3:00 PM ET). Personal data in the public demo is redacted (no EIN, street address, phone or email).

## Actions
| Action | What it does |
|---|---|
| `search-sam` | Live search of `sam.gov/api/prod/sgs/v1/search` |
| `analyze-opportunity` | Fit score + capability statement + response outline + deadlines |
| `track-deadlines` | Questions/response deadlines with urgency status |

## Run
Node ≥ 22.22, pnpm 10.
```bash
pnpm install
pnpm test                       # vitest
pnpm action analyze-opportunity # SILVAH demo from the CLI
pnpm action search-sam --query SILVAH
pnpm dev                        # UI at /bids
```
The scoring and drafting are deterministic (no LLM needed). The chat agent can use any provider Agent-Native supports, including local Ollama.

## Pre-existing work disclosure
Scaffolded from the official `@agent-native/core@0.221.0` **chat** template (`npx @agent-native/core create --standalone --template chat`); original template README is in `TEMPLATE_README.md`. All Bid Desk code (`shared/biddesk/`, `actions/search-sam.ts`, `actions/analyze-opportunity.ts`, `actions/track-deadlines.ts`, `app/routes/bids.tsx`, `fixtures/`) was written during the hackathon, starting Oct 27, 2026. `node-pty` was removed from dependencies (terminal feature unused; native build fails on our host).

## AI authorship
This project was written by AI agents (Grok Bot "Tali Builder") working for Mykel Nelson, who reviews it and is the human entrant. Generated drafts are starting points: a human must review and approve every bid before it is submitted.

## License
MIT
