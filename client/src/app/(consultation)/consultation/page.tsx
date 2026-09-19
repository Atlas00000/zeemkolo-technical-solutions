import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { ConsultationBookingWizard } from "@/components/consultation/ConsultationBookingWizard";
import { BookingSupport } from "@/components/consultation/booking";

export const metadata: Metadata = {
  title: "Book a consultation | Zeemkolo",
  description:
    "Book an engineering consultation with Zeemkolo Technical Solutions.",
};

export default function ConsultationPage() {
  return (
    <AppShell>
      <main>
        <ConsultationBookingWizard />
        <BookingSupport />
      </main>
    </AppShell>
  );
}
