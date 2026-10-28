import { useActionQuery } from "@agent-native/core/client/hooks";

export function meta() { return [{ title: "Bid Desk" }]; }

export default function Bids() {
  const { data, isLoading, error } = useActionQuery<any>("analyze-opportunity" as any, { solicitationNumber: "12760426Q0195" } as any);
  if (isLoading) return <div className="p-6">Analyzing…</div>;
  if (error || !data) return <div className="p-6 text-red-600">Error: {String(error)}</div>;
  const { opportunity: o, fit, statement, outline, deadlines } = data;
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header><h1 className="text-2xl font-semibold">Bid Desk</h1><p className="text-sm opacity-70">{o.title} · {o.solicitationNumber} · {o.agency}</p></header>
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
