import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { STAGES } from "../shared/biddesk/pipeline";
import { getDb } from "../server/db/index.js";
import { getOpportunity, updateOpportunity } from "../server/db/repo.js";
export default defineAction({
  description: "Get a saved opportunity (full analysis + attachments), or move its pipeline stage / set notes. Allowed moves: new->scoring|passed, scoring->drafting|passed, drafting->submitted|passed, submitted->won|lost, passed->new.",
  mcpTool: true,
  schema: z.object({
    id: z.string().describe("Notice id of a saved opportunity"),
    stage: z.enum(STAGES).optional().describe("New stage; omit to only read"),
    notes: z.string().optional().describe("Replace notes; omit to keep"),
  }),
  run: async ({ id, stage, notes }) => {
    const db = getDb();
    if (stage === undefined && notes === undefined) { const r = await getOpportunity(db, id); if (!r) throw new Error(`No saved opportunity ${id}`); return r; }
    return updateOpportunity(db, id, { ...(stage ? { stage } : {}), ...(notes !== undefined ? { notes } : {}) });
  },
});
