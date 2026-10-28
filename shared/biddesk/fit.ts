import type { CapabilityProfile, FitResult, Opportunity, FitFactor } from "./types";
const norm = (s: string) => s.toLowerCase();

/** Deterministic, explainable fit score (0-100). Every factor cites evidence. */
export function scoreFit(opp: Opportunity, p: CapabilityProfile, now = new Date()): FitResult {
  const text = norm([opp.title, opp.description, ...(opp.questions ?? [])].join(" "));
  const matched = p.keywords.filter((k) => text.includes(norm(k)));
  const missing = p.gaps.filter((g) => text.includes(norm(g)));
  const factors: FitFactor[] = [];
  const kw = Math.min(1, matched.length / 4);
  factors.push({ name: "Capability keyword match", weight: 35, score: kw, evidence: matched.length ? `Matched: ${matched.join(", ")}` : "No profile keywords in notice" });
  const gap = missing.length === 0 ? 1 : Math.max(0, 1 - missing.length * 0.35);
  factors.push({ name: "Known gaps", weight: 25, score: gap, evidence: missing.length ? `Notice requires known gaps: ${missing.join(", ")}` : "No known gaps hit" });
  const naicsHit = (opp.naics ?? []).some((n) => p.naics.includes(n));
  factors.push({ name: "NAICS alignment", weight: 10, score: opp.naics?.length ? (naicsHit ? 1 : 0) : 0.5, evidence: opp.naics?.length ? `Notice NAICS ${opp.naics.join(", ")}` : "No NAICS on notice (neutral)" });
  const sa = opp.setAside; const saOk = !sa || p.smallBusiness.some((c) => norm(sa).includes(norm(c)));
  factors.push({ name: "Set-aside eligibility", weight: 10, score: saOk ? 1 : 0, evidence: sa ? `Set-aside: ${sa}` : "No set-aside restriction" });
  const days = (Date.parse(opp.responseDeadline) - now.getTime()) / 864e5;
  factors.push({ name: "Time to respond", weight: 10, score: days <= 0 ? 0 : days < 3 ? 0.3 : days < 7 ? 0.7 : 1, evidence: `${Math.floor(days)} days left` });
  const lowBar = /sources sought|request for information|rfi|market research/i.test(opp.type + " " + opp.description);
  factors.push({ name: "Entry barrier", weight: 10, score: lowBar ? 1 : 0.5, evidence: lowBar ? "Market research / sources sought: no award risk, builds agency relationship" : "Competitive solicitation" });
  const score = Math.round(factors.reduce((s, f) => s + f.weight * f.score, 0));
  // Any known gap caps the verdict: a human must decide.
  const verdict = score >= 70 && missing.length === 0 ? "pursue" : score >= 45 ? "pursue-with-caveats" : "pass";
  return { score, verdict, factors, matched, missing };
}
