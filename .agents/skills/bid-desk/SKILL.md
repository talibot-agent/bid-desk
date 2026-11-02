---
name: bid-desk
description: >-
  Run the Bid Desk workflow in chat: find federal contract opportunities on
  SAM.gov, analyze one (attachments, fit score, drafts), track it through the
  pipeline and deadlines. Use when the user asks about bids, RFIs, sources
  sought, solicitations, SAM.gov, capability statements or bid deadlines.
scope: runtime
---

# Bid Desk (chat workflow)

Deterministic and rule-based: every score cites its factors; no paid model is needed. Never invent past performance, certifications or capabilities. State gaps plainly.

## Flow
1. **Search** — `search-sam` `{ query, size }`. Show solicitation number, title, agency, type, response deadline (ET). Ask which one to analyze if more than one fits.
2. **Analyze + save** — `save-opportunity` `{ id: <exact solicitation number or notice id> }`. It downloads and parses public PDF/DOCX attachments, scores fit against the saved profile, drafts a capability statement and a response outline, and saves to the pipeline (stage `scoring`). For the offline demo use `12760426Q0195` (SILVAH).
   Report: fit score + verdict, the top factors with evidence, missing/gap items, parsed questions count, attachment names and any per-file errors.
3. **Drafts** — show the statement and outline from the result. Offer edits; do not claim the response was submitted.
4. **Pipeline** — `list-pipeline` for the board and deadline calendar; `update-opportunity { id, stage }` to move (new→scoring→drafting→submitted→won/lost, or →passed). Illegal moves are rejected; explain the allowed next stages.
5. **Deadlines** — `track-deadlines`. Lead with anything `urgent` (<3 days) or `overdue`. Times in America/New_York.
6. **Profile** — `update-profile` with no fields reads it; with fields updates it. Refuse EINs, street addresses, phone numbers.

## Rules
- The agent never submits a bid or signs into SAM.gov; submission is the human's action.
- If SAM.gov is unreachable, say so and offer the bundled SILVAH demo.
- Verdict `pursue-with-caveats` whenever any known gap matches; never round it up to `pursue`.
