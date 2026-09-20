/** Shared primary + legal links for desktop and mobile shell chrome. */

export const PRIMARY_NAV_LINKS = [
  { href: "/consultation", label: "Consultation" },
  { href: "/zeemble", label: "Zeemble" },
  { href: "/store", label: "Store" },
  { href: "/forum", label: "Forum" },
] as const;

export const FOOTER_NAV_LINKS = [
  ...PRIMARY_NAV_LINKS,
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export const LEGAL_NAV_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;
