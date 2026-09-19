"use client";

import { useEffect, useId, useRef, useState, type ReactElement } from "react";
import { cn } from "@/lib/utils";
import {
  THEME_DEFAULT,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/design/theme-storage";

function resolveDark(pref: ThemePreference): boolean {
  if (pref === "dark") return true;
  if (pref === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(pref: ThemePreference) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolveDark(pref));
  root.dataset.theme = pref;
}

const OPTIONS: {
  id: ThemePreference;
  label: string;
  Icon: (p: { className?: string }) => ReactElement;
}[] = [
  { id: "light", label: "Light", Icon: IconSun },
  { id: "dark", label: "Dark", Icon: IconMoon },
  { id: "system", label: "System", Icon: IconSystem },
];

function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M12.5 9.2A5.2 5.2 0 0 1 6.8 3.5 5.5 5.5 0 1 0 12.5 9.2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSystem({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="3"
        width="12"
        height="8.5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M6 14h4M8 11.5V14"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Subtle icon theme control — opens a menu: light / dark / system.
 * Default preference: light.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [pref, setPref] = useState<ThemePreference>(THEME_DEFAULT);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initial: ThemePreference =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : THEME_DEFAULT;
    setPref(initial);
    applyTheme(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function select(next: ThemePreference) {
    setPref(next);
    applyTheme(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    setOpen(false);
  }

  const ActiveIcon =
    pref === "dark" ? IconMoon : pref === "system" ? IconSystem : IconSun;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!ready}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-sm text-[var(--ln-muted)] transition-colors hover:text-[var(--ln-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ln-signal)]/40 disabled:opacity-40",
          className,
        )}
        aria-label="Theme"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title="Theme"
      >
        <ActiveIcon className="size-3.5" />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Theme"
          className="absolute right-0 top-[calc(100%+0.4rem)] z-50 min-w-[8.5rem] border border-[var(--ln-hairline)] bg-[var(--ln-canvas)] py-1 shadow-[var(--ln-shadow-soft,0_8px_24px_rgba(0,0,0,0.08))]"
        >
          {OPTIONS.map(({ id, label, Icon }) => {
            const active = pref === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => select(id)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "text-[var(--ln-signal)]"
                    : "text-[var(--ln-muted)] hover:bg-[var(--ln-plane-hover)] hover:text-[var(--ln-ink)]",
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="font-display tracking-tight">{label}</span>
                {active ? (
                  <span
                    className="ml-auto size-1 rounded-full bg-[var(--ln-signal)]"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
