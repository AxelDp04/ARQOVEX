import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import FeaturedPlansSection from "@/components/sections/FeaturedPlansSection";
import StatsSection from "@/components/sections/StatsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";

import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredPlanos } = await supabase
    .from("planos")
    .select("*, categoria:categorias(*), galeria:galeria_propiedades!fk_galeria_plano(imagen_url)")
    .eq("destacado", true)
    .eq("disponible", true)
    .eq("estado_revision", "publicado")
    .limit(3)
    .order("created_at", { ascending: false });

  return (
    <MainLayout>
      <HeroSection />
      <StatsSection />
      <FeaturedPlansSection initialPlanos={featuredPlanos || []} />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </MainLayout>
  );
}
