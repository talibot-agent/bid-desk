import type { Opportunity } from "./types";
export const SAM_SEARCH = "https://sam.gov/api/prod/sgs/v1/search/";

const strip = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/** Normalize one result from SAM.gov's public (no-key) search API. */
export function normalizeSamResult(r: any): Opportunity {
  const org = (r.organizationHierarchy ?? []) as any[];
  const byLevel = (l: number) => org.find((o) => o.level === l)?.name ?? "";
  return {
    noticeId: r._id,
    solicitationNumber: r.solicitationNumber ?? "",
    title: r.title ?? "",
    type: r.type?.value ?? "",
    agency: [byLevel(1), byLevel(2)].filter(Boolean).join(" / "),
    office: byLevel(3),
    publishDate: r.publishDate,
    responseDeadline: r.responseDateActual ?? r.responseDate,
    description: strip(r.descriptions?.[0]?.content ?? ""),
    naics: (r.naics ?? []).flatMap((n: any) => n.code ?? []),
    setAside: r.solicitation?.setAside ?? null,
    url: `https://sam.gov/opp/${r._id}/view`,
  };
}

/** Search SAM.gov public endpoint. No sign-in, no API key. */
export async function searchSam(q: string, size = 10, fetchImpl: typeof fetch = fetch): Promise<Opportunity[]> {
  const u = new URL(SAM_SEARCH);
  Object.entries({ index: "opp", page: "0", size: String(size), q, mode: "search", is_active: "true", sort: "-modifiedDate" }).forEach(([k, v]) => u.searchParams.set(k, v));
  const res = await fetchImpl(u, { headers: { Accept: "application/hal+json" } });
  if (!res.ok) throw new Error(`SAM.gov search failed: ${res.status}`);
  const d: any = await res.json();
  return (d._embedded?.results ?? []).map(normalizeSamResult);
}

/** Pull numbered requested-information items, required response elements and Q&A deadline from RFI text. */
export function parseRfiText(text: string): { questions: string[]; requirements: string[]; questionsDeadline: string | null } {
  const sect = (start: RegExp, end: RegExp) => { const s = text.search(start); if (s < 0) return ""; const rest = text.slice(s); const e = rest.slice(1).search(end); return e < 0 ? rest : rest.slice(0, e + 1); };
  const qs = sect(/Requested Information/i, /Response Format/i).replace(/Caring for the Land.*$/gm, "");
  const questions = [...qs.matchAll(/^\s*\d\.\s+([\s\S]*?)(?=^\s*\d\.\s|$(?![\s\S]))/gm)].map((m) => (m[1] ?? "").replace(/\s+/g, " ").trim()).filter(Boolean);
  const rf = sect(/Response Format/i, /Submission Instructions/i);
  const requirements = [...rf.matchAll(/•\s*(.+)/g)].map((m) => (m[1] ?? "").trim());
  const qd = text.match(/Questions[^.]*?due by\s+([^.]*?\d{4})/i);
  let questionsDeadline: string | null = null;
  if (qd) { const m = (qd[1] ?? "").match(/(\d{1,2}):(\d{2})\s*(am|pm).*?(\w+)\s+(\d{1,2})\w*,\s*(\d{4})/i);
    if (m) { const months = ["january","february","march","april","may","june","july","august","september","october","november","december"]; const [, hh = "0", mm = "00", ap = "", mon = "", dd = "", yy = ""] = m; const h = +hh % 12 + (/pm/i.test(ap) ? 12 : 0); const mo = months.indexOf(mon.toLowerCase()) + 1;
      if (mo > 0) questionsDeadline = `${yy}-${String(mo).padStart(2, "0")}-${dd.padStart(2, "0")}T${String(h).padStart(2, "0")}:${mm}:00-05:00`; } }
  return { questions, requirements, questionsDeadline };
}
