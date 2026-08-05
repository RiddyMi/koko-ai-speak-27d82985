import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { askAssistant } from "@/lib/koko.functions";
import { useKoko } from "@/lib/koko-store";
import { weeklySales, topProducts, naira } from "@/lib/koko-data";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Ask Kòkọ — Your AI business advisor | Kòkọ AI" },
      {
        name: "description",
        content:
          "Ask how much you sold today, who owes you money or whether to restock — in English, Pidgin, Yorùbá, Hausa or Igbo.",
      },
      { property: "og:title", content: "Ask Kòkọ — Kòkọ AI" },
      { property: "og:description", content: "Conversational business answers backed by your own records." },
    ],
  }),
  component: Assistant,
});

const prompts = [
  "How much did I sell today?",
  "Who owes me money?",
  "Should I restock Indomie?",
  "Which product sells the most?",
];

function Assistant() {
  const { snapshot, totals } = useKoko();
  const ask = useServerFn(askAssistant);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Ẹ kú iṣẹ́, Mama Titi. Ask me anything about your business — I dey read your books.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(question: string) {
    if (!question.trim() || busy) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    try {
      const { answer } = await ask({ data: { question, snapshot } });
      setMessages((m) => [...m, { role: "ai", text: answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: err instanceof Error ? err.message : "Something went wrong." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Ask Kòkọ</h2>
        <p className="text-sm text-muted-foreground">
          Profit today {naira(totals.profit)} • {totals.txCount} records
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-muted/50 p-4">
        <p className="mb-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          This week
        </p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={10} />
              <Tooltip
                formatter={(v: number) => naira(v)}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="var(--brand-green)" />
              <Bar dataKey="expenses" radius={[6, 6, 0, 0]} fill="var(--brand-amber)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {topProducts.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-[11px] font-bold">{p.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-brand-green"
                  style={{ width: `${(p.value / topProducts[0]!.value) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{naira(p.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-brand-green text-primary-foreground"
                : "border border-border bg-stone-900 text-stone-100"
            }`}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="max-w-[85%] rounded-3xl border border-border bg-stone-900 p-4 text-sm text-stone-400">
            Kòkọ dey think…
          </div>
        )}
      </div>

      <div className="-mx-6 flex gap-2 overflow-x-auto px-6">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="shrink-0 rounded-full border border-border bg-muted px-4 py-2 text-xs font-bold"
          >
            {p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your business…"
          className="h-14 flex-1 rounded-2xl border border-border bg-muted/50 px-5 text-base outline-none focus:border-brand-green"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-14 rounded-2xl bg-brand-amber px-6 text-sm font-bold text-brand-earth disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </>
  );
}
