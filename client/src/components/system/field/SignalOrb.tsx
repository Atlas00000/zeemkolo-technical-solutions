"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";
import "./system-field.css";

type Spark = { id: number; x: number; y: number };

type SignalOrbProps = {
  mode?: "loading" | "lost";
  className?: string;
  /** Soft magnetic follow toward pointer */
  magnetic?: boolean;
};

/**
 * Interactive signal nucleus — orbit rings, pulse, pointer magnetism, spark burst.
 */
export function SignalOrb({
  mode = "loading",
  className,
  magnetic = true,
}: SignalOrbProps) {
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [reduced, setReduced] = useState(false);
  const sparkSeq = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!magnetic || reduced) return;

    function onMove(event: PointerEvent) {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (event.clientX - cx) * 0.08;
      const dy = (event.clientY - cy) * 0.08;
      setOffset({
        x: Math.max(-28, Math.min(28, dx)),
        y: Math.max(-22, Math.min(22, dy)),
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [magnetic, reduced]);

  const burst = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (reduced) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const originX = event.clientX - rect.left - rect.width / 2;
      const originY = event.clientY - rect.top - rect.height / 2;
      const batch: Spark[] = Array.from({ length: 7 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.4;
        const dist = 48 + Math.random() * 56;
        sparkSeq.current += 1;
        return {
          id: sparkSeq.current,
          x: originX + Math.cos(angle) * dist,
          y: originY + Math.sin(angle) * dist,
        };
      });
      setSparks((prev) => [...prev.slice(-12), ...batch]);
      window.setTimeout(() => {
        setSparks((prev) => prev.filter((s) => !batch.some((b) => b.id === s.id)));
      }, 950);
    },
    [reduced],
  );

  const lost = mode === "lost";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex h-[min(52vw,18rem)] w-[min(52vw,18rem)] items-center justify-center",
        className,
      )}
    >
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
      >
        <div
          className="sys-pulse-ring absolute inset-[8%] rounded-full border border-[var(--ln-signal)]"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="sys-pulse-ring absolute inset-[8%] rounded-full border border-[var(--ln-mark)]"
          style={{ animationDelay: "0.8s" }}
        />

        <svg
          className="sys-orbit absolute inset-0 h-full w-full"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <ellipse
            cx="100"
            cy="100"
            rx="88"
            ry="54"
            fill="none"
            stroke="var(--ln-signal)"
            strokeWidth="0.7"
            strokeDasharray="4 7"
            opacity="0.55"
            transform="rotate(-18 100 100)"
          />
        </svg>
        <svg
          className="sys-orbit-rev absolute inset-0 h-full w-full"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <ellipse
            cx="100"
            cy="100"
            rx="62"
            ry="86"
            fill="none"
            stroke="var(--ln-mark)"
            strokeWidth="0.7"
            strokeDasharray="2 9"
            opacity="0.4"
            transform="rotate(28 100 100)"
          />
        </svg>

        <button
          type="button"
          onPointerDown={burst}
          aria-label={lost ? "Probe lost signal" : "Signal core"}
          className={cn(
            "absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none",
            "shadow-[0_0_60px_color-mix(in_srgb,var(--ln-signal)_45%,transparent)]",
            "transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--ln-signal)]",
            lost && "shadow-[0_0_60px_color-mix(in_srgb,var(--ln-mark)_40%,transparent)]",
          )}
          style={{
            background: lost
              ? `radial-gradient(circle at 35% 30%,
                  color-mix(in srgb, var(--ln-mark) 90%, white),
                  var(--ln-mark) 45%,
                  color-mix(in srgb, var(--ln-signal) 55%, var(--ln-mark)) 100%)`
              : `radial-gradient(circle at 35% 30%,
                  color-mix(in srgb, var(--ln-signal) 70%, white),
                  var(--ln-signal) 48%,
                  color-mix(in srgb, var(--ln-mark) 35%, var(--ln-signal)) 100%)`,
          }}
        />

        {sparks.map((spark) => (
          <span
            key={`${uid}-${spark.id}`}
            className="sys-spark absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ln-signal)]"
            style={
              {
                "--sys-spark-x": `${spark.x}px`,
                "--sys-spark-y": `${spark.y}px`,
                background:
                  spark.id % 2 === 0
                    ? "var(--ln-signal)"
                    : "var(--ln-mark)",
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
