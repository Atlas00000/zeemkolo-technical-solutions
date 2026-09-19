export type CtaStepId = "slot" | "brief" | "invite";

export type CtaStep = {
  id: CtaStepId;
  index: string;
  label: string;
  detail: string;
};

export const CTA_STEPS: CtaStep[] = [
  {
    id: "slot",
    index: "01",
    label: "Pick a slot",
    detail:
      "Choose an open window on the engineering calendar. Sessions are time-boxed so the brief and follow-up stay actionable.",
  },
  {
    id: "brief",
    index: "02",
    label: "Share your brief",
    detail:
      "Scope, constraints, schematics or logs, and the decision you need unblocked — the same intake fields used in the booking wizard.",
  },
  {
    id: "invite",
    index: "03",
    label: "Receive the invite",
    detail:
      "Confirm the engagement and get a calendar hold with next steps. Ideal before a PCB spin, bring-up week, or architecture review.",
  },
];

export const CTA_COPY = {
  eyebrow: "Next step",
  title: "Book an engineering consultation",
  body: "When the next board spin, firmware bring-up, or product architecture call cannot wait for guesswork, book a scoped Zeemkolo session. You pick a slot, share the brief, and receive a calendar invite — the same path the consultation desk uses in-app.",
  bodySecondary:
    "Best fit for firmware reviews, prototype risk checks, power and timing questions, and system integration decisions that need a written risk list you can act on the same week.",
  primary: "Open booking",
  primaryHref: "/consultation",
  mono: "CONSULT · LIVE",
} as const;
