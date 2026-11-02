// Keyless chat demo: deterministic Bid Desk tools do the work; a free model (HF free tier if HF_TOKEN is set,
// else local Ollama, else rule-based) only writes the conversational reply. Writes docs/chat-demo-transcript.md.
import { writeFileSync, mkdirSync } from "node:fs";
import { complete, demoProfile, packetMarkdown, runPipeline, silvahOpportunity } from "../shared/biddesk";
const question = process.argv[2] ?? "Should we bid on the SILVAH RFI 12760426Q0195, and what do we need to do first?";
const a = runPipeline(silvahOpportunity(), demoProfile);
const facts = [`Opportunity: ${a.opportunity.title} (${a.opportunity.solicitationNumber}), ${a.opportunity.agency}`, `Fit ${a.fit.score}/100, verdict ${a.fit.verdict}`,
  ...a.fit.factors.map((f) => `- ${f.name}: ${Math.round(f.score * 100)}% (${f.evidence})`), `Gaps: ${a.fit.missing.join(", ") || "none"}`, ...a.deadlines.map((d) => `Deadline ${d.label}: ${d.at} [${d.status}]`)].join("\n");
const rule = () => `Verdict: ${a.fit.verdict} (${a.fit.score}/100). ${a.fit.missing.length ? `Close these gaps first: ${a.fit.missing.join(", ")}. ` : ""}Next: ${a.deadlines.map((d) => `${d.label} by ${d.at}`).join("; ")}.`;
const r = await complete([
  { role: "system", content: "You are Bid Desk, a federal bid assistant. Answer ONLY from the tool facts given. Be concise (<=120 words), cite the fit score and the nearest deadline, and end with 2-3 next steps. Do not invent facts." },
  { role: "user", content: `${question}\n\nTool facts (from analyze-opportunity):\n${facts}` },
], rule);
const out = [`# Bid Desk chat demo`, "", `_Model: ${r.provider}${r.model !== "none" ? ` / ${r.model}` : ""} (free; no paid key). Facts come from deterministic tools; the model only phrases the reply._`, "",
  `**User:** ${question}`, "", `**Tool call:** analyze-opportunity { solicitationNumber: "12760426Q0195" }`, "", "```", facts, "```", "", `**Bid Desk:** ${r.text}`, ""].join("\n");
mkdirSync("docs", { recursive: true }); writeFileSync("docs/chat-demo-transcript.md", out);
writeFileSync("docs/sample-bid-packet.md", packetMarkdown(a));
console.log(out); if (r.error) console.error(`(fallback reasons: ${r.error})`);
