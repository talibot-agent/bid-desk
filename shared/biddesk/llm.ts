/**
 * Free-only model chain for the chat demo. Order: Hugging Face Inference (free tier, only if HF_TOKEN is set)
 * -> local Ollama (OLLAMA_MODEL, default qwen2.5:3b, then any installed of FALLBACK_MODELS) -> rule-based text.
 * No paid provider is ever called; the demo works with no key at all.
 */
export interface ChatMsg { role: "system" | "user" | "assistant"; content: string }
export interface LlmResult { text: string; provider: "huggingface" | "ollama" | "rule-based"; model: string; error?: string }
export const HF_MODEL = "Qwen/Qwen2.5-7B-Instruct";
export const OLLAMA_PREFERRED = "qwen2.5:3b";
export const FALLBACK_MODELS = ["qwen2.5:3b", "gemma3:4b", "llama3.2:3b"];

type Env = Record<string, string | undefined>;
export async function complete(messages: ChatMsg[], fallback: () => string, opts: { env?: Env; fetchImpl?: typeof fetch; timeoutMs?: number } = {}): Promise<LlmResult> {
  const env = opts.env ?? process.env, f = opts.fetchImpl ?? fetch, t = opts.timeoutMs ?? 120_000;
  const errors: string[] = [];
  const hfToken = env.HF_TOKEN;
  if (hfToken) {
    try {
      const r = await f("https://router.huggingface.co/v1/chat/completions", { method: "POST", signal: AbortSignal.timeout(t), headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: env.HF_MODEL ?? HF_MODEL, messages, max_tokens: 400, temperature: 0.2 }) });
      if (!r.ok) throw new Error(`HF ${r.status}`);
      const d: any = await r.json(); const text = d.choices?.[0]?.message?.content?.trim();
      if (text) return { text, provider: "huggingface", model: env.HF_MODEL ?? HF_MODEL };
      throw new Error("HF empty response");
    } catch (e) { errors.push(String((e as Error).message)); }
  }
  const base = env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
  try {
    const tags: any = await (await f(`${base}/api/tags`, { signal: AbortSignal.timeout(3000) })).json();
    const have = new Set((tags.models ?? []).map((m: any) => m.name));
    const model = [env.OLLAMA_MODEL ?? OLLAMA_PREFERRED, ...FALLBACK_MODELS].find((m) => have.has(m));
    if (!model) throw new Error("no supported Ollama model installed");
    const r = await f(`${base}/api/chat`, { method: "POST", signal: AbortSignal.timeout(t), body: JSON.stringify({ model, messages, stream: false, options: { temperature: 0.2, num_predict: 400 } }) });
    if (!r.ok) throw new Error(`Ollama ${r.status}`);
    const d: any = await r.json(); const text = d.message?.content?.trim();
    if (text) return { text, provider: "ollama", model };
    throw new Error("Ollama empty response");
  } catch (e) { errors.push(String((e as Error).message)); }
  return { text: fallback(), provider: "rule-based", model: "none", error: errors.join("; ") };
}
