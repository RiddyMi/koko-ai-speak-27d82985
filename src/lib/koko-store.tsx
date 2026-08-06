import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  seedTransactions,
  seedProducts,
  seedCredit,
  type Transaction,
  type Product,
  type CreditAccount,
} from "./koko-data";

interface KokoState {
  transactions: Transaction[];
  products: Product[];
  credit: CreditAccount[];
  language: string;
  setLanguage: (l: string) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  recordRepayment: (customer: string, amount: number) => void;
  totals: {
    todaySales: number;
    todayExpenses: number;
    profit: number;
    creditOutstanding: number;
    creditPeople: number;
    inventoryValue: number;
    txCount: number;
  };
  snapshot: string;
}

const Ctx = createContext<KokoState | null>(null);

export function KokoProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [credit, setCredit] = useState<CreditAccount[]>(seedCredit);
  const [language, setLanguage] = useState("EN");
  // Date-dependent totals must not run during SSR/prerender: the build date
  // differs from the visitor's date, which caused a hydration mismatch.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const value = useMemo<KokoState>(() => {
    const isToday = (t: Transaction) =>
      hydrated && new Date(t.at).toDateString() === new Date().toDateString();
    const todaySales = transactions
      .filter((t) => isToday(t) && (t.type === "sale" || t.type === "repayment"))
      .reduce((n, t) => n + t.amount, 0);
    const todayExpenses = transactions
      .filter((t) => isToday(t) && (t.type === "expense" || t.type === "restock"))
      .reduce((n, t) => n + t.amount, 0);
    const creditOutstanding = credit.reduce((n, c) => n + c.balance, 0);
    const inventoryValue = products.reduce((n, p) => n + p.stock * p.unitPrice, 0);

    const totals = {
      todaySales,
      todayExpenses,
      profit: todaySales - todayExpenses,
      creditOutstanding,
      creditPeople: credit.filter((c) => c.balance > 0).length,
      inventoryValue,
      txCount: transactions.length,
    };

    const snapshot = [
      `Today's sales: ₦${todaySales}`,
      `Today's expenses: ₦${todayExpenses}`,
      `Profit today: ₦${totals.profit}`,
      `Inventory value: ₦${inventoryValue}`,
      `Outstanding credit: ₦${creditOutstanding} across ${totals.creditPeople} customers`,
      `Debtors: ${credit.map((c) => `${c.customer} ₦${c.balance}`).join("; ")}`,
      `Stock: ${products.map((p) => `${p.name} ${p.stock} ${p.unit}(s), sells ~${p.soldPerWeek}/week`).join("; ")}`,
      `Recent transactions: ${transactions
        .slice(0, 10)
        .map((t) => `${t.type} ${t.title} ₦${t.amount}`)
        .join("; ")}`,
    ].join("\n");

    return {
      transactions,
      products,
      credit,
      language,
      setLanguage,
      totals,
      snapshot,
      addTransaction: (t) => {
        setTransactions((prev) => [{ ...t, id: crypto.randomUUID() }, ...prev]);
        if (t.product) {
          setProducts((prev) =>
            prev.map((p) =>
              p.name.toLowerCase().includes(t.product!.toLowerCase()) ||
              t.product!.toLowerCase().includes(p.name.split(" ")[0]!.toLowerCase())
                ? {
                    ...p,
                    stock: Math.max(
                      0,
                      p.stock + (t.type === "restock" ? (t.quantity ?? 1) : -(t.quantity ?? 1)),
                    ),
                  }
                : p,
            ),
          );
        }
        if (t.type === "credit" && t.customer) {
          setCredit((prev) => {
            const existing = prev.find(
              (c) => c.customer.toLowerCase() === t.customer!.toLowerCase(),
            );
            if (existing) {
              return prev.map((c) =>
                c.id === existing.id
                  ? { ...c, balance: c.balance + t.amount, lastActivity: t.at }
                  : c,
              );
            }
            return [
              {
                id: crypto.randomUUID(),
                customer: t.customer!,
                phone: "—",
                balance: t.amount,
                lastActivity: t.at,
                items: t.product ?? "Goods",
              },
              ...prev,
            ];
          });
        }
      },
      removeTransaction: (id) => setTransactions((prev) => prev.filter((t) => t.id !== id)),
      recordRepayment: (customer, amount) => {
        setCredit((prev) =>
          prev.map((c) =>
            c.customer === customer
              ? { ...c, balance: Math.max(0, c.balance - amount), lastActivity: new Date().toISOString() }
              : c,
          ),
        );
        setTransactions((prev) => [
          {
            id: crypto.randomUUID(),
            type: "repayment",
            title: `${customer} paid back`,
            customer,
            amount,
            method: "Cash",
            language: "English",
            at: new Date().toISOString(),
          },
          ...prev,
        ]);
      },
    };
  }, [transactions, products, credit, language]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useKoko() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useKoko must be used inside KokoProvider");
  return ctx;
}
