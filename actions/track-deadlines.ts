import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { silvahOpportunity, trackDeadlines } from "../shared/biddesk";
import { deadlineCalendar } from "../shared/biddesk/pipeline";
import { getDb } from "../server/db/index.js";
import { listPipeline } from "../server/db/repo.js";
export default defineAction({
  description: "List upcoming bid deadlines (questions due, response due) with urgency status for saved active opportunities; falls back to the SILVAH demo when the pipeline is empty.",
  mcpTool: true,
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => {
    const items = await listPipeline(getDb());
    if (!items.length) return { source: "demo", deadlines: trackDeadlines([silvahOpportunity()]) };
    const calendar = deadlineCalendar(items);
    return { source: "pipeline", deadlines: calendar.flatMap((d) => d.deadlines), calendar };
  },
});
