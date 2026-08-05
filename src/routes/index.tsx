import { createFileRoute, Link } from "@tanstack/react-router";
import { useKoko } from "@/lib/koko-store";
import { naira, timeLabel, type Transaction } from "@/lib/koko-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kòkọ AI — Voice Bookkeeping for African Traders" },
      {
        name: "description",
        content:
          "Record sales, expenses, stock and credit by speaking English, Pidgin, Yorùbá, Hausa or Igbo. Kòkọ AI keeps your books for you.",
      },
      { property: "og:title", content: "Kòkọ AI — Voice Bookkeeping for African Traders" },
      {
        property: "og:description",
        content: "Speak your sales. Kòkọ AI turns everyday market talk into clean business records.",
      },
    ],
  }),
  component: Dashboard,
});

export function typeStyle(type: Transaction["type"]) {
  switch (type) {
    case "sale":
      return { icon: "↙", chip: "bg-emerald-100 text-emerald-700", amount: "text-foreground", sign: "+" };
    case "repayment":
      return { icon: "✓", chip: "bg-emerald-100 text-emerald-700", amount: "text-foreground", sign: "+" };
    case "credit":
      return { icon: "⏱", chip: "bg-amber-100 text-amber-700", amount: "text-amber-700", sign: "" };
    case "restock":
      return { icon: "▩", chip: "bg-stone-200 text-stone-700", amount: "text-rose-700", sign: "-" };
    default:
      return { icon: "↗", chip: "bg-rose-100 text-rose-700", amount: "text-rose-700", sign: "-" };
  }
}

function Dashboard() {
  const { totals, transactions, products } = useKoko();
  const lowStock = products.filter((p) => p.stock <= p.lowStockAt);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-brand-green p-4 text-primary-foreground shadow-xl shadow-brand-green/10">
          <p className="mb-1 text-[10px] tracking-wider uppercase opacity-80">Total Sales</p>
          <p className="text-xl font-bold">{naira(totals.todaySales)}</p>
          <div className="mt-3 inline-flex items-center rounded-full bg-background/10 px-2 py-1 text-[10px]">
            Today
          </div>
        </div>
        <Link
          to="/credit"
          className="rounded-3xl bg-brand-amber p-4 text-brand-earth shadow-xl shadow-brand-amber/10"
        >
          <p className="mb-1 text-[10px] tracking-wider uppercase opacity-80">Credit (Owó)</p>
          <p className="text-xl font-bold">{naira(totals.creditOutstanding)}</p>
          <div className="mt-3 inline-flex items-center rounded-full bg-black/5 px-2 py-1 text-[10px] font-semibold">
            {totals.creditPeople} People
          </div>
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-stone-900 p-5 text-stone-100">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-brand-amber" />
            <p className="text-[10px] font-bold tracking-widest text-brand-amber uppercase">
              Kòkọ AI Insight
            </p>
          </div>
          <p className="text-sm leading-relaxed">
            {lowStock.length > 0
              ? `"Mama Titi, ${lowStock[0]!.name} is down to ${lowStock[0]!.stock} ${lowStock[0]!.unit}${lowStock[0]!.stock === 1 ? "" : "s"} but you sell about ${lowStock[0]!.soldPerWeek} every week. Restock before Saturday market."`
              : `"Mama Titi, your profit today is ${naira(totals.profit)}. Keep recording every sale and I go show you the full picture by evening."`}
          </p>
          <Link
            to="/assistant"
            className="mt-4 inline-block rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold transition-colors hover:bg-white/20"
          >
            Show me the math →
          </Link>
        </div>
        <div className="absolute -right-4 -bottom-4 size-24 rounded-full bg-brand-amber/10 blur-2xl" />
      </section>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Expenses" value={naira(totals.todayExpenses)} />
        <MiniStat label="Profit" value={naira(totals.profit)} accent />
        <MiniStat label="Stock value" value={naira(totals.inventoryValue)} />
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold">Recent Records</h2>
          <Link to="/ledger" className="text-xs font-bold text-brand-green">
            See All
          </Link>
        </div>

        <div className="space-y-3">
          {transactions.slice(0, 4).map((t) => {
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
                    {timeLabel(t.at)} • {t.language} Voice
                  </p>
                </div>
                <p className={`text-sm font-bold ${s.amount}`}>
                  {s.sign}
                  {naira(t.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/50 p-3">
      <p className="text-[9px] font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={`mt-1 text-sm font-bold ${accent ? "text-brand-green" : ""}`}>{value}</p>
    </div>
  );
}
