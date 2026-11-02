import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { board, deadlineCalendar, STAGES } from "../shared/biddesk/pipeline";
import { getDb } from "../server/db/index.js";
import { listPipeline } from "../server/db/repo.js";
export default defineAction({
  description: "List saved bid opportunities as a kanban board (new/scoring/drafting/submitted/won/lost/passed) plus a deadline calendar grouped by ET date.",
  mcpTool: true,
  schema: z.object({ stage: z.enum(STAGES).optional().describe("Only this stage; omit for all") }),
  http: { method: "GET" },
  run: async ({ stage }) => { const items = await listPipeline(getDb(), stage); return { count: items.length, board: board(items), calendar: deadlineCalendar(items) }; },
});
