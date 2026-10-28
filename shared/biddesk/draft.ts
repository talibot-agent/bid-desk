import type { CapabilityProfile, FitResult, Opportunity } from "./types";

export function draftCapabilityStatement(o: Opportunity, p: CapabilityProfile, fit: FitResult): string {
  return [`# Capability Statement — ${p.name}`, `**Re:** ${o.title} (${o.solicitationNumber}), ${o.agency}`, "",
    `| | |`, `|---|---|`, `| Entity | ${p.entityType} |`, `| UEI | ${p.uei} |`, `| Location | ${p.location} |`, `| Small business | ${p.smallBusiness.join(", ") || "—"} |`, `| NAICS | ${p.naics.join(", ")} |`, "",
    `## Core competencies`, ...p.competencies.map((c) => `- ${c}`), "",
    `## Relevant to this notice`, ...(fit.matched.length ? fit.matched.map((m) => `- ${m}`) : ["- (no direct keyword matches)"]), "",
    `## Past performance`, ...p.pastPerformance.map((x) => `- **${x.title}:** ${x.summary}`), "",
    `## Differentiators`, ...p.differentiators.map((d) => `- ${d}`), "",
    ...(fit.missing.length ? [`## Disclosed gaps`, ...fit.missing.map((g) => `- No prior ${g} experience claimed.`), ""] : []),
    `## Contact`, `${p.pocName} · ${p.pocEmail}`].join("\n");
}

export function draftResponseOutline(o: Opportunity, p: CapabilityProfile, fit: FitResult): string {
  const lines = [`# Response outline — ${o.solicitationNumber}`, `Fit score: **${fit.score}/100 (${fit.verdict})**`, "", `## Required elements checklist`];
  for (const r of o.requirements ?? []) lines.push(`- [ ] ${r}`);
  lines.push("", `## Answers to requested information`);
  (o.questions ?? []).forEach((q, i) => {
    const ql = q.toLowerCase();
    const gaps = p.gaps.filter((g) => ql.includes(g.toLowerCase()));
    const pts = p.keywords.filter((k) => ql.includes(k.toLowerCase()));
    lines.push(`### ${i + 1}. ${q}`, ...(gaps.length ? [`- Lead with honest gap: ${gaps.join(", ")}`] : []), ...(pts.length ? [`- Evidence to cite: ${pts.join(", ")}`] : []), `- Draft: _to be written; never invent past performance_`, "");
  });
  lines.push(`## Submission`, `- Deadline: ${o.responseDeadline}`, ...(o.questionsDeadline ? [`- Questions due: ${o.questionsDeadline}`] : []), `- Human review and approval required before sending.`);
  return lines.join("\n");
}
