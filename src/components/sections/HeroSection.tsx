"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { LOGO_SRC } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function HeroSection() {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchHeroBg = async () => {
      const { data } = await supabase
        .from("planos")
        .select("galeria:galeria_propiedades(imagen_url)")
        .eq("destacado", true)
        .eq("estado_revision", "publicado")
        .limit(1)
        .single();
      
      if (data?.galeria?.[0]?.imagen_url) {
        setBgImage(data.galeria[0].imagen_url);
      }
    };
    fetchHeroBg();
  }, [supabase]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#020408]">
      {/* Dynamic Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {bgImage ? (
          <div className="relative w-full h-full scale-105 animate-ken-burns">
            <Image
              src={bgImage}
              alt="Featured Property"
              fill
              className="object-cover opacity-75 saturate-[1.2] brightness-[1.05] contrast-[1.02] object-center"
              priority
              quality={100}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#050810]" />
        )}
        
        {/* Grain Texture for Professional Look */}
        <div className="absolute inset-0 noise-bg mix-blend-soft-light opacity-20 pointer-events-none" />

        {/* Overlays - Multi-layer for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020408] via-transparent to-[#020408] opacity-90 transition-opacity duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B] via-transparent to-transparent opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020408_100%)] opacity-50" />
      </div>

      <div className="container-section relative z-10 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4D94FF]">
                República Dominicana
              </p>
              <div className="w-12 h-px bg-brand-blue" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-white text-balance">
              Excelencia en diseño{" "}
              <span className="bg-gradient-to-r from-[#0066FF] via-[#4D94FF] to-white bg-clip-text text-transparent">
                y gestión inmobiliaria
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-md leading-relaxed text-balance">
              Consultoría de ingeniería y arquitectura. Innovación y estándares técnicos en cada proyecto.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#0066FF] to-[#0044CC] text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,102,255,0.4)] hover:scale-[1.02]"
              >
                Ver catálogo
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-gray-300 font-semibold rounded-lg transition-all duration-300 hover:border-[#0066FF]/50 hover:text-white hover:bg-white/5"
              >
                Proyecto a medida
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] md:w-[420px] md:h-[420px] rounded-[2rem] border border-white/[0.08] bg-white/[0.02] flex items-center justify-center backdrop-blur-md animate-float shadow-[0_0_80px_rgba(0,102,255,0.1)]">
              {/* Dynamic Aura */}
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#0066FF]/20 to-transparent opacity-60 animate-pulse-blue" />
              <div className="absolute -inset-16 bg-[#0066FF]/5 blur-[80px] rounded-full opacity-40 animate-pulse pointer-events-none" />
              
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 transition-transform duration-700 hover:scale-110">
                <Image
                  src="/Logo.png"
                  alt="ARQOVEX"
                  fill
                  sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
                  className="object-contain"
                  priority
                  quality={100}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-500">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}
