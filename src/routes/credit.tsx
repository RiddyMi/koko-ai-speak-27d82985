import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useKoko } from "@/lib/koko-store";
import { naira, timeLabel } from "@/lib/koko-data";

export const Route = createFileRoute("/credit")({
  head: () => ({
    meta: [
      { title: "Credit book — Know who owes you | Kòkọ AI" },
      {
        name: "description",
        content:
          "Track every customer buying on credit, record repayments by voice and send friendly reminders.",
      },
      { property: "og:title", content: "Credit book — Kòkọ AI" },
      { property: "og:description", content: "Outstanding balances, repayments and reminders for your customers." },
    ],
  }),
  component: Credit,
});

function Credit() {
  const { credit, totals, recordRepayment } = useKoko();

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Credit book</h2>
        <p className="text-sm text-muted-foreground">
          {naira(totals.creditOutstanding)} owed by {totals.creditPeople} customers
        </p>
      </div>

      <div className="space-y-3">
        {credit.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold">{c.customer}</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase">
                  {c.items} • {timeLabel(c.lastActivity)} • {c.phone}
                </p>
              </div>
              <p className={`text-base font-bold ${c.balance > 0 ? "text-amber-700" : "text-brand-green"}`}>
                {naira(c.balance)}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  if (c.balance <= 0) return;
                  recordRepayment(c.customer, c.balance);
                  toast.success(`${c.customer} cleared ${naira(c.balance)}`);
                }}
                className="h-12 flex-1 rounded-xl bg-brand-green text-sm font-bold text-primary-foreground active:scale-[0.98]"
              >
                Mark paid
              </button>
              <button
                onClick={() => toast(`Reminder sent to ${c.customer}`)}
                className="h-12 flex-1 rounded-xl border border-border bg-background text-sm font-bold active:scale-[0.98]"
              >
                Send reminder
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
