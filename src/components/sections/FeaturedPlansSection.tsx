"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Calendar, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PlanoCard from "@/components/ui/PlanoCard";
import type { Plano } from "@/types";

export default function FeaturedPlansSection() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPlanos = async () => {
      const { data, error } = await supabase
        .from("planos")
        .select("*, categoria:categorias(*), galeria:galeria_propiedades(imagen_url)")
        .eq("destacado", true)
        .eq("disponible", true)
        .limit(3)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching planos:", error);
      } else {
        setPlanos((data as Plano[]) || []);
      }
      setLoading(false);
    };

    fetchPlanos();
  }, [supabase]);

  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="w-14 h-14 rounded-full bg-[#0066FF]/10 flex items-center justify-center mx-auto">
          <Calendar className="w-7 h-7 text-[#4D94FF]" />
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-display font-semibold text-white">
            Próximamente: nuevos proyectos
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Estamos preparando la primera colección. Suscríbete para el lanzamiento.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0066FF] text-white font-semibold rounded-lg hover:bg-[#0052cc] transition-colors"
          >
            <Mail className="w-4 h-4" />
            Suscribirse
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/20 text-gray-300 font-semibold rounded-lg hover:border-[#0066FF]/50 hover:text-white transition-colors"
          >
            Ver plataforma
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[var(--page-bg)]">
      <div className="container-section relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4D94FF] mb-2">
              Destacados
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Nuestros{" "}
              <span className="bg-gradient-to-r from-[#0066FF] to-[#4D94FF] bg-clip-text text-transparent">
                mejores diseños
              </span>
            </h2>
          </div>
          {planos.length > 0 && (
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#4D94FF] hover:text-white transition-colors w-fit"
            >
              Ver catálogo
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
          </div>
        ) : planos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {planos.map((plano) => (
              <PlanoCard key={plano.id} plano={plano} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
