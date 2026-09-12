import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "Terms | Zeemkolo",
  description: "Terms of use stub for Zeemkolo Technical Solutions.",
};

export default function TermsPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl text-brand-ink">Terms of use</h1>
        <p className="mt-4 text-brand-steel/80">
          This is a pre-launch stub. Binding terms will be published before Phase
          8 production cutover. Services, Zeemble content, and store purchases
          are provided as-is during development.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-brand-steel">
          <li>Do not share matric codes or download tokens.</li>
          <li>Payment providers remain placeholders until selection is final.</li>
          <li>
            Questions:{" "}
            <a
              className="text-brand-signal underline-offset-2 hover:underline"
              href="mailto:admin@zeemkolo.com"
            >
              admin@zeemkolo.com
            </a>
          </li>
        </ul>
      </main>
    </AppShell>
  );
}
