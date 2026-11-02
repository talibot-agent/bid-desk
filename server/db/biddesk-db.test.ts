import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { readFileSync, existsSync } from "node:fs";
import * as schema from "./schema";
import { BID_MIGRATIONS } from "./migrations";
import { saveOpportunity, listPipeline, getOpportunity, updateOpportunity, updateProfile, getProfile, deleteOpportunity } from "./repo";
import { analyzeAndSave } from "./flow";
import { board, deadlineCalendar, demoProfile, silvahOpportunity } from "../../shared/biddesk";

const NOW = new Date("2026-11-02T12:00:00-05:00");
let db: any;
beforeAll(async () => { const pg = new PGlite(); for (const m of BID_MIGRATIONS) await pg.exec(m.sql); db = drizzle(pg, { schema }); });

describe("persistent pipeline (PGlite + drizzle)", () => {
  it("analyzes the SILVAH demo offline and persists it", async () => {
    const r = await analyzeAndSave(db, "12760426Q0195", { parseAttachments: false, now: NOW });
    expect(r.created).toBe(true); expect(r.stage).toBe("scoring"); expect(r.fit.verdict).toBe("pursue-with-caveats");
    const got = await getOpportunity(db, r.noticeId);
    expect(got!.opportunity.questions).toHaveLength(5); expect(got!.analysis.statement).toContain("12760426Q0195");
  });
  it("upsert keeps stage and created_at", async () => {
    const o = silvahOpportunity();
    await updateOpportunity(db, o.noticeId, { stage: "drafting", notes: "call CO" });
    const r = await saveOpportunity(db, o);
    expect(r.created).toBe(false); expect(r.stage).toBe("drafting");
    expect((await listPipeline(db))).toHaveLength(1);
  });
  it("enforces stage transitions", async () => {
    const id = silvahOpportunity().noticeId;
    await expect(updateOpportunity(db, id, { stage: "won" })).rejects.toThrow(/Cannot move drafting -> won/);
    await expect(updateOpportunity(db, "nope", { stage: "new" })).rejects.toThrow(/No saved/);
    expect((await updateOpportunity(db, id, { stage: "submitted" }))!.stage).toBe("submitted");
  });
  it("profile defaults to demo and persists patches", async () => {
    expect((await getProfile(db)).name).toBe(demoProfile.name);
    await updateProfile(db, { keywords: ["forestry", "software"] });
    expect((await getProfile(db)).keywords).toEqual(["forestry", "software"]);
    expect((await getProfile(db)).naics).toEqual(demoProfile.naics);
  });
  it("board + calendar from stored rows", async () => {
    const o = silvahOpportunity();
    await saveOpportunity(db, { ...o, noticeId: "x2", solicitationNumber: "SOL-2", responseDeadline: "2026-11-05T14:00:00-05:00", questionsDeadline: null });
    const items = await listPipeline(db);
    const b = board(items); expect(b.new.map((i) => i.noticeId)).toEqual(["x2"]); expect(b.submitted).toHaveLength(1);
    const cal = deadlineCalendar(items, NOW);
    expect(cal.map((c) => c.date)).toEqual(["2026-11-04", "2026-11-05", "2026-11-11"]);
    expect(cal[0]!.deadlines[0]!.status).toBe("urgent");
    await updateOpportunity(db, "x2", { stage: "passed" });
    expect(deadlineCalendar(await listPipeline(db), NOW).map((c) => c.date)).toEqual(["2026-11-04", "2026-11-11"]);
    expect((await deleteOpportunity(db, "x2")).deleted).toBe(1);
  });
});

describe("chat skill", () => {
  const s = readFileSync(".agents/skills/bid-desk/SKILL.md", "utf8");
  it("has frontmatter and only references real actions", () => {
    expect(s).toMatch(/^---\nname: bid-desk\n/);
    const named = [...s.matchAll(/`([a-z]+(?:-[a-z]+)+)`/g)].map((m) => m[1]!).filter((n) => !["pursue-with-caveats"].includes(n));
    expect(named.length).toBeGreaterThanOrEqual(5);
    for (const n of new Set(named)) expect(existsSync(`actions/${n}.ts`), n).toBe(true);
  });
  it("covers search -> analyze -> pipeline -> deadlines -> profile", () => {
    for (const a of ["search-sam", "save-opportunity", "list-pipeline", "update-opportunity", "track-deadlines", "update-profile"]) expect(s).toContain(a);
    expect(s).toMatch(/never submits/i);
  });
});
