import { describe, it, expect } from "vitest";
import { silvahOpportunity, demoProfile, runPipeline, searchSam, trackDeadlines, scoreFit } from "./index";
import { samSearch } from "../../fixtures/silvah";
const NOW = new Date("2026-10-28T12:00:00-04:00");

describe("SILVAH demo pipeline", () => {
  const o = silvahOpportunity();
  it("normalizes the SAM.gov notice", () => {
    expect(o.solicitationNumber).toBe("12760426Q0195");
    expect(o.agency).toContain("FOREST SERVICE");
    expect(o.type).toBe("Sources Sought");
    expect(Date.parse(o.responseDeadline)).toBe(Date.parse("2026-11-11T15:00:00-05:00"));
  });
  it("parses the 5 questions, required elements and questions deadline from the RFI", () => {
    expect(o.questions).toHaveLength(5);
    expect(o.questions![0]).toMatch(/forestry applications/);
    expect(o.questions![4]).toMatch(/small business/);
    expect(o.requirements).toContain("Capability statement");
    expect(o.questionsDeadline).toBe("2026-11-04T15:00:00-05:00");
  });
  it("scores fit with cited factors and flags C++/forestry gaps", () => {
    const f = scoreFit(o, demoProfile, NOW);
    expect(f.score).toBeGreaterThan(0); expect(f.score).toBeLessThanOrEqual(100);
    expect(f.missing).toEqual(expect.arrayContaining(["C++", "forestry"]));
    expect(f.verdict).toBe("pursue-with-caveats");
    f.factors.forEach((x) => expect(x.evidence.length).toBeGreaterThan(0));
  });
  it("drafts statement and outline without secrets", () => {
    const r = runPipeline(o, demoProfile, NOW);
    expect(r.statement).toContain("12760426Q0195");
    expect(r.statement).toContain("Disclosed gaps");
    expect(r.outline.match(/^### /gm)).toHaveLength(5);
    const all = r.statement + r.outline + JSON.stringify(demoProfile);
    expect(all).not.toMatch(/\b\d{2}-\d{7}\b|\(?\d{3}\)?[ -]\d{3}-\d{4}|\d{3,} [NSEW]\.? \w+ (Loop|St|Ave|Rd|Dr)\b|@(?!usda\.gov)[\w.]+\.(com|net)/i);
  });
  it("tracks deadlines sorted with status", () => {
    const d = trackDeadlines([o], NOW);
    expect(d.map((x) => x.label)).toEqual(["12760426Q0195 Questions due", "12760426Q0195 Response due"]);
    expect(d[0]!.status).toBe("ok"); expect(trackDeadlines([o], new Date("2026-11-02T12:00:00-05:00"))[0]!.status).toBe("urgent");
    expect(trackDeadlines([o], new Date("2026-11-12"))[1]!.status).toBe("overdue");
  });
  it("searchSam hits the public endpoint with HAL accept header", async () => {
    let seen: any;
    const fake: any = async (u: URL, init: any) => { seen = { u: String(u), init }; return { ok: true, json: async () => samSearch }; };
    const res = await searchSam("SILVAH", 5, fake);
    expect(seen.u).toContain("sam.gov/api/prod/sgs/v1/search"); expect(seen.init.headers.Accept).toBe("application/hal+json");
    expect(res[0]!.solicitationNumber).toBe("12760426Q0195");
  });
});
