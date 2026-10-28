import { rfiText, samSearch } from "../../fixtures/silvah";
import type { CapabilityProfile, Opportunity } from "./types";
import { normalizeSamResult, parseRfiText } from "./sam";

/** Public-safe demo profile: no EIN, no street address, no phone. */
export const demoProfile: CapabilityProfile = {
  name: "Mykel Anthony Nelson (sole proprietor)", entityType: "Sole proprietorship", uei: "Pending (SAM.gov entity validation submitted Oct 27, 2026)",
  location: "Crystal River, FL", pocName: "Mykel Nelson", pocEmail: "[redacted in public demo]", smallBusiness: ["Small business"],
  naics: ["541511", "541512", "541519"],
  keywords: ["software", "code", "repair", "update", "rewrite", "test", "decision", "simulator", "database"],
  gaps: ["C++", "forestry", "silvicultur", "certification", "on-site"],
  competencies: ["Legacy code repair with regression proof (byte-identical outputs)", "Scientific / geospatial decision-support pipelines", "Explainable decision tools with automated test suites", "AI-assisted engineering with owner-accountable review"],
  pastPerformance: [
    { title: "Agenthon 2026 Track 3", summary: "Sped up an ABIDES simulation baseline; outputs byte-identical on 71 test units; CI-built container." },
    { title: "DOE GEMS Prize 2026", summary: "Lidar-derived fault-trace mapping pipeline with leave-out cross-validation." },
    { title: "Glass Box Treasurer", summary: "Policy-to-rules engine with cited decisions and hash-chained audit log; 100+ tests." },
  ],
  differentiators: ["Every change proven by regression tests against reference runs", "Remote, direct access to the owner-engineer", "Honest about gaps; no invented history"],
};

export function silvahOpportunity(): Opportunity {
  const base = normalizeSamResult(samSearch._embedded.results[0]);
  return { ...base, ...parseRfiText(rfiText) };
}
