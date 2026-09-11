/**
 * Security headers for the Next.js client (applied via next.config.ts).
 * Keep CSP reasonably open for Clerk + Next assets; tighten at launch if needed.
 */
export const clientSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "0" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
] as const;
