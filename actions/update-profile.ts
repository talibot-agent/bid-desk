import { defineAction } from "@agent-native/core/action";
import { z } from "zod";
import { getDb } from "../server/db/index.js";
import { getProfile, updateProfile } from "../server/db/repo.js";
const list = z.array(z.string()).optional();
export default defineAction({
  description: "Read (no fields) or update the capability profile used for fit scoring. Lists replace the existing list. Never store EIN, street address or phone.",
  mcpTool: true,
  schema: z.object({
    name: z.string().optional().describe("Business name"), location: z.string().optional().describe("City, state only"),
    naics: list.describe("NAICS codes"), keywords: list.describe("Fit keywords"), competencies: list.describe("Core competencies"), gaps: list.describe("Known gaps (cap verdict)"), differentiators: list.describe("Differentiators"),
  }),
  run: async (patch) => {
    const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
    const bad = JSON.stringify(clean).match(/\b\d{2}-\d{7}\b|\(?\d{3}\)?[ -]\d{3}-\d{4}/);
    if (bad) throw new Error("Refusing to store an EIN or phone number in the profile.");
    return Object.keys(clean).length ? updateProfile(getDb(), clean) : getProfile(getDb());
  },
});
