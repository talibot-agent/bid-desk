import { describe, it, expect } from "vitest";
import { complete, demoProfile, markdownToPdf, nextStages, packetMarkdown, runPipeline, silvahOpportunity } from "./index";
import { pdfToText } from "./attachments";

const NOW = new Date("2026-11-02T12:00:00-05:00");
const packet = runPipeline(silvahOpportunity(), demoProfile, NOW);

describe("export", () => {
  it("builds a markdown bid packet with fit, deadlines, statement and outline", () => {
    const md = packetMarkdown(packet, NOW);
    expect(md).toMatch(/^# Bid Packet — /); expect(md).toContain("12760426Q0195"); expect(md).toContain("## Fit:"); expect(md).toContain("## Deadlines"); expect(md).toContain("Capability Statement");
  });
  it("renders a valid multi-page PDF whose text round-trips through unpdf", async () => {
    const md = packetMarkdown(packet, NOW) + "\n" + Array.from({ length: 80 }, (_, i) => `line ${i} (paren) \\ back`).join("\n");
    const pdf = markdownToPdf(md); const head = new TextDecoder().decode(pdf.slice(0, 8));
    expect(head).toBe("%PDF-1.4"); expect(new TextDecoder().decode(pdf)).toMatch(/\/Count [2-9]/);
    const text = await pdfToText(pdf); expect(text).toContain("12760426Q0195"); expect(text).toContain("line 79 (paren)");
  });
});
describe("pipeline stage buttons", () => {
  it("offers only legal next stages", () => { expect(nextStages("new")).toEqual(["scoring", "passed"]); expect(nextStages("won")).toEqual([]); });
});
describe("free model chain", () => {
  const msgs = [{ role: "user" as const, content: "hi" }];
  const json = (b: unknown, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => b }) as any;
  it("uses HF only when HF_TOKEN is set", async () => {
    const calls: string[] = [];
    const f = (async (u: string) => { calls.push(u); return json({ choices: [{ message: { content: "hf says hi" } }] }); }) as any;
    const r = await complete(msgs, () => "rb", { env: { HF_TOKEN: "x" }, fetchImpl: f });
    expect(r.provider).toBe("huggingface"); expect(calls[0]).toContain("huggingface.co");
  });
  it("falls back to an installed Ollama model without a token", async () => {
    const f = (async (u: string) => u.endsWith("/api/tags") ? json({ models: [{ name: "gemma3:4b" }] }) : json({ message: { content: "local hi" } })) as any;
    const r = await complete(msgs, () => "rb", { env: {}, fetchImpl: f });
    expect(r).toMatchObject({ provider: "ollama", model: "gemma3:4b", text: "local hi" });
  });
  it("falls back to rule-based text when nothing is reachable", async () => {
    const f = (async () => { throw new Error("down"); }) as any;
    const r = await complete(msgs, () => "rule text", { env: { HF_TOKEN: "x" }, fetchImpl: f });
    expect(r).toMatchObject({ provider: "rule-based", text: "rule text" }); expect(r.error).toContain("down");
  });
});
