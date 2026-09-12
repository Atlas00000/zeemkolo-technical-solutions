import { AppShell } from "@/components/shell/AppShell";
import { HeroSection } from "@/components/marketing/HeroSection";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { ZeembleSpotlight } from "@/components/marketing/ZeembleSpotlight";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { ConsultationCta } from "@/components/marketing/ConsultationCta";

export default function MarketingHomePage() {
  return (
    <AppShell variant="marketing">
      <main>
        <HeroSection />
        <ServicesGrid />
        <ZeembleSpotlight />
        <TestimonialsSection />
        <ConsultationCta />
      </main>
    </AppShell>
  );
}
