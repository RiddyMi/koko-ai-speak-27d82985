import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useKoko } from "@/lib/koko-store";
import { naira, timeLabel, type TxType } from "@/lib/koko-data";
import { typeStyle } from "./index";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [
      { title: "Ledger — Every sale, expense and credit | Kòkọ AI" },
      {
        name: "description",
        content:
          "Search and filter every transaction Kòkọ recorded from your voice — by product, customer, type or date.",
      },
      { property: "og:title", content: "Ledger — Kòkọ AI" },
      { property: "og:description", content: "Your full voice-recorded business ledger, searchable and exportable." },
    ],
  }),
  component: Ledger,
});

const filters: { key: TxType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sale", label: "Sales" },
  { key: "expense", label: "Expenses" },
  { key: "credit", label: "Credit" },
  { key: "restock", label: "Stock" },
];

function Ledger() {
  const { transactions, removeTransaction } = useKoko();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TxType | "all">("all");

  const rows = useMemo(
    () =>
      transactions.filter((t) => {
        const matchesFilter = filter === "all" || t.type === filter;
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          [t.title, t.product, t.customer, t.category, t.method].some((v) =>
            v?.toLowerCase().includes(q),
          );
        return matchesFilter && matchesQuery;
      }),
    [transactions, filter, query],
  );

  function exportCsv() {
    const header = "date,type,title,product,customer,quantity,amount,method,language";
    const body = rows
      .map((t) =>
        [t.at, t.type, `"${t.title}"`, t.product ?? "", t.customer ?? "", t.quantity ?? "", t.amount, t.method, t.language].join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([`${header}\n${body}`], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "koko-ledger.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">Ledger</h2>
        <button onClick={exportCsv} className="text-xs font-bold text-brand-green">
          Export CSV
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search rice, Musa, transport…"
        className="h-14 w-full rounded-2xl border border-border bg-muted/50 px-5 text-base outline-none focus:border-brand-green"
      />

      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
              filter === f.key
                ? "bg-brand-green text-primary-foreground"
                : "border border-border bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((t) => {
          const s = typeStyle(t.type);
          return (
            <div
              key={t.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-muted/50 p-4"
            >
              <div className={`flex size-10 items-center justify-center rounded-full ${s.chip}`}>
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{t.title}</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase">
                  {timeLabel(t.at)} • {t.method} • {t.language}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${s.amount}`}>
                  {s.sign}
                  {naira(t.amount)}
                </p>
                <button
                  onClick={() => removeTransaction(t.id)}
                  className="text-[10px] font-bold text-muted-foreground uppercase"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nothing here yet — tap the mic and talk.
          </p>
        )}
      </div>
    </>
  );
}
