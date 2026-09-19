export type SpotlightGateId =
  | "preview"
  | "library"
  | "forum"
  | "downloads";

export type SpotlightGate = {
  id: SpotlightGateId;
  index: string;
  label: string;
  detail: string;
  /** Requires claimed matric */
  locked: boolean;
};

export const SPOTLIGHT_GATES: SpotlightGate[] = [
  {
    id: "preview",
    index: "01",
    label: "Module 1 preview",
    detail:
      "Open to guests — start the first lab path without a claim, so you can judge the curriculum before you enroll.",
    locked: false,
  },
  {
    id: "library",
    index: "02",
    label: "Full course library",
    detail:
      "Lessons, code, and schematics past Module 1 — the full Zeemble path for verified matric holders.",
    locked: true,
  },
  {
    id: "forum",
    index: "03",
    label: "Forum writes",
    detail:
      "Post and reply as a verified Zeemble student. Reads stay open; writes require a claimed matric.",
    locked: true,
  },
  {
    id: "downloads",
    index: "04",
    label: "Kit downloads",
    detail:
      "Lab files, reference assets, and kit materials gated by matric so distribution stays tied to enrollment.",
    locked: true,
  },
];

/** Demo readout only — not a real assigned matric. */
export const SPOTLIGHT_MATRIC_DEMO = "ZMB-2026-042";

export const SPOTLIGHT_COPY = {
  eyebrow: "Zeemble Program",
  title: "Learn embedded systems the way the lab teaches it",
  body: "Zeemble is the learning side of Zeemkolo: lesson notes, firmware labs, schematics, and progress tracking for engineers who learn by building — not by watching another slide deck.",
  bodySecondary:
    "Guests can preview Module 1. A matric number, assigned at signup and claimable in your account, unlocks the full library, forum writes, and kit downloads without inventing a second password store.",
  matricNote:
    "Each student receives a matric in the ZMB-YYYY-NNN pattern at signup. It is the access key for lessons, forum identity, and downloads — the same gate language the product app uses for student zone enrollment.",
} as const;
