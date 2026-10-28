import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { searchSam } from "../shared/biddesk";
export default defineAction({
  description: "Search live SAM.gov contract opportunities via the public (no sign-in) search endpoint.",
  mcpTool: true,
  schema: z.object({ query: z.string().describe("Keywords or solicitation number"), size: z.number().int().min(1).max(25).default(10) }),
  http: { method: "GET" },
  run: async ({ query, size }) => ({ results: await searchSam(query, size) }),
});
