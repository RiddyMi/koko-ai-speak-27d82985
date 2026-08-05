import { createFileRoute } from "@tanstack/react-router";
import { useKoko } from "@/lib/koko-store";
import { naira } from "@/lib/koko-data";

export const Route = createFileRoute("/stock")({
  head: () => ({
    meta: [
      { title: "Stock — Live inventory from your voice | Kòkọ AI" },
      {
        name: "description",
        content:
          "Kòkọ updates your stock every time you speak a sale or a purchase, and warns you before an item finishes.",
      },
      { property: "og:title", content: "Stock — Kòkọ AI" },
      { property: "og:description", content: "Voice-updated inventory with low-stock and restock advice." },
    ],
  }),
  component: Stock,
});

function Stock() {
  const { products, totals } = useKoko();
  const low = products.filter((p) => p.stock <= p.lowStockAt);

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Stock</h2>
        <p className="text-sm text-muted-foreground">
          {naira(totals.inventoryValue)} sitting on your shelves
        </p>
      </div>

      {low.length > 0 && (
        <div className="rounded-3xl bg-brand-amber p-5 text-brand-earth">
          <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">Low stock</p>
          <p className="mt-1 text-sm font-medium">
            {low.map((p) => p.name).join(", ")} {low.length === 1 ? "is" : "are"} running out. At your
            selling speed, restock within {Math.max(1, Math.round((low[0]!.stock / Math.max(1, low[0]!.soldPerWeek)) * 7))} days.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {products.map((p) => {
          const pct = Math.min(100, (p.stock / Math.max(p.lowStockAt * 3, 1)) * 100);
          const isLow = p.stock <= p.lowStockAt;
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase">
                    {p.stock} {p.unit}
                    {p.stock === 1 ? "" : "s"} left • sells ~{p.soldPerWeek}/week
                  </p>
                </div>
                <p className="text-sm font-bold">{naira(p.stock * p.unitPrice)}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full ${isLow ? "bg-brand-amber" : "bg-brand-green"}`}
                  style={{ width: `${Math.max(6, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
