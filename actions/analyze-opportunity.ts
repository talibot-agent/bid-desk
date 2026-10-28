import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { demoProfile, runPipeline, silvahOpportunity } from "../shared/biddesk";
export default defineAction({
  description: "Run Bid Desk on an opportunity: fit score with cited factors, draft capability statement, response outline, and deadline tracker. Use solicitation 12760426Q0195 for the SILVAH demo.",
  mcpTool: true,
  schema: z.object({ solicitationNumber: z.string().default("12760426Q0195") }),
  http: { method: "GET" },
  run: async ({ solicitationNumber }) => {
    const o = silvahOpportunity();
    if (solicitationNumber !== o.solicitationNumber) throw new Error("MVP analyzes the bundled SILVAH demo only; use search-sam for live listings.");
    return runPipeline(o, demoProfile);
  },
});
