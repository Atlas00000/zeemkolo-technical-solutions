/**
 * C2 — public marketing asset paths (web-optimized copies under client/public).
 * Full-res originals remain in R2 under marketing/.
 */

export const MARKETING_ASSETS = {
  logo: "/marketing/brand/logo-icon.jpg",
  banners: {
    /** Primary — Zeemble / education (hero atmosphere) */
    zeemble: "/marketing/banners/zeemble-banner.jpg",
    /** Secondary — Smart Homes / consulting (spotlight) */
    smartHomes: "/marketing/banners/smart-homes-banner.jpg",
    /** Tertiary — consultation CTA field */
    banner3: "/marketing/banners/banner-3.jpg",
  },
} as const;
