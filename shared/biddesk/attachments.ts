import { strFromU8, unzipSync } from "fflate";
import type { Opportunity } from "./types";
import { parseRfiText } from "./sam";

export const SAM_RESOURCES = (noticeId: string) => `https://sam.gov/api/prod/opps/v3/opportunities/${noticeId}/resources?excludeDeleted=true&withScanResult=false`;
export const SAM_DOWNLOAD = (resourceId: string) => `https://sam.gov/api/prod/opps/v3/opportunities/resources/files/${resourceId}/download`;

export interface Attachment { resourceId: string; name: string; mimeType: string; size: number; postedDate: string; url: string }
export interface ParsedAttachment extends Attachment { kind: "pdf" | "docx" | "text" | "unsupported"; text: string; chars: number; error?: string }

/** List public attachments for a SAM.gov notice (no sign-in, no API key). */
export async function listSamAttachments(noticeId: string, fetchImpl: typeof fetch = fetch): Promise<Attachment[]> {
  const res = await fetchImpl(SAM_RESOURCES(noticeId), { headers: { Accept: "application/hal+json" } });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`SAM.gov resources failed: ${res.status}`);
  const d: any = await res.json();
  return (d._embedded?.opportunityAttachmentList ?? []).flatMap((l: any) => l.attachments ?? [])
    .filter((a: any) => a.type === "file" && a.accessLevel === "public" && a.deletedFlag !== "1")
    .map((a: any) => ({ resourceId: a.resourceId, name: a.name, mimeType: a.mimeType ?? "", size: a.size ?? 0, postedDate: a.postedDate ?? "", url: SAM_DOWNLOAD(a.resourceId) }));
}

export function detectKind(name: string, bytes: Uint8Array): ParsedAttachment["kind"] {
  const head = String.fromCharCode(...bytes.slice(0, 5));
  if (head.startsWith("%PDF")) return "pdf";
  if (head.startsWith("PK") && /\.docx$/i.test(name)) return "docx";
  if (/\.(txt|md|csv)$/i.test(name)) return "text";
  return "unsupported";
}

const decodeXml = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

/** DOCX -> plain text: paragraphs become lines, tabs/breaks preserved, list items keep a bullet. */
export function docxToText(bytes: Uint8Array): string {
  const files = unzipSync(bytes, { filter: (f) => f.name === "word/document.xml" });
  const xml = files["word/document.xml"];
  if (!xml) throw new Error("not a DOCX (word/document.xml missing)");
  return strFromU8(xml).split(/<\/w:p>/).map((p) => {
    const bullet = /<w:numPr\b/.test(p) ? "• " : "";
    const t = p.replace(/<w:tab\/>/g, "\u0002").replace(/<w:br\/>/g, "\u0003").replace(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g, "\u0000$1\u0001").replace(/<[^>]+>/g, "");
    const text = [...t.matchAll(/\u0000([^\u0001]*)\u0001|([\u0002\u0003])/g)].map((m) => m[1] ?? (m[2] === "\u0002" ? "\t" : "\n")).join("");
    return text ? bullet + decodeXml(text) : "";
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function pdfToText(bytes: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  const { text } = await extractText(pdf, { mergePages: true });
  return (text as string).trim();
}

export async function extractAttachmentText(name: string, bytes: Uint8Array): Promise<{ kind: ParsedAttachment["kind"]; text: string }> {
  const kind = detectKind(name, bytes);
  if (kind === "pdf") return { kind, text: await pdfToText(bytes) };
  if (kind === "docx") return { kind, text: docxToText(bytes) };
  if (kind === "text") return { kind, text: strFromU8(bytes) };
  return { kind, text: "" };
}

/** Download + parse every public attachment. Per-file errors are reported, never thrown. */
export async function parseNoticeAttachments(noticeId: string, fetchImpl: typeof fetch = fetch, maxBytes = 15_000_000): Promise<ParsedAttachment[]> {
  const out: ParsedAttachment[] = [];
  for (const a of await listSamAttachments(noticeId, fetchImpl)) {
    try {
      if (a.size > maxBytes) throw new Error(`skipped: ${a.size} bytes > ${maxBytes}`);
      const res = await fetchImpl(a.url);
      if (!res.ok) throw new Error(`download failed: ${res.status}`);
      const { kind, text } = await extractAttachmentText(a.name, new Uint8Array(await res.arrayBuffer()));
      out.push({ ...a, kind, text, chars: text.length });
    } catch (e) { out.push({ ...a, kind: "unsupported", text: "", chars: 0, error: String((e as Error).message ?? e) }); }
  }
  return out;
}

/** Generic notice text parse: works on RFIs, sources sought, RFQs. Falls back to keyword sections when the SILVAH-style headings are absent. */
export function parseNoticeText(text: string): { questions: string[]; requirements: string[]; questionsDeadline: string | null } {
  const r = parseRfiText(text);
  let questions = r.questions, requirements = r.requirements;
  if (!questions.length) questions = [...text.matchAll(/^\s*(?:\d{1,2}[.)]|[a-z][.)])\s+(.{15,400}?\?)\s*$/gim)].map((m) => m[1]!.replace(/\s+/g, " ").trim()).slice(0, 25);
  if (!requirements.length) requirements = [...new Set([...text.matchAll(/^\s*[•\-*]\s+(.{3,200})$/gm)].map((m) => m[1]!.trim()))].slice(0, 25);
  let questionsDeadline = r.questionsDeadline;
  if (!questionsDeadline) { const m = text.match(/questions?[^.\n]{0,80}?(?:due|submitted|received)[^.\n]{0,40}?(\d{1,2})\/(\d{1,2})\/(\d{4})/i); if (m) questionsDeadline = `${m[3]}-${m[1]!.padStart(2, "0")}-${m[2]!.padStart(2, "0")}T17:00:00-05:00`; }
  return { questions, requirements, questionsDeadline };
}

/** Enrich an opportunity with its attachments' text (description stays; parsed fields filled when found). */
export async function ingestNotice(o: Opportunity, fetchImpl: typeof fetch = fetch) {
  const attachments = await parseNoticeAttachments(o.noticeId, fetchImpl);
  const corpus = [o.description, ...attachments.map((a) => a.text)].join("\n\n");
  const p = parseNoticeText(corpus);
  const enriched: Opportunity = { ...o, questions: o.questions?.length ? o.questions : p.questions, requirements: o.requirements?.length ? o.requirements : p.requirements, questionsDeadline: o.questionsDeadline ?? p.questionsDeadline ?? null };
  return { opportunity: enriched, attachments: attachments.map(({ text, ...a }) => ({ ...a, preview: text.slice(0, 400) })), corpusChars: corpus.length };
}
