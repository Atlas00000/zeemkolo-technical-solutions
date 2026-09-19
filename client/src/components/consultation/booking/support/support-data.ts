export type FitId = "firmware" | "prototype" | "architecture";

export type FitItem = {
  id: FitId;
  index: string;
  label: string;
  detail: string;
  signal: string;
};

export const SUPPORT_FIT: FitItem[] = [
  {
    id: "firmware",
    index: "01",
    label: "Firmware & bring-up",
    detail:
      "Architecture and bring-up reviews before the next board spin — clocks, boot, peripherals, and the path from reset to a stable application image.",
    signal: "FW · REVIEW",
  },
  {
    id: "prototype",
    index: "02",
    label: "Prototype risk",
    detail:
      "Power, timing, interfaces, and manufacturability checks while the board is still on the bench — catch the failure modes that burn a spin.",
    signal: "HW · RISK",
  },
  {
    id: "architecture",
    index: "03",
    label: "System architecture",
    detail:
      "Embedded and product architecture decisions that need a written risk list you can act on the same week — not a slide deck of options.",
    signal: "SYS · DECIDE",
  },
];

export type TimelineSide = "before" | "after";

export type TimelineItem = {
  index: string;
  title: string;
  body: string;
};

export const SUPPORT_BEFORE: TimelineItem[] = [
  {
    index: "B1",
    title: "Brief",
    body: "Goal, constraints, and the decision you need unblocked — enough for the session to stay time-boxed.",
  },
  {
    index: "B2",
    title: "Artifacts",
    body: "Schematics, logs, or photos if you have them. Optional attachment on step 2 of the desk.",
  },
  {
    index: "B3",
    title: "Timezone",
    body: "Slots are scheduled in Africa/Lagos. Pick a window you can actually attend.",
  },
];

export const SUPPORT_AFTER: TimelineItem[] = [
  {
    index: "A1",
    title: "Calendar hold",
    body: "You receive a calendar invite when mail is configured — same confirmation path as production.",
  },
  {
    index: "A2",
    title: "Time-boxed session",
    body: "Brief and follow-up stay actionable. The desk is built for decisions, not open-ended workshops.",
  },
  {
    index: "A3",
    title: "Risk list",
    body: "Leave with clear next steps you can execute the same week — aligned with how Zeemkolo runs reviews.",
  },
];

export const SUPPORT_SCOPE = {
  eyebrow: "Scope",
  title: "Engineering sessions built for decisions, not slide decks",
  body: "Book when the next PCB spin, firmware bring-up, or architecture call cannot wait for guesswork. You pick an open window, share the brief, and leave with a clear risk list — the same path Zeemkolo uses for hardware prototyping, firmware review, and embedded systems consulting.",
  aside:
    "Best fit for teams that already have a schematic, a board, or a prototype under test and need an outside engineering eye before the schedule slips.",
} as const;
