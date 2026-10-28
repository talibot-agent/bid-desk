import type { Deadline, Opportunity } from "./types";
export function trackDeadlines(opps: Opportunity[], now = new Date()): (Deadline & { solicitationNumber: string })[] {
  const out: (Deadline & { solicitationNumber: string })[] = [];
  for (const o of opps) {
    const items: [string, string | null | undefined][] = [["Questions due", o.questionsDeadline], ["Response due", o.responseDeadline]];
    for (const [label, at] of items) {
      if (!at) continue;
      const ms = Date.parse(at) - now.getTime(); const daysLeft = Math.floor(ms / 864e5);
      const status = ms < 0 ? "overdue" : daysLeft < 3 ? "urgent" : daysLeft < 7 ? "soon" : "ok";
      out.push({ solicitationNumber: o.solicitationNumber, label: `${o.solicitationNumber} ${label}`, at, daysLeft, status });
    }
  }
  return out.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}
