import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Placeholder QR / barcode redirects — replace with real inventory before Day 23.
  async redirects() {
    return [
      {
        source: "/qr/placeholder",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
