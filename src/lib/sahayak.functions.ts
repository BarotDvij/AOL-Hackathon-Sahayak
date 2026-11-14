import { createServerFn } from "@tanstack/react-start";
import { generateResponse, type GatewayError } from "@lovable.dev/ai-gateway";
import type { SahayakSnapshotRow } from "@/lib/journey/sahayak";

const INSTRUCTIONS = [
  "You are Sahayak, a warm and calm follow-up helper for an Art of Living centre coordinator.",
  "You are given the coordinator's own participant records and one question about them.",
  "Answer in two short sentences, plain English, naming real people from the records when it helps.",
  "Never invent names, dates or courses. If the records do not answer the question, say so gently.",
  "You only inform and suggest. You never send anything, and you never approve a message.",
].join(" ");

/** Pulls the assistant's text out of a Responses API reply. */
function textOf(res: Awaited<ReturnType<typeof generateResponse<"openai/gpt-6-astra">>>): string {
  const parts: string[] = [];
  for (const item of res.output ?? []) {
    if (item.type !== "message") continue;
    for (const c of item.content ?? []) {
      if (c.type === "output_text" && c.text) parts.push(c.text);
    }
  }
  return parts.join(" ").trim();
}

export interface AskSahayakInput { question: string; rows: SahayakSnapshotRow[] }

/**
 * Asks the model a question about the coordinator's own records.
 * Returns null on any failure so the app can fall back to its own pre-written answer.
 */
export const askSahayak = createServerFn({ method: "POST" })
  .inputValidator((data: AskSahayakInput) => ({
    question: String(data?.question ?? "").slice(0, 300),
    rows: Array.isArray(data?.rows) ? data.rows.slice(0, 60) : [],
  }))
  .handler(async ({ data }) => {
    if (!data.rows.length) return { text: null as string | null };
    const table = data.rows
      .map((r) => `${r.name} — ${r.city} — ${r.stage} — ${r.lastContact} — next step: ${r.nextStep}`)
      .join("\n");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: INSTRUCTIONS,
        input: [{ role: "user", content: `Participant records:\n${table}\n\nQuestion: ${data.question}` }],
        max_output_tokens: 220,
      });
      const text = textOf(res);
      return { text: text || null };
    } catch (error) {
      const e = error as GatewayError;
      console.warn("[sahayak] model answer unavailable:", e?.code ?? "unknown");
      return { text: null as string | null };
    }
  });
