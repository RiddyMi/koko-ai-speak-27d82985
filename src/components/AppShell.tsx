import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import avatar from "@/assets/avatar-mama-titi.jpg";
import { useKoko } from "@/lib/koko-store";
import { languages } from "@/lib/koko-data";
import { VoiceSheet } from "./VoiceSheet";

const navItems = [
  { to: "/", label: "Home", glyph: "▤" },
  { to: "/ledger", label: "Ledger", glyph: "≡" },
  { to: "/stock", label: "Stock", glyph: "▩" },
  { to: "/assistant", label: "AI", glyph: "✦" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useKoko();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background px-6 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt="Mama Titi"
            width={48}
            height={48}
            className="size-12 rounded-full object-cover outline-1 -outline-offset-1 outline-black/5"
          />
          <div>
            <p className="text-xs font-medium text-muted-foreground">E kàásán,</p>
            <h1 className="text-lg font-bold text-brand-green">Mama Titi</h1>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted"
            aria-label="Change language"
          >
            <span className="text-xs font-bold">{language} ▾</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLanguage(l.slice(0, 2).toUpperCase());
                    setLangOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left text-sm font-medium hover:bg-muted"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 space-y-6 px-6 pb-40">{children}</main>

      <nav className="fixed right-0 bottom-0 left-0 z-30 mx-auto flex max-w-md items-center justify-between border-t border-border bg-background/80 px-6 py-4 pb-8 backdrop-blur-xl">
        {navItems.slice(0, 2).map((item) => (
          <NavButton key={item.to} {...item} active={pathname === item.to} />
        ))}

        <div className="-mt-12 flex flex-col items-center gap-2">
          <button
            onClick={() => setVoiceOpen(true)}
            className="flex size-20 items-center justify-center rounded-full border-4 border-background bg-brand-amber text-brand-earth shadow-2xl transition-all hover:scale-105 active:scale-95"
            aria-label="Record a transaction by voice"
          >
            <div className="flex size-8 items-center justify-center rounded-full border-2 border-brand-earth">
              <div className="size-3 rounded-full bg-brand-earth" />
            </div>
          </button>
          <span className="text-[10px] font-bold tracking-widest text-brand-earth uppercase">
            Sọ rọ (Talk)
          </span>
        </div>

        {navItems.slice(2).map((item) => (
          <NavButton key={item.to} {...item} active={pathname === item.to} />
        ))}
      </nav>

      {voiceOpen && <VoiceSheet onClose={() => setVoiceOpen(false)} />}
    </div>
  );
}

function NavButton({
  to,
  label,
  glyph,
  active,
}: {
  to: string;
  label: string;
  glyph: string;
  active: boolean;
}) {
  return (
    <Link to={to} className="group flex flex-col items-center gap-1">
      <div
        className={`flex size-6 items-center justify-center rounded-md transition-transform group-hover:scale-110 ${
          active ? "bg-brand-green/10 text-brand-green" : "bg-muted text-muted-foreground"
        }`}
      >
        {glyph}
      </div>
      <span
        className={`text-[10px] font-bold ${active ? "text-brand-green" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </Link>
  );
}
