import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { getDb } from "../server/db/index.js";
import { analyzeAndSave } from "../server/db/flow.js";
export default defineAction({
  description: "Analyze a SAM.gov notice and save it to the bid pipeline: downloads and parses public PDF/DOCX attachments, scores fit against the saved capability profile, drafts statement + outline. id = exact solicitation number or notice id (12760426Q0195 = bundled SILVAH demo).",
  mcpTool: true,
  schema: z.object({
    id: z.string().describe("Exact solicitation number or SAM.gov notice id"),
    parseAttachments: z.enum(["true", "false"]).default("true").describe('Download and parse attachments: "true" or "false"; defaults to "true"'),
  }),
  run: async ({ id, parseAttachments }) => analyzeAndSave(getDb(), id, { parseAttachments: parseAttachments === "true" }),
});
