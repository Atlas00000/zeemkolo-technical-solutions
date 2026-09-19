export type VoiceEntry = {
  id: string;
  index: string;
  quote: string;
  name: string;
  org: string;
  /** Short mono tag for the instrument */
  tag: string;
};

export const VOICES_CATALOG: VoiceEntry[] = [
  {
    id: "iot-power",
    index: "01",
    tag: "HW · IoT",
    quote:
      "Zeemkolo reviewed our power rail sequencing before the next PCB spin — we avoided a full board revision and shipped the pilot on schedule. The notes were specific enough for our layout team to act the same afternoon.",
    name: "Hardware engineering lead",
    org: "Industrial IoT product team",
  },
  {
    id: "academy",
    index: "02",
    tag: "ZMB · LAB",
    quote:
      "Zeemble’s lab-first curriculum finally matches how we train junior firmware engineers on the bench, not just in slides. Matric-gated labs keep progress honest without another LMS password maze.",
    name: "Academy coordinator",
    org: "Regional STEM training program",
  },
  {
    id: "consult",
    index: "03",
    tag: "ENG · SCOPE",
    quote:
      "The consultation was scoped and practical: schematic notes, firmware next steps, and a clear risk list we could act on the same week. No vague roadmap deck — just the decisions that unblocked the prototype.",
    name: "Founder / technical lead",
    org: "Consumer electronics prototype",
  },
];

export const VOICES_COPY = {
  eyebrow: "Client voices",
  title: "Trusted where the schematics meet the schedule",
  body: "Product teams and training programs work with Zeemkolo when the next spin, bring-up, or cohort cannot afford guesswork. These notes come from hardware leads, academy coordinators, and founders who needed a clear engineering partner.",
  note: "Consulting engagements and Zeemble labs share the same bench language — power, firmware, schematics, and the schedule that wraps around them.",
} as const;

/** Auto-advance interval (ms) when not paused */
export const VOICES_ROTATE_MS = 6500;
