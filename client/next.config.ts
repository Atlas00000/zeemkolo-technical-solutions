import type { NextConfig } from "next";
import { clientSecurityHeaders } from "./src/lib/security-headers";

/**
 * Legacy barcode / QR / Canva path map.
 * Labels already resolve to zeemkolo.com — these 301s land scanners on app routes.
 * Replace placeholder paths with the real inventory from QR photo scans before launch.
 * See docs/dev-notes/qr-redirect-inventory.md
 */
const qrRedirects: { source: string; destination: string }[] = [
  { source: "/qr/placeholder", destination: "/" },
  { source: "/qr/home", destination: "/" },
  { source: "/qr/consult", destination: "/consultation" },
  { source: "/qr/consultation", destination: "/consultation" },
  { source: "/qr/zeemble", destination: "/zeemble" },
  { source: "/qr/course", destination: "/zeemble" },
  { source: "/qr/library", destination: "/zeemble" },
  { source: "/qr/store", destination: "/store" },
  { source: "/qr/shop", destination: "/store" },
  { source: "/qr/kit", destination: "/store" },
  { source: "/qr/forum", destination: "/forum" },
  { source: "/canva", destination: "/" },
  { source: "/canva/:path*", destination: "/" },
  { source: "/home", destination: "/" },
  { source: "/services", destination: "/consultation" },
  { source: "/book", destination: "/consultation" },
  { source: "/academy", destination: "/zeemble" },
  { source: "/shop", destination: "/store" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return qrRedirects.map((rule) => ({
      ...rule,
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: clientSecurityHeaders.map((h) => ({
          key: h.key,
          value: h.value,
        })),
      },
    ];
  },
};

// Sentry: use instrumentation*.ts + optional DSN (no withSentryConfig webpack plugin —
// the plugin's clientTraceMetadata/tunnel interfered with local next dev).
export default nextConfig;
