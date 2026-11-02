import { trackDeadlines } from "./deadlines";
import type { Deadline, Opportunity } from "./types";

export const STAGES = ["new", "scoring", "drafting", "submitted", "won", "lost", "passed"] as const;
export type Stage = (typeof STAGES)[number];
export interface PipelineItem { noticeId: string; solicitationNumber: string; title: string; agency: string; stage: Stage; fitScore: number | null; verdict: string | null; responseDeadline: string; questionsDeadline?: string | null; notes?: string }

const NEXT: Record<Stage, Stage[]> = { new: ["scoring", "passed"], scoring: ["drafting", "passed"], drafting: ["submitted", "passed"], submitted: ["won", "lost"], won: [], lost: [], passed: ["new"] };
export function canMove(from: Stage, to: Stage) { return from === to || NEXT[from].includes(to); }

/** Kanban columns in fixed order; inside a column, soonest response deadline first. */
export function board(items: PipelineItem[]): Record<Stage, PipelineItem[]> {
  const b = Object.fromEntries(STAGES.map((s) => [s, [] as PipelineItem[]])) as Record<Stage, PipelineItem[]>;
  for (const i of items) b[i.stage].push(i);
  for (const s of STAGES) b[s].sort((x, y) => Date.parse(x.responseDeadline) - Date.parse(y.responseDeadline));
  return b;
}

/** Deadline calendar: active (not closed-out) items, deadlines grouped by America/New_York date. */
export function deadlineCalendar(items: PipelineItem[], now = new Date()): { date: string; deadlines: Deadline[] }[] {
  const active = items.filter((i) => !["won", "lost", "passed"].includes(i.stage));
  const ds = trackDeadlines(active.map((i) => ({ solicitationNumber: i.solicitationNumber, responseDeadline: i.responseDeadline, questionsDeadline: i.questionsDeadline ?? null } as Opportunity)), now);
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" });
  const by = new Map<string, Deadline[]>();
  for (const d of ds) { const k = fmt.format(new Date(d.at)); by.set(k, [...(by.get(k) ?? []), d]); }
  return [...by.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, deadlines]) => ({ date, deadlines }));
}
