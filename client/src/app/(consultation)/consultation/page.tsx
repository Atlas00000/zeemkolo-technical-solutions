import Link from "next/link";
import { ConsultationBookingWizard } from "@/components/consultation/ConsultationBookingWizard";

export default function ConsultationPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <p className="font-display text-sm tracking-[0.2em] text-brand-signal uppercase">
        Zeemkolo Technical Solutions
      </p>
      <h1 className="mt-3 font-display text-4xl text-brand-ink">Book a consultation</h1>
      <p className="mt-3 max-w-2xl text-brand-steel/80">
        Choose a slot, share your project brief, and receive a calendar confirmation.
      </p>
      <div className="mt-10">
        <ConsultationBookingWizard />
      </div>
      <Link href="/" className="mt-12 inline-block text-sm text-brand-signal underline-offset-2 hover:underline">
        ← Back home
      </Link>
    </main>
  );
}

