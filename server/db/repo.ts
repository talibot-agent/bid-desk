import { asc, eq } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { bidOpportunities, bidProfiles } from "./schema.js";
import { canMove, STAGES, type PipelineItem, type Stage } from "../../shared/biddesk/pipeline";
import type { CapabilityProfile, FitResult, Opportunity } from "../../shared/biddesk/types";
import { demoProfile } from "../../shared/biddesk/silvah-demo";

type Db = PgDatabase<any, any>;
const now = () => new Date().toISOString();

export async function saveOpportunity(db: Db, o: Opportunity, extra: { fit?: FitResult; analysis?: unknown; attachments?: unknown; stage?: Stage } = {}) {
  const [existing] = await db.select({ stage: bidOpportunities.stage, createdAt: bidOpportunities.createdAt }).from(bidOpportunities).where(eq(bidOpportunities.noticeId, o.noticeId));
  const row = {
    noticeId: o.noticeId, solicitationNumber: o.solicitationNumber, title: o.title, agency: o.agency,
    stage: extra.stage ?? (existing?.stage as Stage) ?? (extra.fit ? "scoring" : "new"),
    fitScore: extra.fit?.score ?? null, verdict: extra.fit?.verdict ?? null,
    responseDeadline: o.responseDeadline ?? "", questionsDeadline: o.questionsDeadline ?? null,
    opportunityJson: JSON.stringify(o), analysisJson: extra.analysis ? JSON.stringify(extra.analysis) : null,
    attachmentsJson: extra.attachments ? JSON.stringify(extra.attachments) : null,
    createdAt: existing?.createdAt ?? now(), updatedAt: now(),
  };
  const { noticeId, createdAt, ...upd } = row;
  await db.insert(bidOpportunities).values(row).onConflictDoUpdate({ target: bidOpportunities.noticeId, set: upd });
  return { noticeId, stage: row.stage, created: !existing };
}

const toItem = (r: typeof bidOpportunities.$inferSelect): PipelineItem => ({ noticeId: r.noticeId, solicitationNumber: r.solicitationNumber, title: r.title, agency: r.agency, stage: r.stage as Stage, fitScore: r.fitScore, verdict: r.verdict, responseDeadline: r.responseDeadline, questionsDeadline: r.questionsDeadline, notes: r.notes });

export async function listPipeline(db: Db, stage?: Stage): Promise<PipelineItem[]> {
  const q = db.select().from(bidOpportunities);
  const rows = await (stage ? q.where(eq(bidOpportunities.stage, stage)) : q).orderBy(asc(bidOpportunities.responseDeadline));
  return rows.map(toItem);
}

export async function getOpportunity(db: Db, noticeId: string) {
  const [r] = await db.select().from(bidOpportunities).where(eq(bidOpportunities.noticeId, noticeId));
  if (!r) return null;
  return { ...toItem(r), opportunity: JSON.parse(r.opportunityJson) as Opportunity, analysis: r.analysisJson ? JSON.parse(r.analysisJson) : null, attachments: r.attachmentsJson ? JSON.parse(r.attachmentsJson) : [] };
}

export async function updateOpportunity(db: Db, noticeId: string, patch: { stage?: Stage; notes?: string }) {
  const [r] = await db.select({ stage: bidOpportunities.stage }).from(bidOpportunities).where(eq(bidOpportunities.noticeId, noticeId));
  if (!r) throw new Error(`No saved opportunity ${noticeId}`);
  if (patch.stage && !STAGES.includes(patch.stage)) throw new Error(`Unknown stage ${patch.stage}`);
  if (patch.stage && !canMove(r.stage as Stage, patch.stage)) throw new Error(`Cannot move ${r.stage} -> ${patch.stage}`);
  await db.update(bidOpportunities).set({ ...patch, updatedAt: now() }).where(eq(bidOpportunities.noticeId, noticeId));
  return getOpportunity(db, noticeId);
}

export async function deleteOpportunity(db: Db, noticeId: string) {
  const r = await db.delete(bidOpportunities).where(eq(bidOpportunities.noticeId, noticeId)).returning({ id: bidOpportunities.noticeId });
  return { deleted: r.length };
}

export async function getProfile(db: Db, id = "default"): Promise<CapabilityProfile> {
  const [r] = await db.select().from(bidProfiles).where(eq(bidProfiles.id, id));
  return r ? JSON.parse(r.profileJson) : demoProfile;
}

export async function updateProfile(db: Db, patch: Partial<CapabilityProfile>, id = "default") {
  const merged = { ...(await getProfile(db, id)), ...patch };
  await db.insert(bidProfiles).values({ id, profileJson: JSON.stringify(merged), updatedAt: now() }).onConflictDoUpdate({ target: bidProfiles.id, set: { profileJson: JSON.stringify(merged), updatedAt: now() } });
  return merged;
}
