import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import FeaturedPlansSection from "@/components/sections/FeaturedPlansSection";
import StatsSection from "@/components/sections/StatsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <FeaturedPlansSection />
      <TestimonialsSection />
      <CTASection />
    </MainLayout>
  );
}
