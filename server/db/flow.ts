import type { PgDatabase } from "drizzle-orm/pg-core";
import { ingestNotice, runPipeline, searchSam, silvahOpportunity } from "../../shared/biddesk";
import type { Opportunity } from "../../shared/biddesk/types";
import { getProfile, saveOpportunity } from "./repo.js";

/** Resolve a notice by solicitation number / notice id (SILVAH demo is bundled offline). */
export async function resolveNotice(id: string, fetchImpl: typeof fetch = fetch): Promise<Opportunity> {
  const demo = silvahOpportunity();
  if (id === demo.solicitationNumber || id === demo.noticeId) return demo;
  const hits = await searchSam(id, 10, fetchImpl);
  const hit = hits.find((h) => h.solicitationNumber === id || h.noticeId === id) ?? (hits.length === 1 ? hits[0] : undefined);
  if (!hit) throw new Error(`No SAM.gov notice matched "${id}" (${hits.length} fuzzy hits). Use search-sam first and pass the exact solicitation number or notice id.`);
  return hit;
}

/** Search -> ingest attachments -> score with saved profile -> draft -> persist. */
export async function analyzeAndSave(db: PgDatabase<any, any>, id: string, opts: { parseAttachments?: boolean; fetchImpl?: typeof fetch; now?: Date } = {}) {
  const f = opts.fetchImpl ?? fetch;
  let o = await resolveNotice(id, f);
  let attachments: unknown[] = [];
  if (opts.parseAttachments !== false) {
    try { const r = await ingestNotice(o, f); o = r.opportunity; attachments = r.attachments; }
    catch (e) { attachments = [{ error: `attachment ingest failed: ${(e as Error).message}` }]; }
  }
  const profile = await getProfile(db);
  const analysis = runPipeline(o, profile, opts.now);
  const saved = await saveOpportunity(db, o, { fit: analysis.fit, analysis, attachments });
  return { ...saved, ...analysis, attachments };
}
