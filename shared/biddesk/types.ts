export interface Opportunity {
  noticeId: string;
  solicitationNumber: string;
  title: string;
  type: string;
  agency: string;
  office: string;
  publishDate: string;
  responseDeadline: string; // ISO with offset
  description: string;
  naics?: string[];
  setAside?: string | null;
  url: string;
  questionsDeadline?: string | null;
  requirements?: string[];
  questions?: string[];
}
export interface CapabilityProfile {
  name: string;
  entityType: string;
  uei: string;
  location: string; // public-safe (city/state)
  pocName: string;
  pocEmail: string;
  smallBusiness: string[];
  naics: string[];
  keywords: string[];
  competencies: string[];
  gaps: string[];
  pastPerformance: { title: string; summary: string }[];
  differentiators: string[];
}
export interface FitFactor { name: string; weight: number; score: number; evidence: string }
export interface FitResult { score: number; verdict: "pursue" | "pursue-with-caveats" | "pass"; factors: FitFactor[]; matched: string[]; missing: string[] }
export interface Deadline { label: string; at: string; daysLeft: number; status: "overdue" | "urgent" | "soon" | "ok" }
