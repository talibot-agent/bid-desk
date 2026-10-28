export * from "./types"; export * from "./sam"; export * from "./fit"; export * from "./draft"; export * from "./deadlines";
export * from "./silvah-demo";
import { scoreFit } from "./fit"; import { draftCapabilityStatement, draftResponseOutline } from "./draft"; import { trackDeadlines } from "./deadlines";
import type { CapabilityProfile, Opportunity } from "./types";
export function runPipeline(o: Opportunity, p: CapabilityProfile, now = new Date()) {
  const fit = scoreFit(o, p, now);
  return { opportunity: o, fit, statement: draftCapabilityStatement(o, p, fit), outline: draftResponseOutline(o, p, fit), deadlines: trackDeadlines([o], now) };
}
