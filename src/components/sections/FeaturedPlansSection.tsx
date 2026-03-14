"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PlanoCard from "@/components/ui/PlanoCard";
import type { Plano } from "@/types";

// Sample fallback data if DB is empty
const samplePlanos: Plano[] = [
    {
        id: "sample-1",
        titulo: "Residencia Contemporánea 180m²",
        descripcion: "Diseño moderno con amplios espacios abiertos, sala integrada y terraza.",
        precio: 299,
        precio_original: 399,
        metros_cuadrados: 180,
        habitaciones: 3,
        banos: 2,
        pisos: 1,
        categoria_id: "moderna",
        imagen_url: "",
        estilo: "Contemporáneo",
        destacado: true,
        disponible: true,
        created_at: new Date().toISOString(),
        categoria: { id: "moderna", nombre: "Moderna", slug: "moderna" },
    },
    {
        id: "sample-2",
        titulo: "Villa Minimalista 250m²",
        descripcion: "Arquitectura minimalista de dos plantas con piscina y jardín.",
        precio: 499,
        metros_cuadrados: 250,
        habitaciones: 4,
        banos: 3,
        pisos: 2,
        categoria_id: "minimalista",
        imagen_url: "",
        estilo: "Minimalista",
        destacado: true,
        disponible: true,
        created_at: new Date().toISOString(),
        categoria: { id: "min", nombre: "Minimalista", slug: "minimalista" },
    },
    {
        id: "sample-3",
        titulo: "Casa Colonial 320m²",
        descripcion: "Estilo colonial venezolano con patio central y techos altos.",
        precio: 649,
        precio_original: 799,
        metros_cuadrados: 320,
        habitaciones: 5,
        banos: 4,
        pisos: 2,
        categoria_id: "colonial",
        imagen_url: "",
        estilo: "Colonial",
        destacado: true,
        disponible: true,
        created_at: new Date().toISOString(),
        categoria: { id: "col", nombre: "Colonial", slug: "colonial" },
    },
];

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
                .limit(6)
                .order("created_at", { ascending: false });

            if (error || !data || data.length === 0) {
                setPlanos(samplePlanos);
            } else {
                setPlanos(data as Plano[]);
            }
            setLoading(false);
        };

        fetchPlanos();
    }, [supabase]);

    return (
        <section className="relative py-24 overflow-hidden">
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-section relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="badge-blue w-fit">Planos Destacados</div>
                        <h2 className="section-title">
                            Nuestros{" "}
                            <span className="bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent">
                                Mejores Diseños
                            </span>
                        </h2>
                    </div>
                    <Link
                        href="/catalogo"
                        className="btn-secondary text-sm px-5 py-2.5 whitespace-nowrap"
                    >
                        Ver todo el catálogo
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                    </div>
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
