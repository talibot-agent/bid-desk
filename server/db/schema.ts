import { doublePrecision, index, pgTable, text } from "drizzle-orm/pg-core";

/** Bid pipeline: one row per SAM.gov notice. JSON payloads stored as text (single-tenant local app). */
export const bidOpportunities = pgTable("bid_opportunities", {
  noticeId: text("notice_id").primaryKey(),
  solicitationNumber: text("solicitation_number").notNull().default(""),
  title: text("title").notNull().default(""),
  agency: text("agency").notNull().default(""),
  stage: text("stage").notNull().default("new"),
  fitScore: doublePrecision("fit_score"),
  verdict: text("verdict"),
  responseDeadline: text("response_deadline").notNull().default(""),
  questionsDeadline: text("questions_deadline"),
  notes: text("notes").notNull().default(""),
  opportunityJson: text("opportunity_json").notNull(),
  analysisJson: text("analysis_json"),
  attachmentsJson: text("attachments_json"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (t) => [index("bid_opp_stage_idx").on(t.stage), index("bid_opp_deadline_idx").on(t.responseDeadline)]);

/** Capability profile, keyed by name ("default"). */
export const bidProfiles = pgTable("bid_profiles", {
  id: text("id").primaryKey(),
  profileJson: text("profile_json").notNull(),
  updatedAt: text("updated_at").notNull(),
});
