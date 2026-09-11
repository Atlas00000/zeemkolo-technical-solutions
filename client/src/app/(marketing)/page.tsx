import { HeroSection } from "@/components/marketing/HeroSection";
import { ServicesGrid } from "@/components/marketing/ServicesGrid";
import { ZeembleSpotlight } from "@/components/marketing/ZeembleSpotlight";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { ConsultationCta } from "@/components/marketing/ConsultationCta";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { SiteNav } from "@/components/marketing/SiteNav";

export default function MarketingHomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <HeroSection />
        <ServicesGrid />
        <ZeembleSpotlight />
        <TestimonialsSection />
        <ConsultationCta />
      </main>
      <MarketingFooter />
    </>
  );
}
