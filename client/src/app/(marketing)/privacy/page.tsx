import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "Privacy | Zeemkolo",
  description: "Privacy policy stub for Zeemkolo Technical Solutions.",
};

export default function PrivacyPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl text-brand-ink">Privacy</h1>
        <p className="mt-4 text-brand-steel/80">
          This is a pre-launch stub. Zeemkolo Technical Solutions will publish a
          full privacy policy before public production cutover (Phase 8). Until
          then, contact{" "}
          <a
            className="text-brand-signal underline-offset-2 hover:underline"
            href="mailto:admin@zeemkolo.com"
          >
            admin@zeemkolo.com
          </a>{" "}
          for data requests.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-brand-steel">
          <li>Account identity is handled by Clerk.</li>
          <li>Application data is stored in our Postgres database.</li>
          <li>Optional object storage uses Cloudflare R2 when configured.</li>
        </ul>
      </main>
    </AppShell>
  );
}
