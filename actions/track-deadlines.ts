import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { silvahOpportunity, trackDeadlines } from "../shared/biddesk";
export default defineAction({
  description: "List upcoming bid deadlines (questions due, response due) with urgency status.",
  mcpTool: true,
  schema: z.object({}),
  http: { method: "GET" },
  run: async () => ({ deadlines: trackDeadlines([silvahOpportunity()]) }),
});
