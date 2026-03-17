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
          <div className="relative w-full h-full scale-110 animate-ken-burns">
            <Image
              src={bgImage}
              alt="Featured Property"
              fill
              className="object-cover opacity-40 grayscale-[20%]"
              priority
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#050810]" />
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020408]/80 via-transparent to-[#020408]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020408] via-transparent to-transparent opacity-60" />
        
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] bg-grid-drift"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
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
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-white">
              Excelencia en diseño{" "}
              <span className="bg-gradient-to-r from-[#0066FF] via-[#4D94FF] to-white bg-clip-text text-transparent">
                y gestión inmobiliaria
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
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
            <div className="flex items-center gap-8 pt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                <span>Planos certificados</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                <span>Entrega inmediata</span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[420px] md:h-[420px] rounded-3xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center backdrop-blur-md animate-float shadow-[0_0_50px_rgba(0,102,255,0.15)] overflow-hidden">
              {/* Dynamic Aura */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#0066FF]/20 to-transparent opacity-60 animate-pulse-blue" />
              <div className="absolute -inset-10 bg-[#0066FF]/5 blur-3xl rounded-full opacity-40 animate-pulse" />
              
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 transition-transform duration-700 hover:scale-110">
                <Image
                  src={LOGO_SRC}
                  alt="ARQOVEX"
                  fill
                  sizes="(max-width: 640px) 176px, (max-width: 768px) 224px, 256px"
                  className="object-contain drop-shadow-[0_0_30px_rgba(0,102,255,0.3)]"
                  priority
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
