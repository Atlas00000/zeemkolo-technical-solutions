import { SERVICE_TYPES, type ServiceType } from "@/components/consultation/types";

export type ServiceEntry = {
  id: ServiceType;
  index: string;
  title: ServiceType;
  body: string;
  /** Secondary wrapped detail on the stage */
  detail: string;
  /** Short instrument label shown on the stage */
  mark: string;
};

export const SERVICES_HEADER = {
  eyebrow: "Services",
  title: "Engineering support from bench to shipment",
  body: "Zeemkolo Technical Solutions partners with teams shipping real hardware — the same service catalog you select when you book a consultation. Each engagement is scoped, time-boxed, and written for decisions you can act on the same week.",
  note: "From first schematic review to firmware architecture and system integration, we stay close to the bench: power, timing, communications, and the risk that usually appears after the next PCB spin.",
} as const;

const BODIES: Record<ServiceType, string> = {
  "Hardware Prototyping":
    "Schematic review, PCB guidance, and lab validation so first boards behave in the field — not just on the screen.",
  "Firmware Review":
    "MCU bring-up, peripheral drivers, and production-ready firmware architecture for shipping products.",
  "Product Design":
    "Scoped sessions for product architecture, risk review, and technical decisions from bench to shipment.",
  "Embedded Systems Consulting":
    "Deep-dive support on power, timing, communications, and system integration for complex embedded builds.",
  "General Engineering Inquiry":
    "A clear working session when you need an experienced engineering partner to unblock the next decision.",
};

const DETAILS: Record<ServiceType, string> = {
  "Hardware Prototyping":
    "We walk power rails, interfaces, and bring-up risks before you commit copper — so pilot hardware lands closer to production intent and fewer spins die on the bench.",
  "Firmware Review":
    "From reset vector to peripheral maps and interrupt strategy, we pressure-test the firmware path your product will actually run in the field, not only in the debugger.",
  "Product Design":
    "Architecture trade-offs, schedule risk, and a written decision list you can hand to firmware, hardware, and leadership without another vague workshop.",
  "Embedded Systems Consulting":
    "System-level integration across sensors, radios, power domains, and timing budgets — the failure modes that show up when modules meet on one board.",
  "General Engineering Inquiry":
    "Bring the schematic, the log, or the stuck decision. We leave you with a prioritized next step, not a slide deck of options.",
};

const MARKS: Record<ServiceType, string> = {
  "Hardware Prototyping": "HW.PROTO",
  "Firmware Review": "FW.REV",
  "Product Design": "PD.ARCH",
  "Embedded Systems Consulting": "EMB.SYS",
  "General Engineering Inquiry": "ENG.Q",
};

/** Catalog hugs backend SERVICE_TYPES order — no invented services. */
export const SERVICES_CATALOG: ServiceEntry[] = SERVICE_TYPES.map(
  (title, i) => ({
    id: title,
    index: String(i + 1).padStart(2, "0"),
    title,
    body: BODIES[title],
    detail: DETAILS[title],
    mark: MARKS[title],
  }),
);
