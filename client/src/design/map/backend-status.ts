/**
 * Maps backend API enums / gate decisions → Ledger Noir visual tones.
 * Keep names aligned with server Prisma enums + publish/claim gates.
 */

export type VisualTone =
  | "ink"
  | "muted"
  | "signal"
  | "warn"
  | "halt"
  | "skip";

export type ZoneRole =
  | "PUBLIC_VISITOR"
  | "GENERAL_CUSTOMER"
  | "ZEEMBLE_STUDENT"
  | "ADMIN";

export type ConsultationLifecycle =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export type OrderLifecycle =
  | "PENDING"
  | "PAID"
  | "FULFILLED"
  | "CANCELLED"
  | "REFUNDED";

export type GateDecision = "allow" | "skip" | "halt";

export const toneClass: Record<VisualTone, string> = {
  ink: "text-[var(--ln-ink)]",
  muted: "text-[var(--ln-muted)]",
  signal: "text-[var(--ln-signal)]",
  warn: "text-[var(--ln-warn)]",
  halt: "text-[var(--ln-halt)]",
  skip: "text-[var(--ln-skip)]",
};

export const toneBgClass: Record<VisualTone, string> = {
  ink: "bg-[var(--ln-plane)]",
  muted: "bg-[var(--ln-plane-hover)]",
  signal: "bg-[var(--ln-signal-dim)]",
  warn: "bg-[var(--ln-warn-dim)]",
  halt: "bg-[var(--ln-halt-dim)]",
  skip: "bg-transparent",
};

export const toneBorderClass: Record<VisualTone, string> = {
  ink: "border-[var(--ln-hairline)]",
  muted: "border-[var(--ln-hairline)]",
  signal: "border-[color-mix(in_srgb,var(--ln-signal)_45%,transparent)]",
  warn: "border-[color-mix(in_srgb,var(--ln-warn)_45%,transparent)]",
  halt: "border-[color-mix(in_srgb,var(--ln-halt)_45%,transparent)]",
  skip: "border-[var(--ln-hairline)]",
};

export function zoneTone(role: ZoneRole): VisualTone {
  switch (role) {
    case "PUBLIC_VISITOR":
      return "skip";
    case "GENERAL_CUSTOMER":
      return "muted";
    case "ZEEMBLE_STUDENT":
      return "signal";
    case "ADMIN":
      return "warn";
  }
}

export function consultationTone(status: ConsultationLifecycle): VisualTone {
  switch (status) {
    case "PENDING":
      return "warn";
    case "CONFIRMED":
      return "signal";
    case "COMPLETED":
      return "ink";
    case "CANCELLED":
      return "halt";
  }
}

export function orderTone(status: OrderLifecycle): VisualTone {
  switch (status) {
    case "PENDING":
      return "warn";
    case "PAID":
    case "FULFILLED":
      return "signal";
    case "CANCELLED":
    case "REFUNDED":
      return "halt";
  }
}

/** Publish / matric / enrollment style gates. */
export function gateTone(decision: GateDecision): VisualTone {
  switch (decision) {
    case "allow":
      return "signal";
    case "skip":
      return "skip";
    case "halt":
      return "halt";
  }
}

export function publishGate(isPublished: boolean): GateDecision {
  return isPublished ? "allow" : "skip";
}

export function matricGate(claimed: boolean): GateDecision {
  return claimed ? "allow" : "skip";
}
