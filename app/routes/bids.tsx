import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { nextStages } from "../../shared/biddesk/pipeline";

function download(filename: string, blob: Blob) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

export function meta() { return [{ title: "Bid Desk" }]; }

export default function Bids() {
  const { data, isLoading, error } = useActionQuery<any>("analyze-opportunity" as any, { solicitationNumber: "12760426Q0195" } as any);
  const { data: pipe, refetch } = useActionQuery<any>("list-pipeline" as any, {} as any);
  const move = useActionMutation<any, any>("update-opportunity" as any, { onSuccess: () => { void refetch(); } } as any);
  const exp = useActionMutation<any, any>("export-opportunity" as any, { onSuccess: (r: any) => download(r.filename, r.base64 ? new Blob([Uint8Array.from(atob(r.base64), (c) => c.charCodeAt(0))], { type: r.mimeType }) : new Blob([r.markdown], { type: r.mimeType })) } as any);
  if (isLoading) return <div className="p-6">Analyzing…</div>;
  if (error || !data) return <div className="p-6 text-red-600">Error: {String(error)}</div>;
  const { opportunity: o, fit, statement, outline, deadlines } = data;
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header><h1 className="text-2xl font-semibold">Bid Desk</h1><p className="text-sm opacity-70">{o.title} · {o.solicitationNumber} · {o.agency}</p></header>
      {pipe?.count ? (<section className="rounded border p-4"><h2 className="font-medium">Pipeline ({pipe.count})</h2>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">{Object.entries(pipe.board).filter(([s, v]: any) => v.length || ["new", "scoring", "drafting", "submitted"].includes(s)).map(([s, items]: any) => (
          <div key={s} className="rounded bg-black/5 p-2"><div className="mb-1 font-medium uppercase">{s} · {items.length}</div>
            {items.map((i: any) => <div key={i.noticeId} className="mb-1 rounded border bg-white/50 p-1">{i.solicitationNumber}<br />{i.title.slice(0, 50)}{i.fitScore != null ? ` · ${i.fitScore}` : ""}
              <div className="mt-1 flex flex-wrap gap-1">{nextStages(i.stage).map((to) => <button key={to} type="button" disabled={move.isPending} onClick={() => move.mutate({ id: i.noticeId, stage: to })} className="rounded border px-1 hover:bg-black/10">→ {to}</button>)}
                {i.fitScore != null ? <><button type="button" onClick={() => exp.mutate({ id: i.noticeId, format: "md" })} className="rounded border px-1">MD</button><button type="button" onClick={() => exp.mutate({ id: i.noticeId, format: "pdf" })} className="rounded border px-1">PDF</button></> : null}</div></div>)}</div>))}</div>
        <h3 className="mt-3 text-sm font-medium">Deadline calendar (ET)</h3>
        <ul className="text-xs">{pipe.calendar.map((c: any) => <li key={c.date}><b>{c.date}</b>: {c.deadlines.map((d: any) => `[${d.status}] ${d.label}`).join("; ")}</li>)}</ul></section>) : null}
      <section className="rounded border p-4"><h2 className="font-medium">Fit: {fit.score}/100 — {fit.verdict}</h2>
        <ul className="mt-2 text-sm">{fit.factors.map((f: any) => <li key={f.name}>{f.name} ({f.weight}%): {Math.round(f.score * 100)}% — {f.evidence}</li>)}</ul></section>
      <section className="rounded border p-4"><h2 className="font-medium">Deadlines</h2>
        <ul className="text-sm">{deadlines.map((d: any) => <li key={d.label}>[{d.status}] {d.label}: {new Date(d.at).toLocaleString()} ({d.daysLeft} days)</li>)}</ul></section>
      <section className="grid gap-4 md:grid-cols-2">
        <pre className="whitespace-pre-wrap rounded border p-4 text-xs">{statement}</pre>
        <pre className="whitespace-pre-wrap rounded border p-4 text-xs">{outline}</pre>
      </section>
    </div>
  );
}
