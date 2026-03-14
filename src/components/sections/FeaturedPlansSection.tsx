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
                setPlanos(data as Plano[] || []);
            }
            setLoading(false);
        };

        fetchPlanos();
    }, [supabase]);

    // Empty State Component
    const EmptyState = () => (
        <div className="text-center py-20">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-brand-blue" />
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">
                        Próximamente: Catálogo de Gala en Preparación
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Estamos curando nuestra primera colección de arquitectura disruptiva. 
                        Suscríbete para el lanzamiento.
                    </p>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link
                        href="/contacto"
                        className="btn-primary px-6 py-3"
                    >
                        <Mail className="w-4 h-4" />
                        Suscribirse al lanzamiento
                    </Link>
                    <Link
                        href="/catalogo"
                        className="btn-secondary px-6 py-3"
                    >
                        Explorar plataforma
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );

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
                    {planos.length > 0 && (
                        <Link
                            href="/catalogo"
                            className="btn-secondary text-sm px-5 py-2.5 whitespace-nowrap"
                        >
                            Ver todo el catálogo
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
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
