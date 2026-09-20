/**
 * Parse CORS_ORIGIN env — comma-separated exact origins.
 * Example: `https://zeemkolo.com,https://www.zeemkolo.com,http://localhost:3000`
 */
export function parseCorsOrigins(raw: string): string | string[] | boolean {
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return false;
  if (parts.includes("*")) return true;
  if (parts.length === 1) return parts[0]!;
  return parts;
}
