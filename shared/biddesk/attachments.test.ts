import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { strToU8, zipSync } from "fflate";
import { detectKind, docxToText, extractAttachmentText, ingestNotice, listSamAttachments, parseNoticeText, silvahOpportunity } from "./index";

const pdf = new Uint8Array(readFileSync("fixtures/silvah/RFI_Silvah_12760426Q0195.pdf"));
const docx = zipSync({ "word/document.xml": strToU8(`<w:document><w:body>
<w:p><w:r><w:t>Request for Quote 47QTCA26Q0001</w:t></w:r></w:p>
<w:p><w:pPr><w:numPr/></w:pPr><w:r><w:t xml:space="preserve">Past performance &amp; references</w:t></w:r></w:p>
<w:p><w:r><w:t>1. What is your proposed staffing approach?</w:t></w:r></w:p>
<w:p><w:r><w:t>Questions must be submitted by 11/06/2026.</w:t></w:r></w:p></w:body></w:document>`) });
const resources = { _embedded: { opportunityAttachmentList: [{ attachments: [
  { resourceId: "r1", name: "RFI.pdf", type: "file", accessLevel: "public", deletedFlag: "0", size: pdf.length },
  { resourceId: "r2", name: "PWS.docx", type: "file", accessLevel: "public", deletedFlag: "0", size: docx.length },
  { resourceId: "r3", name: "secret.pdf", type: "file", accessLevel: "private", deletedFlag: "0", size: 1 },
  { resourceId: "r4", name: "link", type: "link", accessLevel: "public", deletedFlag: "0", size: 0 },
  { resourceId: "r5", name: "broken.pdf", type: "file", accessLevel: "public", deletedFlag: "0", size: 10 },
] }] } };
const fake: typeof fetch = (async (u: any) => {
  const s = String(u);
  if (s.includes("/resources?")) return new Response(JSON.stringify(resources));
  if (s.includes("/r1/")) return new Response(pdf);
  if (s.includes("/r2/")) return new Response(docx);
  return new Response("nope", { status: 500 });
}) as any;

describe("attachment parsing", () => {
  it("detects kinds by magic bytes", () => {
    expect(detectKind("a.pdf", pdf)).toBe("pdf"); expect(detectKind("a.docx", docx)).toBe("docx");
    expect(detectKind("a.xlsx", docx)).toBe("unsupported"); expect(detectKind("a.txt", strToU8("hi"))).toBe("text");
  });
  it("extracts DOCX text with bullets and entities", () => {
    const t = docxToText(docx);
    expect(t).toContain("Request for Quote 47QTCA26Q0001"); expect(t).toContain("• Past performance & references");
    expect(() => docxToText(zipSync({ "x.txt": strToU8("x") }))).toThrow(/not a DOCX/);
  });
  it("extracts the real SILVAH RFI PDF and parses its 5 questions", async () => {
    const { kind, text } = await extractAttachmentText("RFI.pdf", pdf);
    expect(kind).toBe("pdf"); expect(text).toMatch(/SILVAH/i);
    const p = parseNoticeText(text);
    expect(p.questions!.length).toBe(5); expect(p.questionsDeadline).toBe("2026-11-04T15:00:00-05:00");
  });
  it("generic fallback parses numbered questions, bullets and m/d/y Q&A date", () => {
    const p = parseNoticeText(docxToText(docx));
    expect(p.questions).toEqual(["What is your proposed staffing approach?"]);
    expect(p.requirements).toContain("Past performance & references");
    expect(p.questionsDeadline).toBe("2026-11-06T17:00:00-05:00");
  });
  it("lists only public files and reports per-file errors without throwing", async () => {
    expect((await listSamAttachments("n", fake)).map((a) => a.name)).toEqual(["RFI.pdf", "PWS.docx", "broken.pdf"]);
    const o = { ...silvahOpportunity(), questions: [], requirements: [], questionsDeadline: null };
    const r = await ingestNotice(o, fake);
    expect(r.attachments.map((a) => a.kind)).toEqual(["pdf", "docx", "unsupported"]);
    expect(r.attachments[2]!.error).toMatch(/500/);
    expect(r.opportunity.questions).toHaveLength(5);
    expect(r.opportunity.questionsDeadline).toBe("2026-11-04T15:00:00-05:00");
  });
});
