import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { WavRecorder } from "@/lib/wav-recorder";
import { transcribeAudio, parseTransaction, type ParsedEntry } from "@/lib/koko.functions";
import { useKoko } from "@/lib/koko-store";
import { naira } from "@/lib/koko-data";

const examples = [
  "Mo sell biscuits for five thousand",
  "Bought drinks for ten thousand",
  "Mary collected rice on credit",
  "Paid transport five hundred",
];

type Stage = "idle" | "listening" | "thinking" | "review";

export function VoiceSheet({ onClose }: { onClose: () => void }) {
  const { addTransaction } = useKoko();
  const transcribe = useServerFn(transcribeAudio);
  const parse = useServerFn(parseTransaction);
  const recorder = useRef<WavRecorder | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [level, setLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [entry, setEntry] = useState<ParsedEntry | null>(null);

  useEffect(() => {
    void startListening();
    return () => {
      void recorder.current?.stop().catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startListening() {
    try {
      const rec = new WavRecorder();
      await rec.start(setLevel);
      recorder.current = rec;
      setStage("listening");
    } catch {
      setStage("idle");
      toast.error("Microphone not available — tap an example below instead.");
    }
  }

  async function finish() {
    const rec = recorder.current;
    if (!rec) return;
    recorder.current = null;
    setStage("thinking");
    try {
      const audioBase64 = await rec.stop();
      const { text } = await transcribe({ data: { audioBase64 } });
      setTranscript(text);
      const parsed = await parse({ data: { text } });
      setEntry(parsed);
      setStage("review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setStage("idle");
    }
  }

  async function useExample(text: string) {
    void recorder.current?.stop().catch(() => undefined);
    recorder.current = null;
    setTranscript(text);
    setStage("thinking");
    try {
      const parsed = await parse({ data: { text } });
      setEntry(parsed);
      setStage("review");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setStage("idle");
    }
  }

  function confirm() {
    if (!entry) return;
    addTransaction({
      type: entry.type,
      title: entry.note,
      product: entry.product ?? undefined,
      customer: entry.customer ?? undefined,
      quantity: entry.quantity ?? undefined,
      amount: entry.amount,
      category: entry.category ?? undefined,
      method: entry.method,
      language: "English",
      at: new Date().toISOString(),
    });
    toast.success("Saved to your books");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-green/95 p-8 text-primary-foreground">
      {stage !== "review" && (
        <>
          <p className="mb-12 text-center text-2xl font-bold">
            {transcript
              ? `"${transcript}"`
              : stage === "thinking"
                ? "Kòkọ is thinking…"
                : stage === "listening"
                  ? "I'm listening… speak your sale"
                  : "Tap an example to try Kòkọ"}
          </p>

          <div className="flex h-12 items-end gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-background transition-all duration-150"
                style={{
                  height:
                    stage === "listening"
                      ? `${12 + Math.abs(Math.sin(i * 1.3)) * 36 * (0.3 + level)}px`
                      : stage === "thinking"
                        ? "16px"
                        : "8px",
                  opacity: stage === "listening" ? 1 : 0.5,
                }}
              />
            ))}
          </div>

          {stage === "listening" ? (
            <button
              onClick={finish}
              className="mt-16 rounded-full bg-brand-amber px-10 py-4 text-base font-bold text-brand-earth shadow-2xl active:scale-95"
            >
              Done talking
            </button>
          ) : (
            <div className="mt-12 flex w-full max-w-xs flex-col gap-2">
              {examples.map((e) => (
                <button
                  key={e}
                  disabled={stage === "thinking"}
                  onClick={() => useExample(e)}
                  className="rounded-2xl border border-background/20 bg-background/10 px-4 py-3 text-sm font-medium disabled:opacity-40"
                >
                  “{e}”
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-12 flex size-16 items-center justify-center rounded-full border-2 border-background"
            aria-label="Close voice recording"
          >
            <span className="text-2xl">✕</span>
          </button>
        </>
      )}

      {stage === "review" && entry && (
        <div className="w-full max-w-sm">
          <p className="mb-6 text-center text-lg italic opacity-90">“{transcript}”</p>
          <div className="rounded-3xl bg-background p-6 text-foreground">
            <div className="mb-4 flex items-start justify-between">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Parsed entry
              </p>
              <span className="rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-bold text-primary-foreground uppercase">
                {entry.type}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-y-4">
              <Field label="Amount" value={naira(entry.amount)} strong />
              <Field label="Item" value={entry.product ?? "—"} />
              <Field label="Customer" value={entry.customer ?? "Walk-in"} />
              <Field label="Method" value={entry.method} />
            </div>
          </div>
          <button
            onClick={confirm}
            className="mt-6 h-16 w-full rounded-2xl bg-brand-amber text-lg font-bold text-brand-earth shadow-xl active:scale-[0.98]"
          >
            Confirm entry
          </button>
          <button
            onClick={() => {
              setEntry(null);
              setTranscript("");
              void startListening();
            }}
            className="mt-4 w-full py-2 text-sm font-medium opacity-70"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className={strong ? "text-xl font-bold text-brand-green" : "text-base font-medium"}>
        {value}
      </p>
    </div>
  );
}
