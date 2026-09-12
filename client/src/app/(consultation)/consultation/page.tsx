import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { ConsultationBookingWizard } from "@/components/consultation/ConsultationBookingWizard";

export const metadata: Metadata = {
  title: "Book a consultation | Zeemkolo",
  description:
    "Book an engineering consultation with Zeemkolo Technical Solutions.",
};

export default function ConsultationPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
          Zeemkolo Technical Solutions
        </p>
        <h1 className="mt-3 font-display text-4xl text-brand-ink">
          Book a consultation
        </h1>
        <p className="mt-3 max-w-2xl text-brand-steel/80">
          Choose a slot, share your project brief, and receive a calendar
          confirmation.
        </p>
        <div className="mt-10">
          <ConsultationBookingWizard />
        </div>
      </main>
    </AppShell>
  );
}
