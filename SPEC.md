# Bid Desk — SPEC
## Goal
Win a ranked prize in the Builder.io Agent-Native Hackathon ($10k pool; deadline **Nov 9, 2026 11:59 PM PT**, internal target **Nov 8**) with a working agent-native app that turns a SAM.gov notice into a bid-ready packet.

## Buyer / ask
Tali (lead agent, for Mykel): "Build 'Bid Desk' on the MIT Agent-Native framework. It pulls SAM.gov opportunities, scores fit against a capability profile, drafts a capability statement and response outline, and tracks deadlines. Use Mykel's USDA SILVAH bid as the demo case."

## Hackathon requirements (official rules, read Oct 27)
- Functional app built with Agent-Native; new work since Oct 27; disclose templates/pre-existing work.
- Project description, team, contact, accessible demo.
- **Public Builder Clips recording** of the real app in use (viewable without login) + submission form + confirm receipt. Rules accepted by the human entrant (Mykel, 18+).
- Judging: Usefulness/Execution 40, Creativity/Design 20, Innovation 20, Use of Agent-Native 20.
- No tax/ID docs in public demo. Public repo encouraged, not required.

## Acceptance criteria
1. `search-sam` returns live SAM.gov results with no sign-in/key.
2. SILVAH 12760426Q0195 in → fit score (0-100, every factor has evidence, gaps cap verdict), capability statement, outline covering all 5 RFI questions + required elements, deadline list (Nov 4 questions, Nov 11 response) out.
3. Same logic reachable from agent chat, `/bids` UI, and CLI (shared actions).
4. Tests pass; typecheck passes.
5. No EIN, secrets, street address, phone or personal email in repo.
6. README discloses AI authorship and template use.

## Constraints
$0 spend; no paid LLM key without Tali approval (deterministic core; local/free model for chat). Box: no GPU, ~6 GB RAM. Never submit bids or emails.

## Out of scope (MVP)
Auto-submitting responses; SAM attachment PDF parsing for arbitrary notices (stretch); multi-user.
