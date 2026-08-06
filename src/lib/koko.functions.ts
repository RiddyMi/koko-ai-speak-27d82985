import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export interface ParsedEntry {
  type: "sale" | "expense" | "credit" | "repayment" | "restock";
  amount: number;
  product: string | null;
  customer: string | null;
  quantity: number | null;
  method: "Cash" | "Transfer" | "POS" | "Credit";
  category: string | null;
  language: string;
  note: string;
}

const SYSTEM = `You are Kòkọ AI, a bookkeeping assistant for Nigerian traders.
Convert a spoken business sentence (English, Nigerian Pidgin, Yorùbá, Hausa, Igbo, or code-switched) into one structured transaction.
Rules:
- "five thousand" = 5000, "two five" for a price usually means 2500, "ẹgbẹrun marun" = 5000.
- type: sale (sold something), expense (money spent), restock (bought stock), credit (customer took goods without paying), repayment (customer paid back debt).
- Amounts are Nigerian Naira, plain numbers with no symbols.
- note: a short human summary in English, e.g. "Sold 2 loaves of bread".
Return ONLY the JSON object.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    type: { type: "string", enum: ["sale", "expense", "credit", "repayment", "restock"] },
    amount: { type: "number" },
    product: { type: ["string", "null"] },
    customer: { type: ["string", "null"] },
    quantity: { type: ["number", "null"] },
    method: { type: "string", enum: ["Cash", "Transfer", "POS", "Credit"] },
    category: { type: ["string", "null"] },
    language: { type: "string" },
    note: { type: "string" },
  },
  required: ["type", "amount", "product", "customer", "quantity", "method", "category", "language", "note"],
};

function key() {
  const k = process.env["LOVABLE_API_KEY"];
  if (!k) throw new Error("AI is not configured yet.");
  return k;
}

/** Transcribe a recorded WAV clip (base64) into text. */
export const transcribeAudio = createServerFn({ method: "POST" })
  .inputValidator((input: { audioBase64: string }) => {
    if (!input?.audioBase64) throw new Error("No audio received.");
    return input;
  })
  .handler(async ({ data }) => {
    const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
    if (bytes.byteLength < 2048) throw new Error("That recording was empty — please try again.");

    const form = new FormData();
    form.append("model", "openai/gpt-4o-transcribe");
    form.append("file", new Blob([bytes], { type: "audio/wav" }), "recording.wav");
    // Keep the model in West African languages instead of drifting to unrelated
    // languages (e.g. Russian) when the audio is short or noisy.
    form.append(
      "prompt",
      "A Nigerian market trader speaking English, Nigerian Pidgin, Yorùbá, Hausa or Igbo about sales, expenses and credit in Naira. Transcribe only in English, Nigerian Pidgin, Yorùbá, Hausa or Igbo.",
    );


    const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}` },
      body: form,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Could not hear that (${res.status}). ${detail.slice(0, 160)}`);
    }
    const json = (await res.json()) as { text?: string };
    return { text: (json.text ?? "").trim() };
  });

/** Turn a spoken sentence into a structured transaction. */
export const parseTransaction = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => {
    if (!input?.text?.trim()) throw new Error("Nothing was said.");
    return input;
  })
  .handler(async ({ data }): Promise<ParsedEntry> => {
    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: {
        "Lovable-API-Key": key(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: data.text },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "transaction", strict: true, schema: SCHEMA },
        },
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Kòkọ could not understand that (${res.status}). ${detail.slice(0, 160)}`);
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    return JSON.parse(content) as ParsedEntry;
  });

/** Answer a business question using a compact snapshot of the books. */
export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: { question: string; snapshot: string }) => {
    if (!input?.question?.trim()) throw new Error("Ask a question first.");
    return input;
  })
  .handler(async ({ data }) => {
    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { "Lovable-API-Key": key(), "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are Kòkọ AI, a warm business advisor for a Nigerian market trader.
Answer using ONLY the business snapshot given. Be short (max 4 sentences), use ₦ amounts, and end with one practical suggestion.
You may reply in the same language or mix the trader used (English, Pidgin, Yorùbá, Hausa, Igbo).

BUSINESS SNAPSHOT:
${data.snapshot}`,
          },
          { role: "user", content: data.question },
        ],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Kòkọ is busy right now (${res.status}). ${detail.slice(0, 160)}`);
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { answer: json.choices?.[0]?.message?.content ?? "I couldn't work that out." };
  });
