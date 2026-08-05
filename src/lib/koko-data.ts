export type TxType = "sale" | "expense" | "credit" | "repayment" | "restock";

export interface Transaction {
  id: string;
  type: TxType;
  title: string;
  product?: string;
  customer?: string;
  quantity?: number;
  amount: number;
  category?: string;
  method: "Cash" | "Transfer" | "POS" | "Credit";
  language: "English" | "Pidgin" | "Yoruba" | "Hausa" | "Igbo";
  at: string; // ISO
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  stock: number;
  lowStockAt: number;
  unitPrice: number;
  soldPerWeek: number;
}

export interface CreditAccount {
  id: string;
  customer: string;
  phone: string;
  balance: number;
  lastActivity: string;
  items: string;
}

const now = new Date();
const iso = (dayOffset: number, hour: number, minute = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() - dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const seedTransactions: Transaction[] = [
  {
    id: "t1",
    type: "sale",
    title: "Sold: 2 Big Loaves Bread",
    product: "Bread",
    quantity: 2,
    amount: 2400,
    method: "Cash",
    language: "English",
    at: iso(0, 10, 15),
  },
  {
    id: "t2",
    type: "credit",
    title: "Musa: 5 Indomie (Credit)",
    product: "Indomie",
    customer: "Musa Bello",
    quantity: 5,
    amount: 1500,
    method: "Credit",
    language: "Pidgin",
    at: iso(0, 9, 42),
  },
  {
    id: "t3",
    type: "expense",
    title: "Expense: Transport (Stock)",
    category: "Transport",
    amount: 1200,
    method: "Cash",
    language: "Yoruba",
    at: iso(1, 17, 5),
  },
  {
    id: "t4",
    type: "sale",
    title: "Sold: 3 Bags of Rice",
    product: "Rice",
    quantity: 3,
    amount: 18500,
    method: "Transfer",
    language: "Igbo",
    at: iso(0, 8, 20),
  },
  {
    id: "t5",
    type: "sale",
    title: "Sold: 6 Cartons Malt",
    product: "Malt",
    quantity: 6,
    amount: 12600,
    method: "POS",
    language: "English",
    at: iso(0, 12, 40),
  },
  {
    id: "t6",
    type: "sale",
    title: "Sold: Gaari (4 paint)",
    product: "Gaari",
    quantity: 4,
    amount: 9000,
    method: "Cash",
    language: "Yoruba",
    at: iso(0, 14, 12),
  },
  {
    id: "t7",
    type: "expense",
    title: "Expense: Shop rent (weekly)",
    category: "Rent",
    amount: 7000,
    method: "Transfer",
    language: "English",
    at: iso(2, 9, 0),
  },
  {
    id: "t8",
    type: "restock",
    title: "Bought: 10 cartons Indomie",
    product: "Indomie",
    quantity: 10,
    amount: 42000,
    category: "Inventory",
    method: "Cash",
    language: "Hausa",
    at: iso(2, 7, 30),
  },
  {
    id: "t9",
    type: "repayment",
    title: "Ngozi paid part of her debt",
    customer: "Ngozi Eze",
    amount: 3000,
    method: "Transfer",
    language: "Igbo",
    at: iso(1, 11, 25),
  },
  {
    id: "t10",
    type: "expense",
    title: "Expense: Generator fuel",
    category: "Utilities",
    amount: 4500,
    method: "Cash",
    language: "Pidgin",
    at: iso(3, 16, 45),
  },
];

export const seedProducts: Product[] = [
  { id: "p1", name: "Rice (50kg)", unit: "bag", stock: 6, lowStockAt: 5, unitPrice: 62000, soldPerWeek: 4 },
  { id: "p2", name: "Indomie", unit: "carton", stock: 3, lowStockAt: 4, unitPrice: 4500, soldPerWeek: 9 },
  { id: "p3", name: "Bread", unit: "loaf", stock: 14, lowStockAt: 6, unitPrice: 1200, soldPerWeek: 40 },
  { id: "p4", name: "Gaari", unit: "paint", stock: 22, lowStockAt: 8, unitPrice: 2250, soldPerWeek: 25 },
  { id: "p5", name: "Malt", unit: "carton", stock: 2, lowStockAt: 3, unitPrice: 2100, soldPerWeek: 12 },
  { id: "p6", name: "Groundnut oil", unit: "keg", stock: 9, lowStockAt: 3, unitPrice: 18000, soldPerWeek: 3 },
];

export const seedCredit: CreditAccount[] = [
  { id: "c1", customer: "Musa Bello", phone: "0803 442 1180", balance: 4700, lastActivity: iso(0, 9, 42), items: "Indomie, Milk" },
  { id: "c2", customer: "Ngozi Eze", phone: "0812 907 5521", balance: 3500, lastActivity: iso(1, 11, 25), items: "Rice, Oil" },
  { id: "c3", customer: "Mrs Adé", phone: "0705 118 3390", balance: 2600, lastActivity: iso(3, 15, 0), items: "Gaari" },
  { id: "c4", customer: "Chidi (Barber)", phone: "0902 330 7712", balance: 1400, lastActivity: iso(5, 10, 30), items: "Malt, Bread" },
];

export const languages = ["English", "Pidgin", "Yorùbá", "Hausa", "Igbo"] as const;

export const weeklySales = [
  { day: "Mon", sales: 28400, expenses: 9200 },
  { day: "Tue", sales: 34100, expenses: 6100 },
  { day: "Wed", sales: 21800, expenses: 12400 },
  { day: "Thu", sales: 39600, expenses: 7800 },
  { day: "Fri", sales: 47250, expenses: 10300 },
  { day: "Sat", sales: 58900, expenses: 14100 },
  { day: "Sun", sales: 42500, expenses: 5200 },
];

export const topProducts = [
  { name: "Rice", value: 186000 },
  { name: "Indomie", value: 94500 },
  { name: "Gaari", value: 72000 },
  { name: "Bread", value: 48000 },
  { name: "Malt", value: 31500 },
];

export const naira = (n: number) =>
  "₦" + Math.round(n).toLocaleString("en-NG");

export const timeLabel = (isoStr: string) => {
  const d = new Date(isoStr);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
  if (sameDay) return time;
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
};
