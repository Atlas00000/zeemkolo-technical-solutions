export const SERVICE_TYPES = [
  "Hardware Prototyping",
  "Firmware Review",
  "Product Design",
  "Embedded Systems Consulting",
  "General Engineering Inquiry",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];
