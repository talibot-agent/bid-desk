import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { markdownToPdf, packetMarkdown } from "../shared/biddesk/export";
import { getDb } from "../server/db/index.js";
import { getOpportunity, listPipeline } from "../server/db/repo.js";
export default defineAction({
  description: 'Export a saved opportunity\'s bid packet (fit, deadlines, capability statement, response outline). format "md" returns markdown text; "pdf" returns base64 PDF.',
  mcpTool: true,
  schema: z.object({ id: z.string().describe("Notice id or solicitation number of a saved opportunity"), format: z.enum(["md", "pdf"]).default("md").describe('"md" or "pdf"; defaults to "md"') }),
  http: { method: "GET" },
  run: async ({ id, format }) => {
    const db = getDb();
    let r = await getOpportunity(db, id);
    if (!r) { const hit = (await listPipeline(db)).find((i: any) => i.solicitationNumber === id); if (hit) r = await getOpportunity(db, hit.noticeId); }
    if (!r?.analysis) throw new Error(`No saved analysis for ${id}; run save-opportunity first.`);
    const md = packetMarkdown(r.analysis);
    const filename = `bid-packet-${r.solicitationNumber || id}.${format}`;
    if (format === "md") return { filename, mimeType: "text/markdown", markdown: md };
    return { filename, mimeType: "application/pdf", base64: Buffer.from(markdownToPdf(md)).toString("base64") };
  },
});
