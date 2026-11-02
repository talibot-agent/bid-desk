// Live check (no key, no sign-in): search SAM.gov, ingest attachments of the first N notices that have any.
import { ingestNotice, searchSam } from "../shared/biddesk";
const q = process.argv[2] ?? "software"; const want = Number(process.argv[3] ?? 3);
let ok = 0;
for (const o of await searchSam(q, 25)) {
  if (ok >= want) break;
  const r = await ingestNotice(o);
  if (!r.attachments.length) continue;
  ok++;
  console.log(`${o.solicitationNumber} | ${o.type} | ${o.title.slice(0, 60)}`);
  for (const a of r.attachments) console.log(`  - ${a.name} [${a.kind}] ${a.chars} chars${a.error ? " ERROR " + a.error : ""}`);
  console.log(`  questions=${r.opportunity.questions?.length ?? 0} requirements=${r.opportunity.requirements?.length ?? 0} qDeadline=${r.opportunity.questionsDeadline ?? "-"}`);
}
console.log(`parsed ${ok} live notices with attachments`);
