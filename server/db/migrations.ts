export const BID_MIGRATIONS = [
  { version: 1, name: "bid-desk-pipeline-v1", sql: `CREATE TABLE IF NOT EXISTS bid_opportunities (
  notice_id TEXT PRIMARY KEY,
  solicitation_number TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  agency TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT 'new',
  fit_score DOUBLE PRECISION,
  verdict TEXT,
  response_deadline TEXT NOT NULL DEFAULT '',
  questions_deadline TEXT,
  notes TEXT NOT NULL DEFAULT '',
  opportunity_json TEXT NOT NULL,
  analysis_json TEXT,
  attachments_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS bid_opp_stage_idx ON bid_opportunities (stage);
CREATE INDEX IF NOT EXISTS bid_opp_deadline_idx ON bid_opportunities (response_deadline);
CREATE TABLE IF NOT EXISTS bid_profiles (
  id TEXT PRIMARY KEY,
  profile_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);` },
];
